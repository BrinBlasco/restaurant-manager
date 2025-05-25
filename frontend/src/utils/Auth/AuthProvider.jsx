import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

import { AuthContext } from "./AuthContext";
import { mergeRoles } from "./authUtils";

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [currentCompany, setCurrentCompany] = useState(null);

    const [currentPermissions, setCurrentPermissions] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);
            try {
                await axios.get("/auth/check");
                const fetchedCompanies = await fetchData();
                setIsAuthenticated(true);

                const savedCompanyId = sessionStorage.getItem("selectedCompanyId");
                if (savedCompanyId) {
                    const savedCompany = fetchedCompanies.find((company) => company._id === savedCompanyId);
                    if (savedCompany) {
                        setCurrentCompany(savedCompany);
                        const roles = Object.values(savedCompany.roles || {});
                        const permissions = roles.map((role) => role.permissions || {});
                        const mergedPermissions = mergeRoles(permissions);
                        setCurrentPermissions(mergedPermissions);
                    }
                }
            } catch (err) {
                resetAuthState();
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, [navigate]);

    const fetchData = async () => {
        const res = await axios.get("/auth/protected/data");
        setEmployee(res.data.employee);
        setCompanies(res.data.companies || []);
        return res.data.companies || [];
    };

    const refreshCompany = async () => {};

    const login = async (credentials) => {
        const { login, password } = credentials;
        try {
            setLoading(true);
            await axios.post("/auth/login", { login, password });
            await fetchData();
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.get("/auth/logout");
            setLoading(true);
            sessionStorage.removeItem("selectedCompanyId");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
        resetAuthState();
    };

    const selectCompany = (companyId) => {
        const selectedCompany = companies.find((company) => company._id === companyId);
        if (selectedCompany) {
            setCurrentCompany(selectedCompany);
            const roles = Object.values(selectedCompany.roles || {});
            const permissions = roles.map((role) => role.permissions || {});
            const mergedPermissions = mergeRoles(permissions);

            setCurrentPermissions(mergedPermissions);
            sessionStorage.setItem("selectedCompanyId", companyId);
        } else {
            console.error(`Company with ID ${companyId} not found`);
        }
    };

    const resetAuthState = () => {
        sessionStorage.removeItem("selectedCompanyId");
        setIsAuthenticated(false);
        setEmployee(null);
        setCompanies([]);
        setCurrentCompany(null);
        setCurrentPermissions(null);
    };

    return (
        <AuthContext.Provider
            value={{
                employee,
                companies,
                currentCompany,
                currentPermissions,
                selectCompany,
                login,
                logout,
                isAuthenticated,
                loading,
                refreshCompany,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node,
};

export default AuthProvider;
