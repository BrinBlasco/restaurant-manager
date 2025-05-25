const CompanyEmployee = require("../models/CompanyEmployee");
const CompanyEmployeeRole = require("../models/CompanyEmployeeRole");
const Role = require("../models/Role");

const getUserRoles = async (employeeId, companyId) => {
    const companyEmployee = await CompanyEmployee.findOne({
        employeeID: employeeId,
        companyID: companyId,
    });

    if (!companyEmployee) return [];

    const companyEmployeeRoles = await CompanyEmployeeRole.find({
        companyEmployeeID: companyEmployee._id,
    });

    if (!companyEmployeeRoles.length) return [];

    const roles = await Role.find({
        _id: { $in: companyEmployeeRoles.map((r) => r.roleID) },
    });

    return roles;
};

module.exports = getUserRoles;
