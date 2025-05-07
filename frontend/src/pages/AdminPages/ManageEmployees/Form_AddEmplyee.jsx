import axios from "@config/Axios";
import React, { useState } from "react";
import Button from "@components/Button";
import RoleSelector from "./Comp_RoleSelector";
import styles from "./Styles/Form_AddEmployee.module.css";

const AddEmplyeeForm = ({ roles, currentCompanyId }) => {
    const [newEmployee, setNewEmployee] = useState("");
    const [currentRoles, setCurrentRoles] = useState([]);

    const handleRolesChange = (selectedRoles) => {
        let roleIds = [];
        for (let role of selectedRoles) {
            roleIds.push(role._id);
        }
        setCurrentRoles(roleIds);
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        if (!currentRoles || currentRoles.length === 0) {
            console.log("No roles selected");
            return;
        }
        try {
            const res = await axios.post(`/company/${currentCompanyId}/employees/${newEmployee}`, currentRoles);
            console.log(res);
            location.reload();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <h1 className={styles.title}>Add an Employee</h1>
            <form onSubmit={handleAddEmployee} className={styles.form}>
                <div className={styles.addEmployeeFields}>
                    <label htmlFor="employeeUPID">UPID (Unique Personal Identifier):</label>
                    <input
                        type="text"
                        id="employeeUPID"
                        value={newEmployee}
                        onKeyDown={(e) => {
                            if (!/^\d$/.test(e.key) && e.key !== "Backspace" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => setNewEmployee(e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div className={styles.addEmployeeFields}>
                    <p>Roles: </p>
                    <RoleSelector initialRoles={roles} onChange={handleRolesChange} />
                </div>
                <Button type="submit" style={{ marginTop: "auto" }} backgroundColor={"var(--primary-color)"}>
                    Add Employee
                </Button>
            </form>
        </>
    );
};

export default AddEmplyeeForm;
