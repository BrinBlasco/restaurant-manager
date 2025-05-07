
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderDate: { type: Date, required: true, default: Date.now },
    status: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    comment: { type: String },
    totalAmount: { type: Number, required: true },

    companyEmployeeID: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyEmployee', required: true }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;