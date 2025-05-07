
const mongoose = require('mongoose');
const addressSchema = require('./Schemas/AddressSchema');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    crn: { type: String, required: true, unique: true },
    vat: { type: String, required: true, unique: true },

    address: addressSchema,
    
    contactInfo: { 
        email: { type: String },
        phoneNumber: { type: String }
    },
    operatingHours: { type: Object },

    ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true }, 
});
const Company = mongoose.model('Company', companySchema);
module.exports = Company;
