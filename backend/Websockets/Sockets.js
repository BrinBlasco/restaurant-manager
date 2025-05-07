const { Server } = require("socket.io");
const socketAuthMiddleware = require("./socketAuthMiddleware");

const initSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "https://brinblazko.ddns.net",

            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    console.log("Socket.IO server initializing...");

    io.use(socketAuthMiddleware);

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}, Auth Info: User ${socket.user?.id ?? "N/A"}`);

        socket.on("joinCompanyRoom", (companyId) => {
            if (!companyId) {
                console.error(`Socket ${socket.id} (User ID: ${socket.user?.id}) tried to join without companyId.`);
                socket.emit("errorJoining", "Company ID is required.");
                return;
            }

            console.log(`Socket ${socket.id} attempting to join room: ${companyId}`);

            socket.join(companyId);
            socket.companyId = companyId;
            console.log(`Socket ${socket.id} (User ID: ${socket.user?.id}) successfully joined room: ${companyId}`);

            socket.emit("joinedRoom", companyId);
        });

        socket.on("disconnect", (reason) => {
            console.log(`User disconnected: ${socket.id} (User ID: ${socket.user?.id ?? "N/A"}). Reason: ${reason}`);

            if (socket.companyId) {
                console.log(`Socket ${socket.id} left room ${socket.companyId} implicitly.`);
            }
        });

        socket.on("error", (err) => {
            console.error(`Socket Error on ${socket.id} (User ID: ${socket.user?.id}):`, err);
        });
    });

    console.log("Socket.IO connection handler attached.");

    return io;
};

module.exports = initSocketServer;
