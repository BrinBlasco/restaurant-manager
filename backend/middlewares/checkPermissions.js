const getUserRoles = require("../utilities/getEmployeeRoles");

const authorize =
    (requiredPermissions, mode = "any") =>
    async (req, res, next) => {
        const { id: userId } = req.user || {};
        const { companyId } = req.params || {};

        if (!userId || !companyId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        try {
            const userRoles = await getUserRoles(userId, companyId);

            const userPermissions = userRoles.flatMap((role) =>
                Object.keys(role.permissions).filter((permission) => role.permissions[permission])
            );

            const hasAccess =
                mode === "all"
                    ? requiredPermissions.every((permission) => userPermissions.includes(permission))
                    : requiredPermissions.some((permission) => userPermissions.includes(permission));

            return hasAccess ? next() : res.status(403).json({ message: "Forbidden" });
        } catch (err) {
            console.error(`Authorization error for user ${userId}:`, err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    };

module.exports = authorize;
