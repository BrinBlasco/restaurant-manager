const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    permissions: {
        editCompany: { type: Boolean, required: true },
        editEmployees: { type: Boolean, required: true },
        editRoles: { type: Boolean, required: true },
        editMenu: { type: Boolean, required: true },
        accessToKitchen: { type: Boolean, required: true },
        accessToWaiters: { type: Boolean, required: true },
    },

    companyID: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
});

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
