const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http");
const helmet = require("helmet");

const initSocketServer = require("./Websockets/Sockets");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
    cors({
        credentials: true,
        origin: "https://brinblazko.ddns.net",
        //origin: ["http://localhost:9999", "https://brinblazko.ddns.net"],
    })
);

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

const AuthRoutes = require("./routes/Auth");

const MenuRoutes = require("./routes/ManageCompany/Menu");
const RolesRoutes = require("./routes/ManageCompany/Roles");
const EmployeesRoutes = require("./routes/ManageCompany/Employees");
const OrderRoutes = require("./routes/ManageCompany/Orders");

const CompanyRoutes = require("./routes/ManageCompany/Company");
const UserRoutes = require("./routes/User");

const io = initSocketServer(server);
app.set("socketio", io);

app.use("/api/auth", AuthRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/company", CompanyRoutes);
app.use("/api/company/:companyId/roles", RolesRoutes);
app.use("/api/company/:companyId/menu-items", MenuRoutes);
app.use("/api/company/:companyId/employees", EmployeesRoutes);
app.use("/api/company/:companyId/orders", OrderRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, "127.0.0.1", () => console.log(`Server running on port ${PORT}`));
