const mongoose = require("mongoose");

const companyEmployeeRoleSchema = new mongoose.Schema({
    companyEmployeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyEmployee",
        required: true,
    },
    roleID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true,
    },
    assigmentDate: { type: Date },
    assignedByUser: { type: mongoose.Types.ObjectId, ref: "Employee" },
});

companyEmployeeRoleSchema.index({ companyEmployeeID: 1, roleID: 1 }, { unique: true }); // composite key

const CopmanyEmployeeRole = mongoose.model("CompanyEmployeeRole", companyEmployeeRoleSchema);
module.exports = CopmanyEmployeeRole;
