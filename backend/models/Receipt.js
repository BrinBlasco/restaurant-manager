const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
    {
        dateIssued: { type: Date, required: true, default: Date.now },
        status: { type: String, required: true },
        paymentMethod: { type: String, required: true },

        totalAmount: { type: Number, required: true },
        taxAmount: { type: Number, required: true },
        tipAmount: { type: Number, required: true },
        discountAmount: { type: Number, required: true },
        finalAmount: { type: Number, required: true },

        orderID: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
        companyEmployeeID: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyEmployee", required: true },
    },
    { timestamps: true }
);

const Receipt = mongoose.model("Receipt", receiptSchema);
module.exports = Receipt;
