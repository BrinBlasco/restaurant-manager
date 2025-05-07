import axios from "@config/Axios";
import React, { useEffect, useState } from "react";
import Navbar from "@components/Navbar";
import Employee from "./Comp_Employee";
import AddEmployeeForm from "./Form_AddEmplyee";
import Loading from "@components/Loading";
import { useAuth } from "@utils/Auth/AuthContext";
import styles from "./Styles/Page_ManageEmployees.module.css";

const ManageEmployees = () => {
    const { employee, currentCompany, currentPermissions, loading } = useAuth();
    const [activeTab, setActiveTab] = useState("Employees");
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (loading && !currentCompany) return;
        getEmployees();
        getRoles();
    }, [loading, currentCompany]);

    const getEmployees = async () => {
        try {
            const res = await axios.get(`/company/${currentCompany._id}/employees`);
            setEmployees(() => [...res.data.employees]);
        } catch (err) {
            console.log(err);
        }
    };

    const getRoles = async () => {
        try {
            const res = await axios.get(`/company/${currentCompany._id}/roles`);
            setRoles(() => [...res.data]);
        } catch (err) {
            console.log(err);
        }
    };

    if (loading) return <Loading />;
    if (!currentPermissions.editEmployees) {
        return (
            <>
                <Navbar companyName={currentCompany.name} activeTab={activeTab} onTabChange={setActiveTab} />
                <div
                    style={{
                        height: "100%",
                        placeContent: "center",
                    }}
                >
                    <h1 style={{ fontSize: "5rem", textAlign: "center" }}>403 - Forbidden</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar companyName={currentCompany.name} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className={styles.container}>
                <div className={styles.left}>
                    {employees.map((emp, i) => (
                        <Employee key={i} userData={emp} currentCompanyId={currentCompany._id} />
                    ))}
                </div>
                <div className={styles.right}>
                    <AddEmployeeForm
                        roles={roles.filter((role) => role.name !== "Owner")}
                        currentCompanyId={currentCompany._id}
                    />
                </div>
            </div>
        </>
    );
};

export default ManageEmployees;
