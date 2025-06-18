const express = require("express");
const mongoose = require("mongoose");

const authenticateJWT = require("../middlewares/authenticateJWT");
const getUserRoles = require("../utilities/getEmployeeRoles");
const authorize = require("../middlewares/checkPermissions");
const Receipt = require("../models/Receipt");
const CompanyEmployee = require("../models/CompanyEmployee");
const Employee = require("../models/Employee");

const router = express.Router({ mergeParams: true });

router.get("/", authenticateJWT, authorize(["manageCompany", "accessToKitchen", "accessToWaiters"]), async (req, res) => {
    try {
        const { companyId } = req.params;

        const receipts = await Receipt.find({ companyID: companyId }).populate("orderID", "table items").sort({ dateIssued: -1 });

        return res.json({ message: "Successfully retrieved receipts.", receipts: receipts }).status(200);
    } catch (err) {
        console.error(err);
        return res.json({ message: "Server error" }).status(500);
    }
});

router.post("/", authenticateJWT, authorize(["manageCompany", "accessToKitchen", "accessToWaiters"]), async (req, res) => {
    try {
        const { companyId } = req.params;

        const { orderID, employeeID, subtotal, taxAmount, tipAmount, finalAmount, paymentMode, splitDetails } = req.body;

        if (!orderID || !employeeID || !finalAmount) {
            return res.status(400).json({ message: "Missing required fields in 'data' object." });
        }

        const employee = await Employee.findById(employeeID);
        console.log(employeeID);
        const employeeName = employee.firstName + " " + employee.lastName;
        console.log(employeeName);
        const receipt = new Receipt({
            companyID: companyId,
            orderID,
            employeeName,
            employeeID,
            subtotal,
            taxAmount,
            tipAmount,
            finalAmount,
            paymentMode,
            splitDetails,
            status: "paid",
        });

        const newReceipt = await receipt.save();

        return res.json({ message: "Successfully created receipt", newReceipt }).status(200);
    } catch (err) {
        console.error(err);
        return res.json({ message: "Server error" }).status(500);
    }
});

module.exports = router;
