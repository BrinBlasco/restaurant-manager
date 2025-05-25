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
    const { companyId } = req.params; // companyId comes from the route mount point

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
            companyEmployees.map(async (companyEmployeeRelation) => {
                const employeeData = companyEmployeeRelation.employeeID;

                if (!employeeData || !employeeData._id) {
                    console.warn(`Could not find employee details for CompanyEmployee: ${companyEmployeeRelation._id}`);
                    return {
                        ...(employeeData || {}),
                        _id: companyEmployeeRelation.employeeID_actual_if_not_populated,
                        roles: [],
                        error: "Employee details missing",
                    };
                }

                const roles = await getUserRoles(employeeData._id, companyId);

                return {
                    ...employeeData,
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

router.put("/:employeeId", authenticateJWT, authorize(["editEmployees"]), async (req, res) => {
    const { employeeId, companyId } = req.params;
    const { updatedEmployee } = req.body;

    try {
    } catch (err) {}
});

router.post("/:employeeUpid", authenticateJWT, authorize(["editEmployees"]), async (req, res) => {
    const session = await mongoose.startSession();

    const { companyId, employeeUpid } = req.params;
    const roleIds = req.body;

    try {
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
