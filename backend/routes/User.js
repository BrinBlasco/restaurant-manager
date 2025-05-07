const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const authenticateJWT = require("./utils/authenticateJWT");

const Employee = require("../models/Employee");
const router = express.Router({ mergeParams: true });

router.get("/:userId", async (req, res) => {
    try {
        const user = await Employee.findById(req.params.userId);

        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err}` });
    }
});

router.patch("/:userId/edit/:segment", authenticateJWT, async (req, res) => {
    try {
        const userId = req.params.userId.toString();
        const loggedInUserId = req.user.id.toString();

        if (loggedInUserId !== userId) return res.status(403).json({ message: "Forbidden" });

        const filter = { _id: req.params.userId };
        const options = { new: true, runValidators: true };
        let update = {};

        switch (req.params.segment) {
            case "personalDetails":
                const { upid, firstName, lastName, phone, dateOfBirth } = req.body;
                update = {
                    upid: upid,
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone,
                    dateOfBirth: dateOfBirth,
                };
                break;

            case "accountDetails":
                const { username, email } = req.body;
                update = {
                    $set: {
                        email: email,
                        "account.username": username,
                        "account.email": email,
                    },
                };
                break;

            case "address":
                const { country, address, zip, city } = req.body;
                update = {
                    address: {
                        country: country,
                        address: address,
                        zip: zip,
                        city: city,
                    },
                };
                break;

            case "password":
                const { currentPassword, newPassword, confirmPassword } = req.body;

                const user = await Employee.findById(userId);
                if (!user) return res.status(404).json({ message: "User not found" });

                const validPassword = await bcrypt.compare(currentPassword, user.account.password);
                if (!validPassword) return res.status(401).json({ message: "Wrong password" });

                if (newPassword !== confirmPassword) return res.status(500).json({ message: "Passwords do not match." });

                const hashedPassword = await bcrypt.hash(newPassword, 10);
                update = {
                    $set: {
                        "account.password": hashedPassword,
                    },
                };
                break;

            default:
                return res.status(400).json({ message: "Segment does not exist" });
        }

        const result = await Employee.updateOne(filter, update, options);
        if (result.modifiedCount === 0) return res.status(400).json({ message: "No changes made" });

        return res.status(200).json({
            segment: req.params.segment,
            update: update,
        });
    } catch (err) {
        return res.status(500).json({ message: `Server error ${err}` });
    }
});

router.get("/:userId/address", authenticateJWT, async (req, res) => {
    try {
        const userId = req.params.userId.toString();
        const loggedInUserId = req.user.id.toString();

        if (loggedInUserId !== userId) return res.status(403).json({ message: "Forbidden" });

        const user = await Employee.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        return res.status(200).json(user.address);
    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err}` });
    }
});

module.exports = router;
