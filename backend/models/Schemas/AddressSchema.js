const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    country: { type: String },
    address: { type: String },
    city: { type: String },
    zip: { type: String },
});
module.exports = addressSchema;
