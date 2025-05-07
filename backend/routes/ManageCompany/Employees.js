const express = require("express");
const mongoose = require("mongoose");

const Role = require("../../models/Role");
const Company = require("../../models/Company");
const Employee = require("../../models/Employee");
const CompanyEmployee = require("../../models/CompanyEmployee");
const CompanyEmployeeRole = require("../../models/CompanyEmployeeRole");
const authenticateJWT = require("../utils/authenticateJWT");
const getUserRoles = require("../services/getEmployeeRoles");
const authorize = require("../utils/checkPermissions");

const router = express.Router({ mergeParams: true });

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

        if (!roleIds) return res.status(404).json({ message: "No roles given to assign" });

        for (const roleId of roleIds) {
            console.log(roleId);
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
        }

        await session.commitTransaction();

        return res.status(200).json({ message: "Employee successfully added to the company" });
    } catch (err) {
        await session.abortTransaction();
        console.error("Transaction failed: " + err);
        return res.status(500).json({ message: `Server error: ${err}` });
    } finally {
        await session.endSession();
    }
});

router.get("/", authenticateJWT, authorize(["editEmployees"]), async (req, res) => {
    const { companyId } = req.params;
    try {
        const company = await Company.findById(companyId);
        if (!company) return res.status(404).json({ message: "Company Not Found" });

        const companyEmployees = await CompanyEmployee.find({
            companyID: companyId,
        })
            .populate("employeeID")
            .lean();

        const employees = companyEmployees.map((ce) => ce.employeeID);

        return res.status(200).json({
            message: "Employees retrieved successfully",
            employees,
        });
    } catch (err) {
        console.error("Error fetching employees: ", err);
        res.status(500).json({ message: `Server error: ${err}` });
    }
});

// company/id/employee/id/roles
router.get("/:employeeId/roles", authenticateJWT, authorize(["editEmployees"]), async (req, res) => {
    const { employeeId, companyId } = req.params;
    try {
        const roles = await getUserRoles(employeeId, companyId);
        if (!roles.length) return res.status(404).json({ message: "Not found" });
        return res.status(200).json(roles);
    } catch (err) {
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});
module.exports = router;
