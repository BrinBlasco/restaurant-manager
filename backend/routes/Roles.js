const express = require("express");
const mongoose = require("mongoose");

const Role = require("../models/Role");
const authenticateJWT = require("../middlewares/authenticateJWT");
const authorize = require("../middlewares/checkPermissions");
const CompanyEmployeeRole = require("../models/CompanyEmployeeRole");

const router = express.Router({ mergeParams: true });

router.get("/", authenticateJWT, authorize(["editRoles", "editEmployees"]), async (req, res) => {
    try {
        const roles = await Role.find({ companyID: req.params.companyId });
        if (roles.length === 0) return res.status(404).json({ error: "No roles found" });

        return res.json(roles);
    } catch (err) {
        return res.status(500).json({ message: "Server errror" });
    }
});

router.post("/", authenticateJWT, authorize(["editRoles"]), async (req, res) => {
    const session = await mongoose.startSession();
    const { name, description, permissions, companyID } = req.body;

    try {
        session.startTransaction();

        const newRole = new Role({
            name: name,
            description: description,
            permissions: permissions,
            companyID: companyID,
        });

        await newRole.save({ session });
        await session.commitTransaction();

        return res.status(200).json({ message: "Role created", item: newRole });
    } catch (err) {
        await session.abortTransaction();

        return res.status(500).json({ message: `Server error ${err}` });
    } finally {
        session.endSession();
    }
});

router.get("/:roleId", authenticateJWT, authorize(["editRoles", "editEmployees"]), async (req, res) => {
    try {
        const role = await Role.findOne({
            _id: req.params.roleId,
            companyID: req.params.companyId,
        });

        if (!role) return res.status(404).json({ error: "Role not found" });

        return res.status(200).json(role);
    } catch (err) {
        return res.status(500).json({ message: "Server errror" });
    }
});

router.put("/:roleId", authenticateJWT, authorize(["editRoles"]), async (req, res) => {
    try {
        const updatedRole = await Role.findOneAndUpdate(
            {
                _id: req.params.roleId,
                companyID: req.params.companyId,
            },
            req.body,
            { new: true }
        );

        if (!updatedRole) return res.status(404).json({ error: "Role not found" });

        return res.status(200).json({ message: "Role Updated", item: updatedRole });
    } catch (err) {
        return res.status(500).json({ message: "Server errror" });
    }
});

router.delete("/:roleId", authenticateJWT, authorize(["editRoles"]), async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const role = await Role.findOneAndDelete(
            {
                _id: req.params.roleId,
                companyID: req.params.companyId,
            },
            { session }
        );

        if (!role) return res.status(404).json({ error: "Role not found" });

        const deleteResult = await CompanyEmployeeRole.deleteMany({ roleID: role._id }, { session });
        if (!deleteResult) return res.status(404).json({ error: "CompanyRoleEmployees Not found" });

        await session.commitTransaction();
        return res.status(200).json({ message: "Role deleted and removed from associated employees" });
    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
