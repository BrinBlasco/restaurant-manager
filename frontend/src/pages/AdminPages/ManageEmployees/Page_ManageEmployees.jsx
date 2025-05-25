import axios from "@config/Axios";
import React, { useEffect, useState } from "react";
import Navbar from "@components/Navbar";
import Employee from "./Comp_Employee";
import AddEmployeeForm from "./Form_AddEmplyee";
import Loading from "@components/Loading";
import { useAuth } from "@utils/Auth/AuthContext";
import styles from "./Styles/Page_ManageEmployees.module.css";

const ManageEmployees = () => {
    const { currentCompany, currentPermissions, loading } = useAuth();
    const [activeTab, setActiveTab] = useState("Employees");
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (loading && !currentCompany) return;
        getEmployees();
        getRoles();
    }, [loading, currentCompany]);

    const handleFireEmployee = async (employeeId) => {
        try {
            const res = axios.delete(`/company/${currentCompany._id}/employees/${employeeId}`);
            setEmployees(() => {
                const exists = employees.some((emp) => emp._id === employeeId);
                return exists ? employees.filter((emp) => emp._id !== employeeId) : employees;
            });
        } catch (error) {
            console.log("Error deleting employee");
        }
    };
    const handleUpdateEmployee = async (updatedEmployee) => {
        try {
            // const res = axios.put(`/company/${currentCompany._id}/employees/${updatedEmployee._id}`, updatedEmployee);
            // setEmployees(() => {
            //     const exists = employees.some((emp) => emp._id === updatedEmployee._id);
            //     return exists ? employees.filter((emp) => emp._id !== updatedEmployee._id) : employees;
            // });
        } catch (error) {
            console.log("Error updating employee");
        }
    };

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
                <Navbar navBarLabel={"Admin Panel"} activeTab={activeTab} onTabChange={setActiveTab} />
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
            <Navbar navBarLabel={"Admin Panel"} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className={styles.container}>
                <div className={styles.left}>
                    {employees.map((emp) => (
                        <Employee
                            key={emp._id}
                            userData={emp}
                            handleUpdateEmployee={handleUpdateEmployee}
                            handleFireEmployee={handleFireEmployee}
                        />
                    ))}
                </div>
                <div className={styles.right}>
                    <AddEmployeeForm
                        roles={roles.filter((role) => role.name !== "Owner")}
                        employees={employees}
                        setEmployees={setEmployees}
                        currentCompanyId={currentCompany._id}
                    />
                </div>
            </div>
        </>
    );
};

export default ManageEmployees;
