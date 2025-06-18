import axios from "@config/Axios";
import React, { useEffect, useState } from "react";
import Navbar from "@components/Navbar";
import Employee from "./Comp_Employee";
import AddEmployeeForm from "./Form_AddEmplyee";
import EditEmployeeModal from "./Modal_EditEmployee";
import Loading from "@components/Loading";
import { useAuth } from "@utils/Auth/AuthContext";
import styles from "./Styles/Page_ManageEmployees.module.css";

const ManageEmployees = () => {
    const { currentCompany, currentPermissions, loading } = useAuth();
    const [activeTab, setActiveTab] = useState("Employees");
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);

    const [selectedEmployee, setSelectedEmployee] = useState(null);

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
    const handleUpdateEmployee = async (updatedCompEmpData, roleIds, rolesChanged) => {
        try {
            let payload = {
                updatedEmployee: updatedCompEmpData,
            };
            if (rolesChanged) {
                payload.updatedRoleIds = roleIds;
            }
            const res = await axios.patch(`/company/${currentCompany._id}/employees/${updatedCompEmpData._id}`, payload);

            const { _id, companyID, employeeID, ...compEmpDataSanitized } = res.data.companyEmployee;

            setEmployees((prevEmp) =>
                prevEmp.map((emp) => {
                    if (emp._id === updatedCompEmpData._id) {
                        return {
                            ...emp,
                            ...compEmpDataSanitized,
                            roles: rolesChanged ? res.data.roles : emp.roles,
                        };
                    } else {
                        return emp;
                    }
                })
            );
        } catch (error) {
            console.error("Error updating employee:", error.response?.data?.message || error.message);
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
                    <div className={styles.items}>
                        {employees.map((emp) => (
                            <Employee
                                key={emp._id}
                                userData={emp}
                                roles={roles.filter((role) => role.name !== "Owner")}
                                onViewClick={() => {
                                    setSelectedEmployee(emp);
                                }}
                            />
                        ))}
                    </div>
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

            {selectedEmployee && (
                <EditEmployeeModal
                    userData={selectedEmployee}
                    allRoles={roles.filter((role) => role.name !== "Owner")}
                    closeModal={() => setSelectedEmployee(null)}
                    handleUpdateEmployee={handleUpdateEmployee}
                    handleFireEmployee={handleFireEmployee}
                />
            )}
        </>
    );
};

export default ManageEmployees;
