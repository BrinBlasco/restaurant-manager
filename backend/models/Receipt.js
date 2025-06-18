const mongoose = require("mongoose");

/**
 * A sub-schema to define each individual payment within a split bill.
 * We use { _id: true } (the default) so each payment split has a unique ID,
 * which is useful for updating its status individually (e.g., when a payment link is paid).
 */
const paymentSplitSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true,
        enum: ["card", "cash", "applepay", "venmo", "link_pending", "other"],
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["paid", "pending", "failed"],
        default: "paid",
    },
    payerIdentifier: {
        type: String,
    },
});

const receiptSchema = new mongoose.Schema(
    {
        subtotal: {
            type: Number,
            required: [true, "Subtotal is required."],
            min: 0,
        },
        taxAmount: {
            type: Number,
            required: [true, "Tax amount is required."],
            default: 0,
        },
        tipAmount: {
            type: Number,
            required: [true, "Tip amount is required."],
            default: 0,
        },
        finalAmount: {
            type: Number,
            required: [true, "Final amount is required."],
            min: 0,
        },

        paymentMode: {
            type: String,
            required: true,
            enum: ["sequential", "individual", "single"],
        },
        splitDetails: [paymentSplitSchema],

        status: {
            type: String,
            required: true,
            enum: ["paid", "partially_paid", "pending", "void"],
            default: "paid",
            index: true,
        },
        orderID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        companyID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },
        employeeID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        employeeName: {
            type: String,
        },
        dateIssued: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Receipt = mongoose.model("Receipt", receiptSchema);
module.exports = Receipt;
