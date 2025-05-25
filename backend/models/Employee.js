const mongoose = require("mongoose");
const addressSchema = require("./Schemas/AddressSchema");

const employeeSchema = new mongoose.Schema(
    {
        upid: { type: Number, required: true, uniquAe: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        address: addressSchema,
        account: {
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            lastLogin: { type: Date, default: Date.now },
        },
    },
    { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
