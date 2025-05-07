const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
    const token = req.cookies?.auth_token;

    if (!token) {
        return res.status(401).json({
            error: "Unauthorized",
            message: "Authentication token is missing",
        });
    }

    jwt.verify(token, process.env.JWT_ACC_SECRET, (err, user) => {
        if (err) {
            console.error("[JWT ERROR]", err.message); // optional logging
            return res.status(401).json({
                error: "Unauthorized",
                message: "Invalid or expired token",
            });
        }

        req.user = user;
        next();
    });
};

module.exports = authenticateJWT;
