const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const authenticateJWT = require("./utils/authenticateJWT");

const Employee = require("../models/Employee");
const CompanyEmployee = require("../models/CompanyEmployee");

const router = express.Router();

router.post("/signup", async (req, res) => {
    const session = await mongoose.startSession();

    const { upid, firstName, lastName, email, phone, dateOfBirth, username, password } = req.body;
    try {
        session.startTransaction();

        const hashedPassword = await bcrypt.hash(password, 10);

        const employee = new Employee({
            upid: upid,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            dateOfBirth: dateOfBirth,
            account: {
                email: email,
                username: username,
                password: hashedPassword,
                lastLogin: null,
            },
        });
        await employee.save({ session });

        await session.commitTransaction();
        res.status(201).json({
            message: "User created",
            data: { upid: employee.upid, id: employee._id },
        });
    } catch (err) {
        await session.abortTransaction();

        console.error("Transaction failed: ", err);

        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(409).json({ message: `Duplicate value for ${field}` });
        }

        res.status(500).json({ message: `Error while creating user: ${err}` });

        //* ========================================================================
        //TODO ADD ERROR HANDLING SO DONT JUST THROW THE STACKTRACE BACK TO THE USER
        //? ONE OF THEM ALREADY DONE AND THIS IS PROBABLY IT FOR NOW
        //! DO NOT FORGET TO PUT OUT THE STACK TRACE WITH THE ****${ERR}**** ----------- VERY IMPORTANT FOR LATER ( IMMA REGRET WRITING THIS )
        // DO THIS MORE OR LESS EVEYRHWERE I GUESS
    } finally {
        await session.endSession();
    }
});

router.post("/login", async (req, res) => {
    const { login, password } = req.body;
    try {
        const user = await Employee.findOne({
            $or: [{ "account.username": login }, { "account.email": login }],
        });
        if (!user) return res.status(404).json({ message: "User not found" });

        const validPassword = await bcrypt.compare(password, user.account.password);
        if (!validPassword) return res.status(401).json({ message: "Invalid password" });

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACC_SECRET, {
            expiresIn: "14h",
        });

        res.cookie("auth_token", accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: "strict", //secure: process.env.NODE_ENV === 'development'
            secure: true,
        });

        user.account.lastLogin = Date.now();
        user.save();

        return res.status(200).json({ message: "Logged in successfully" }); //res.json({ token });
    } catch (err) {
        //return res.status(401).json({ message: 'Invalid credentials' }); //
        return res.status(500).send(`Server error: ${err}`);
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie("auth_token");
    return res.status(200).json({ message: "Logged out" });
});

router.get("/check", authenticateJWT, (req, res) => {
    return res.status(200).json({ message: "Authenticated" });
});

router.get("/protected/data", authenticateJWT, async (req, res) => {
    try {
        const employeeProfile = await Employee.findById(req.user.id);
        if (!employeeProfile) {
            return res.status(404).json({ message: "Employee profile not found" });
        }

        const companiesWithRoles = await CompanyEmployee.aggregate([
            // Match CompanyEmployee records for this employee
            { $match: { employeeID: employeeProfile._id } },

            // Lookup company details
            {
                $lookup: {
                    from: "companies",
                    localField: "companyID",
                    foreignField: "_id",
                    as: "company",
                },
            },
            { $unwind: "$company" },

            // Lookup role assignments
            {
                $lookup: {
                    from: "companyemployeeroles",
                    localField: "_id",
                    foreignField: "companyEmployeeID",
                    as: "roleAssignments",
                },
            },
            {
                $unwind: {
                    path: "$roleAssignments",
                    preserveNullAndEmptyArrays: true,
                },
            }, // Include companies with no roles

            // Lookup role details
            {
                $lookup: {
                    from: "roles",
                    localField: "roleAssignments.roleID",
                    foreignField: "_id",
                    as: "role",
                },
            },
            { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },

            // Group by companyID, collecting company details and roles
            {
                $group: {
                    _id: "$companyID",
                    company: { $first: "$company" },
                    roles: {
                        $push: {
                            roleName: "$role.name",
                            permissions: "$role.permissions",
                        },
                    },
                },
            },

            // Project the final structure
            {
                $project: {
                    _id: 0,
                    company: 1,
                    roles: 1,
                },
            },
        ]);

        const companiesWithRolesFormatted = companiesWithRoles.map((company) => {
            const rolesObject = {};
            company.roles.forEach((role, index) => {
                if (role.roleName) {
                    // Skip empty roles due to preserveNullAndEmptyArrays
                    rolesObject[`role${index + 1}`] = {
                        roleName: role.roleName,
                        permissions: role.permissions,
                    };
                }
            });
            return {
                ...company.company, // Spread company fields (_id, name, etc.)
                roles: rolesObject,
            };
        });

        // Step 4: Return the response
        return res.status(200).json({
            employee: {
                _id: employeeProfile._id,
                upid: employeeProfile.upid,
                firstName: employeeProfile.firstName,
                lastName: employeeProfile.lastName,
                email: employeeProfile.email,
                phone: employeeProfile.phone,
                dateOfBirth: employeeProfile.dateOfBirth,
                address: employeeProfile.address,
                account: {
                    username: employeeProfile.account.username,
                    email: employeeProfile.account.email,
                },
            },
            companies: companiesWithRolesFormatted,
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" + error });
    }
});

module.exports = router;
