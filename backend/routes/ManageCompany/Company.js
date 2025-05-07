const express = require("express");
const mongoose = require("mongoose");

const Company = require("../../models/Company");
const CompanyEmployee = require("../../models/CompanyEmployee");
const CompanyEmployeeRole = require("../../models/CompanyEmployeeRole");

const Role = require("../../models/Role");
const authenticateJWT = require("../utils/authenticateJWT");
const authorize = require("../utils/checkPermissions");

const router = express.Router({ mergeParams: true });

router.post("/", authenticateJWT, async (req, res) => {
    const session = await mongoose.startSession();

    const { identifiers, address } = req.body;

    try {
        session.startTransaction();

        const newCompany = new Company({
            crn: identifiers.crn,
            vat: identifiers.vat,
            name: identifiers.companyName,
            ownerID: identifiers.owner,
            address: {
                country: address.city,
                address: address.address,
                zip: address.zip,
                city: address.city,
            },
        });

        const addedCompany = await newCompany.save({ session });

        const newCompanyEmployee = new CompanyEmployee({
            companyID: addedCompany._id,
            employeeID: identifiers.owner,
        });
        const addedCompanyEmployee = await newCompanyEmployee.save({ session });

        const newRole = new Role({
            name: "Owner",
            description: "Access to everything, all of the permissions. Owner.",
            permissions: {
                accessToKitchen: true,
                accessToWaiters: true,
                editEmployees: true,
                editCompany: true,
                editMenu: true,
                editRoles: true,
            },
            companyID: addedCompany._id,
        });
        const addedRole = await newRole.save({ session });

        const newCompanyEmployeeRole = new CompanyEmployeeRole({
            companyEmployeeID: addedCompanyEmployee._id,
            roleID: addedRole._id,
            assigmentDate: Date.now(),
        });

        await newCompanyEmployeeRole.save({ session });

        await session.commitTransaction();
        return res.status(200).json({ message: "Company created" });
    } catch (err) {
        await session.abortTransaction();

        return res.status(500).json({ message: `Error while creating the company ${err}` });
    } finally {
        session.endSession();
    }
});

router.get("/:companyId", authenticateJWT, authorize(["editCompany"]), async (req, res) => {
    try {
        const company = await Company.findById(req.params.companyId);
        if (!company) return res.status(404).json({ error: "Company not found" });

        return res.json(company);
    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err}` });
    }
});

router.patch("/:companyId/edit/:segment", authenticateJWT, authorize(["editCompany"]), async (req, res) => {
    try {
        const filter = { _id: req.params.companyId };
        const options = { runValidators: true };
        let update = {};

        switch (req.params.segment) {
            case "companyDetails":
                const { identifiers, address } = req.body;
                update = {
                    name: identifiers.companyName,
                    vat: identifiers.vat,
                    crn: identifiers.crn,
                    address: address,
                };
                break;

            case "contactInfo":
                update = { contactInfo: req.body };
                break;

            case "workingHours":
                update = { operatingHours: req.body };
                break;

            default:
                return res.status(400).json({ message: "Invalid segment" });
        }

        await Company.updateOne(filter, update, options);
        return res.status(200).json({ message: `${req.params.segment} updated` });
    } catch (err) {
        return res.status(500).json({ message: `Server error ${err}` });
    }
});

module.exports = router;
