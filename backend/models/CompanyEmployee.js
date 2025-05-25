const mongoose = require("mongoose");

const companyEmployeeSchema = new mongoose.Schema(
    {
        employeeID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },
        companyID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        salary: { type: Number },
        hireDate: { type: Date },
        terminationDate: { type: Date },
    },
    { timestamps: true }
);

companyEmployeeSchema.index({ employeeID: 1, companyID: 1 }, { unique: true });
const CompanyEmployee = mongoose.model("CompanyEmployee", companyEmployeeSchema);
module.exports = CompanyEmployee;
