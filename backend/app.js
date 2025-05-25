const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http");
const helmet = require("helmet");

const initSocketServer = require("./websockets/Sockets");

dotenv.config();

const app = express();
const server = http.createServer(app);

if (process.env.NODE_ENV === "development") {
    app.use(
        cors({
            credentials: true,
            origin: ["http://localhost:9999"],
        })
    );
}

app.use(helmet());
app.use(cookieParser());
app.use(express.json());

const runProcess = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.log("Mongo err: ", err);
        mongoose.disconnect();
        process.exit(1);
    }
};
runProcess().catch(console.dir);

const io = initSocketServer(server);
app.set("socketio", io);

const AuthRoutes = require("./routes/Auth");

const MenuRoutes = require("./routes/Menu");
const RolesRoutes = require("./routes/Roles");
const EmployeesRoutes = require("./routes/Employees");
const OrderRoutes = require("./routes/Orders");

const CompanyRoutes = require("./routes/Company");
const UserRoutes = require("./routes/User");

app.use("/api/auth", AuthRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/company", CompanyRoutes);
app.use("/api/company/:companyId/roles", RolesRoutes);
app.use("/api/company/:companyId/menu-items", MenuRoutes);
app.use("/api/company/:companyId/employees", EmployeesRoutes);
app.use("/api/company/:companyId/orders", OrderRoutes);

app.get("/", async (req, res) => {
    return res.status(200).json({ message: "API is working..." });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "127.0.0.1", () => console.log(`Server running on port ${PORT}`));
