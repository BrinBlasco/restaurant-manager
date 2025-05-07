// --- START OF FILE routes/OrderRoutes.js ---

const express = require("express");
const mongoose = require("mongoose");
const Order = require("../../models/Order");
const authenticateJWT = require("../utils/authenticateJWT");
const authorize = require("../utils/checkPermissions");

const router = express.Router({ mergeParams: true });

router.get("/", authenticateJWT, authorize(["accessToKitchen", "accessToWaiters"]), async (req, res) => {
    const { companyId } = req.params;
    const { status } = req.query;
    try {
        const queryCriteria = { companyId: companyId };
        if (status) {
            const statusArray = status.split(",").map((s) => s.trim());
            queryCriteria.status = { $in: statusArray };
        }
        const orders = await Order.find(queryCriteria).sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        return res.status(500).json({ message: `Server error: ${err.message}` });
    }
});
router.delete("/:orderId", authenticateJWT, authorize(["accessToKitchen", "accessToWaiters"]), async (req, res) => {
    const { companyId, orderId } = req.params;
    try {
        const order = await Order.findOneAndDelete({ _id: orderId, companyId: companyId });
        const io = req.app.get("socketio");
        if (!io) {
            console.warn("Socket.IO instance not found via app.get('socketio'). Cannot emit NEW_ORDER.");
            return;
        }
        const orderObject = order.toObject();
        console.log(`Emitting ORDER_DELETE to room: ${companyId}`);
        io.to(companyId).emit("ORDER_DELETE", orderObject);
    } catch (err) {
        console.error("Error fetching orders:", err);
        return res.status(500).json({ message: `Server error: ${err.message}` });
    }
    return res.status(200).json({ message: `Order ${orderId} Deleted` });
});

router.post("/", authenticateJWT, authorize(["accessToKitchen", "accessToWaiters"]), async (req, res) => {
    const { companyId } = req.params;
    const { table, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        // (!table)
        return res.status(400).json({ message: "Missing required fields: table and items array." });
    }

    try {
        const newOrder = new Order({
            companyId: companyId,
            table: table || null,
            items: items,
            status: "Pending",
        });
        const savedOrder = await newOrder.save();

        const io = req.app.get("socketio");
        if (!io) {
            console.warn("Socket.IO instance not found via app.get('socketio'). Cannot emit NEW_ORDER.");
            return;
        }
        const orderObject = savedOrder.toObject();
        console.log(`Emitting NEW_ORDER to room: ${companyId}`);
        io.to(companyId).emit("NEW_ORDER", orderObject);

        return res.status(201).json(savedOrder);
    } catch (err) {
        console.error("Error creating order:", err);
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: `Validation Error: ${err.message}` });
        }
        return res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

router.put("/:orderId/status", authenticateJWT, authorize(["accessToKitchen", "accessToWaiters"]), async (req, res) => {
    const { companyId, orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "Missing required field: status." });
    }
    const validStatuses = Order.schema.path("status").enumValues;
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status value: ${status}. Must be one of [${validStatuses.join(", ")}]` });
    }

    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId, companyId: companyId },
            { $set: { status: status } },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found or does not belong to this company." });
        }

        // --- WebSocket Emit ---
        // Access io using req.app.get('socketio')
        const io = req.app.get("socketio"); // <--- MODIFICATION
        if (io) {
            const orderObject = updatedOrder.toObject();
            console.log(`Emitting ORDER_UPDATE to room: ${companyId} for order ${orderId}`);
            io.to(companyId).emit("ORDER_UPDATE", orderObject); // Use the retrieved io instance
        } else {
            console.warn("Socket.IO instance not found via app.get('socketio'). Cannot emit ORDER_UPDATE.");
        }

        return res.status(200).json(updatedOrder);
    } catch (err) {
        console.error(`Error updating status for order ${orderId}:`, err);
        if (err.name === "CastError" && err.path === "_id") {
            return res.status(400).json({ message: "Invalid order ID format." });
        }
        return res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

// --- Optional: GET /api/company/:companyId/orders/:orderId ---
router.get("/:orderId", authenticateJWT, authorize(["accessToKitchen", "accessToWaiters"]), async (req, res) => {
    // ... (GET single order logic remains the same - no socket emission) ...
    const { companyId, orderId } = req.params;
    try {
        const order = await Order.findOne({ _id: orderId, companyId: companyId });
        if (!order) {
            return res.status(404).json({ message: "Order not found or does not belong to this company." });
        }
        return res.status(200).json(order);
    } catch (err) {
        console.error(`Error fetching order ${orderId}:`, err);
        if (err.name === "CastError" && err.path === "_id") {
            return res.status(400).json({ message: "Invalid order ID format." });
        }
        return res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

module.exports = router;

// --- END OF FILE routes/OrderRoutes.js ---
