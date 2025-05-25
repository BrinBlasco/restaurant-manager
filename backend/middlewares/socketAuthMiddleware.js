const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const socketAuthMiddleware = (socket, next) => {
    console.log("Attempting socket authentication...");

    const headers = socket.handshake.headers;

    const cookieString = headers.cookie || "";

    let cookies;
    try {
        cookies = cookie.parse(cookieString);
    } catch (err) {
        console.error("Socket Auth Error: Could not parse cookies", err);
        return next(new Error("Authentication error: Invalid cookies"));
    }

    const token = cookies.auth_token;

    if (!token) {
        console.log("Socket Auth Error: No auth_token cookie found");

        return next(new Error("Authentication error: Token missing"));
    }

    jwt.verify(token, process.env.JWT_ACC_SECRET, (err, decodedUser) => {
        if (err) {
            console.error("Socket Auth Error: JWT verification failed", err.message);

            return next(new Error("Authentication error: Invalid token"));
        }

        socket.user = decodedUser;
        console.log(`Socket Authenticated: User ${socket.user.id} (Socket ID: ${socket.id})`);

        next();
    });
};

module.exports = socketAuthMiddleware;
