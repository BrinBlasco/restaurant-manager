const express = require("express");
const mongoose = require("mongoose");

const MenuItem = require("../../models/MenuItem");
const authenticateJWT = require("../utils/authenticateJWT");
const authorize = require("../utils/checkPermissions");

const router = express.Router({ mergeParams: true });

router.get("/", authenticateJWT, authorize(["accessToKitchen", "accessToWaiters", "editMenu"]), async (req, res) => {
    try {
        const items = await MenuItem.find({ companyID: req.params.companyId });
        if (items.length === 0) return res.status(404).json({ error: "No items found" });

        return res.json(items);
    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err}` });
    }
});

router.post("/", authenticateJWT, authorize(["editMenu"]), async (req, res) => {
    const session = await mongoose.startSession();
    const { imgUrl, name, price, ingredients, recipe, description, type } = req.body;

    try {
        session.startTransaction();

        const newMenuItem = new MenuItem({
            imgUrl: imgUrl,
            name: name,
            price: price,
            ingredients: ingredients,
            recipe: recipe,
            description: description,
            type: type,
            companyID: req.params.companyId,
        });

        await newMenuItem.save({ session });
        await session.commitTransaction();

        return res.status(200).json({ message: "MenuItem created" });
    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json({ message: `Server error: ${err}` });
    } finally {
        session.endSession();
    }
});

router.get("/:id", authenticateJWT, authorize(["accessToKitchen", "accessToWaiters", "editMenu"]), async (req, res) => {
    try {
        const item = await MenuItem.findOne({
            _id: req.params.id,
            companyID: req.params.companyId,
        });
        if (!item) return res.status(404).json({ error: "Item not found" });

        return res.json(item);
    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err}` });
    }
});

router.put("/:id", authenticateJWT, authorize(["editMenu"]), async (req, res) => {
    try {
        const item = await MenuItem.findOne({
            _id: req.params.id,
            companyID: req.params.companyId,
        });
        if (!item) return res.status(404).json({ error: "Item not found" });

        await item.updateOne(req.body);

        return res.status(200).json({ message: "MenuItem Updated" });
    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err}` });
    }
});

router.delete("/:id", authenticateJWT, authorize(["editMenu"]), async (req, res) => {
    try {
        const item = await MenuItem.findOne({
            _id: req.params.id,
            companyID: req.params.companyId,
        });
        if (!item) return res.status(404).json({ error: "Item not found" });

        await MenuItem.findOneAndDelete({
            _id: req.params.id,
            companyID: req.params.companyId,
        });

        return res.status(200).json({ message: "MenuItem Deleted" });
    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err}` });
    }
});

module.exports = router;
