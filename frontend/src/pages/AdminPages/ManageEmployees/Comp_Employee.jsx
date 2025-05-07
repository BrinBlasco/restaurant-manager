import axios from "@config/Axios";
import React, { useEffect, useState } from "react";
import Button from "@components/Button";
import EditEmployeeModal from "./Modal_EditEmployee";
import styles from "./Styles/Comp_Employee.module.css";
import { useAuth } from "@utils/Auth/AuthContext";

const Employee = ({ userData, currentCompanyId }) => {
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [roles, setRoles] = useState([]);

    const getEmployeeRoles = async (employeeId) => {
        try {
            const res = await axios.get(`/company/${currentCompanyId}/employees/${employeeId}/roles`);
            setRoles(res.data);
        } catch (err) {}
    };

    useEffect(() => {
        getEmployeeRoles(userData._id);
    }, [userData?._id, currentCompanyId]);

    return (
        <>
            <div className={styles.item}>
                <div style={{ marginBottom: "2rem" }}>
                    <p style={{ fontSize: "0.6rem", color: "darkgray" }}>UPID: {userData?.upid}</p>

                    <h4>{userData?.firstName + " " + userData?.lastName}</h4>

                    <p style={{ fontSize: "0.9rem", color: "darkgray" }}>{userData?.email}</p>
                </div>

                <div>
                    <div className={styles.roles}>
                        {roles.map((role) => {
                            return (
                                <div className={styles.role} key={role._id}>
                                    {role.name}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    <Button
                        size={"small"}
                        backgroundColor={"var(--primary-color)"}
                        onClick={() => {
                            setEditModalOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                </div>
            </div>
            {isEditModalOpen && <EditEmployeeModal setEditModalOpen={setEditModalOpen} userData={userData} />}
        </>
    );
};

export default Employee;
