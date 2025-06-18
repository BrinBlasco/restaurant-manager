const express = require("express");
const mongoose = require("mongoose");

const Role = require("../models/Role");
const Company = require("../models/Company");
const Employee = require("../models/Employee");
const CompanyEmployee = require("../models/CompanyEmployee");
const CompanyEmployeeRole = require("../models/CompanyEmployeeRole");
const authenticateJWT = require("../middlewares/authenticateJWT");
const getUserRoles = require("../utilities/getEmployeeRoles");
const authorize = require("../middlewares/checkPermissions");

const router = express.Router({ mergeParams: true });

router.get("/", authenticateJWT, authorize(["editEmployees"]), async (req, res) => {
    const { companyId } = req.params;

    try {
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company Not Found" });
        }

        const companyEmployees = await CompanyEmployee.find({
            companyID: companyId,
        })
            .populate("employeeID")
            .lean();

        if (!companyEmployees.length) {
            return res.status(200).json({
                message: "No employees found for this company",
                employees: [],
            });
        }

        const employeesWithRoles = await Promise.all(
            companyEmployees.map(async (companyEmployeeData) => {
                const employeeData = companyEmployeeData.employeeID;

                if (!employeeData || !employeeData._id) {
                    console.warn(`Could not find employee details for CompanyEmployee: ${companyEmployeeData._id}`);
                    return {
                        ...(employeeData || {}),
                        roles: [],
                        error: "Employee details missing",
                    };
                }

                const roles = await getUserRoles(employeeData._id, companyId);

                return {
                    ...employeeData,
                    hireDate: companyEmployeeData.hireDate,
                    salary: companyEmployeeData.salary,
                    terminationDate: companyEmployeeData.terminationDate,
                    roles: roles,
                };
            })
        );
        const finalEmployees = employeesWithRoles.filter((emp) => emp !== null && !emp.error);

        return res.status(200).json({
            message: "Employees and their roles retrieved successfully",
            employees: finalEmployees,
        });
    } catch (err) {
        console.error("Error fetching employees with roles: ", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.patch("/:employeeId", authenticateJWT, authorize(["editEmployees"]), async (req, res) => {
    const session = await mongoose.startSession();

    try {
        // const { companyId, employeeId } = req.params;
        const companyId = req.params.companyId;
        const employeeId = req.params.employeeId;
        const { updatedEmployee, updatedRoleIds } = req.body;

        if (!updatedEmployee && updatedRoleIds === undefined) {
            return res.status(400).json({ message: "No update data provided. Send updatedEmployee or updatedRoleIds." });
        }

        session.startTransaction();

        const companyEmployee = await CompanyEmployee.findOne({ employeeID: employeeId, companyID: companyId });
        console.log(employeeId, companyId);
        // {
        //     salary: updatedEmployee.salary,
        //     hireDate: updatedEmployee.hireDate,
        //     terminationDate: updatedEmployee.terminationDate,
        // },
        console.log(companyEmployee);
        if (!companyEmployee) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Employee not found in this company" });
        }
        await companyEmployee.updateOne(
            {
                salary: updatedEmployee.salary,
                hireDate: updatedEmployee.hireDate,
                terminationDate: updatedEmployee.terminationDate,
            },
            { session }
        );

        let assignedRoles;

        if (updatedRoleIds !== undefined) {
            await CompanyEmployeeRole.deleteMany({ companyEmployeeID: companyEmployee._id }, { session });

            if (updatedRoleIds.length > 0) {
                const validRoles = await Role.find({
                    _id: { $in: updatedRoleIds },
                    companyID: companyId,
                }).session(session);

                if (validRoles.length !== updatedRoleIds.length) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ message: "One or more provided role IDs are invalid." });
                }

                const newAssignments = validRoles.map((role) => ({
                    companyEmployeeID: companyEmployee._id,
                    roleID: role._id,
                    assignmentDate: new Date(),
                }));
                await CompanyEmployeeRole.insertMany(newAssignments, { session });
                assignedRoles = validRoles;
            } else {
                assignedRoles = [];
            }
        }

        await session.commitTransaction();

        if (assignedRoles === undefined) {
            const currentAssignments = await CompanyEmployeeRole.find({ companyEmployeeID: companyEmployee._id });
            const currentRoleIds = currentAssignments.map((a) => a.roleID);
            assignedRoles = await Role.find({ _id: { $in: currentRoleIds } });
        }

        return res.status(200).json({
            message: "Employee updated successfully",
            companyEmployee: companyEmployee,
            roles: assignedRoles,
        });
    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    } finally {
        session.endSession();
    }
});

// router.patch("/:employeeId", authenticateJWT, authorize(["editEmployees"]), async (req, res) => {
//     const session = await mongoose.startSession();

//     try {
//         const { companyId, employeeId } = req.params;
//         const { updatedEmployee, updatedRoleIds } = req.body;

//         if (!updatedEmployee || !Array.isArray(updatedRoleIds)) {
//             return res.status(400).json({ message: "Invalid request body." });
//         }

//         session.startTransaction();

//         const companyEmployee = await CompanyEmployee.findOneAndUpdate(
//             { employeeID: employeeId, companyID: companyId },
//             {
//                 $set: {
//                     salary: updatedEmployee.salary,
//                     hireDate: updatedEmployee.hireDate,
//                     terminationDate: updatedEmployee.terminationDate,
//                 },
//             },
//             { new: true, session }
//         );

//         if (!companyEmployee) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(404).json({ message: "Employee not found in this company" });
//         }

//         if (updatedRoleIds) {
//             await CompanyEmployeeRole.deleteMany({ companyEmployeeID: companyEmployee._id }, { session });

//             let assignedRoles = [];
//             if (updatedRoleIds.length > 0) {
//                 const validRoles = await Role.find({
//                     _id: { $in: updatedRoleIds },
//                     companyID: companyId,
//                 }).session(session);

//                 const newRoleAssignments = validRoles.map((role) => ({
//                     companyEmployeeID: companyEmployee._id,
//                     roleID: role._id,
//                     assignmentDate: new Date(),
//                 }));

//                 if (newRoleAssignments.length > 0) {
//                     await CompanyEmployeeRole.insertMany(newRoleAssignments, { session });
//                 }
//                 assignedRoles = validRoles;
//             }
//         }

//         await session.commitTransaction();

//         return res.status(200).json({
//             message: "Employee updated successfully",
//             employee: companyEmployee,
//             roles: assignedRoles,
//         });
//     } catch (err) {
//         await session.abortTransaction();

//         console.error(err);
//         return res.status(500).json({ message: "Server error during employee update" });
//     } finally {
//         session.endSession();
//     }
// });

// router.post("/:employeeUpid", authenticateJWT, authorize(["editEmployees"]), async (req, res) => {
//     const session = await mongoose.startSession();

//     try {
//         const { companyId, employeeUpid } = req.params;
//         const { roleIds } = req.body;

//         if (!Array.isArray(roleIds) || roleIds.length === 0) {
//             return res.status(400).json({ message: "Request body must include a non-empty 'roleIds' array." });
//         }

//         session.startTransaction();

//         const employee = await Employee.findOne({ upid: employeeUpid }).session(session);
//         if (!employee) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(404).json({ message: "Employee with that UPID not found" });
//         }

//         const roles = await Role.find({
//             _id: { $in: roleIds },
//             companyID: companyId,
//         }).session(session);

//         if (roles.length !== roleIds.length) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(400).json({ message: "One or more role IDs are invalid or do not belong to this company." });
//         }

//         const companyEmployee = new CompanyEmployee({
//             companyID: companyId,
//             employeeID: employee._id,
//         });
//         await companyEmployee.save({ session });

//         const newRoleAssignments = roles.map((role) => ({
//             companyEmployeeID: companyEmployee._id,
//             roleID: role._id,
//             assignmentDate: new Date(),
//         }));

//         if (newRoleAssignments.length > 0) {
//             await CompanyEmployeeRole.insertMany(newRoleAssignments, { session });
//         }

//         await session.commitTransaction();

//         const employeeResponse = employee.toObject();
//         employeeResponse.roles = roles;

//         return res.status(201).json({
//             message: "Employee successfully added to the company",
//             data: employeeResponse,
//         });
//     } catch (err) {
//         await session.abortTransaction();

//         if (err.code === 11000) {
//             return res.status(409).json({ message: "This employee is already in the company." });
//         }

//         console.error("Transaction failed: " + err);
//         return res.status(500).json({ message: "Server error" });
//     } finally {
//         session.endSession();
//     }
// });

router.post("/:employeeUpid", authenticateJWT, authorize(["editEmployees"]), async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { companyId, employeeUpid } = req.params;
        const roleIds = req.body;

        session.startTransaction();

        const employee = await Employee.findOne({ upid: employeeUpid });
        if (!employee) return res.status(404).json({ message: "Employee Not Found" });

        const company = await Company.findById(companyId);
        if (!company) return res.status(404).json({ message: "Company Not Found" });

        const companyEmployee = new CompanyEmployee({
            companyID: company._id,
            employeeID: employee._id,
        });
        await companyEmployee.save({ session });

        if (!Array.isArray(roleIds) || roleIds.length === 0) {
            return res.status(400).json({ message: "No roles given to assign" });
        }

        let roles = [];
        for (const roleId of roleIds) {
            const role = await Role.findOne({
                _id: roleId,
                companyID: companyId,
            });
            if (!role) continue;

            const companyEmployeeRole = new CompanyEmployeeRole({
                companyEmployeeID: companyEmployee._id,
                roleID: role._id,
                assigmentDate: Date.now(),
            });
            await companyEmployeeRole.save({ session });
            roles.push(role);
        }

        await session.commitTransaction();
        const empObj = employee.toObject();
        empObj.roles = roles;

        return res.status(200).json({ message: "Employee successfully added to the company", employee: empObj });
    } catch (err) {
        await session.abortTransaction();
        console.error("Transaction failed: " + err);
        return res.status(500).json({ message: "Server error" });
    } finally {
        await session.endSession();
    }
});

router.delete("/:employeeId", authenticateJWT, authorize(["editEmployees"]), async (req, res) => {
    const session = await mongoose.startSession();
    const { companyId, employeeId } = req.params;

    try {
        session.startTransaction();

        const companyEmployee = await CompanyEmployee.findOneAndDelete(
            {
                companyID: companyId,
                employeeID: employeeId,
            },
            { session }
        );

        if (!companyEmployee) return res.status(404).json({ message: "Company employee not found" });

        await CompanyEmployeeRole.deleteMany(
            {
                companyEmployeeID: companyEmployee._id,
            },
            { session }
        );

        await session.commitTransaction();

        return res.status(200).json({ message: "Successfully removed Employee from the company and thier associated roles" });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: "Server error" });
    } finally {
        await session.endSession();
    }
});

module.exports = router;
