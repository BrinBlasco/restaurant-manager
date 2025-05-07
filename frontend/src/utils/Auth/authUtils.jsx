export const mergeRoles = (roles) => {
  return roles.reduce((acc, role) => {
    Object.keys(role).forEach((key) => {
      acc[key] = acc[key] || role[key];
    });
    return acc;
  }, {});
};

