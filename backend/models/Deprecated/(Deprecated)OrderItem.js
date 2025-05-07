
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    specialNotes: { type: String, required: true },

    orderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    menuItemID: {type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true }
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
module.exports = OrderItem;