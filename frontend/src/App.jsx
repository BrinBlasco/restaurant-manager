import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import AuthPage from "@pages/AuthPage/AuthPage";

import AuthProvider from "@utils/Auth/AuthProvider";
import SocketLayout from "@utils/Sockets/SocketLayout";

import ManageMenuPage from "@pages/AdminPages/ManageMenu/Page_ManageMenu";
import ManageRolesPage from "@pages/AdminPages/ManageRoles/Page_ManageRoles";
import ManageEmployeesPage from "@pages/AdminPages/ManageEmployees/Page_ManageEmployees";
import ManageCompanyPage from "@pages/AdminPages/ManageCompany/Page_ManageCompany";

import DashboardPage from "@pages/Dashboard/Dashboard/Page_Dashboard";
import CreateCompanyPage from "@pages/Dashboard/CreateCompany/Page_CreateCompany";
import ChangeAccountDataPage from "@pages/Dashboard/ChangeAccountData/Page_ChangeAccountData";

import WaiterPage from "@pages/Waiter/Page_Waiter";
import KitchenPage from "@pages/Kitchen/Page_Kitchen";
import ReceiptsPage from "@pages/Receipts/Page_Receipts";

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<AuthPage isLoginOrRegister={"Login"} />} />
                    <Route path="/login" element={<AuthPage isLoginOrRegister={"Login"} />} />
                    <Route path="/register" element={<AuthPage isLoginOrRegister={"Register"} />} />

                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/dashboard/changeAccountData" element={<ChangeAccountDataPage />} />
                    <Route path="/dashboard/createCompany" element={<CreateCompanyPage />} />

                    <Route path="/AdminPanel/" element={<ManageCompanyPage />} />
                    <Route path="/AdminPanel/ManageMenu" element={<ManageMenuPage />} />
                    <Route path="/AdminPanel/ManageRoles" element={<ManageRolesPage />} />
                    <Route path="/AdminPanel/ManageEmployees" element={<ManageEmployeesPage />} />
                    <Route path="/AdminPanel/ManageCompany" element={<ManageCompanyPage />} />

                    <Route path="/receipts" element={<ReceiptsPage />} />

                    <Route element={<SocketLayout />}>
                        <Route path="/waiters" element={<WaiterPage />} />
                        <Route path="/kitchen" element={<KitchenPage />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
