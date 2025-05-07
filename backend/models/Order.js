const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    note: { type: String },
});

const orderSchema = new mongoose.Schema(
    {
        table: { type: String },
        items: [orderItemSchema],
        status: {
            type: String,
            enum: ["Pending", "Preparing", "Ready", "Delivered"],
            default: "Pending",
            required: true,
            index: true,
        },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
