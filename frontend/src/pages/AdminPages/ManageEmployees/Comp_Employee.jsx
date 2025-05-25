import axios from "@config/Axios";
import React, { useEffect, useState } from "react";
import Button from "@components/Button";
import EditEmployeeModal from "./Modal_EditEmployee";
import styles from "./Styles/Comp_Employee.module.css";

const Employee = ({ userData, handleUpdateEmployee, handleFireEmployee }) => {
    const [isEditModalOpen, setEditModalOpen] = useState(false);

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
                        {userData.roles.map((role) => {
                            return (
                                <div className={styles.role} key={role._id}>
                                    {role.name}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <Button
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                    }}
                    size={"small"}
                    backgroundColor={"var(--primary-color)"}
                    onClick={() => {
                        setEditModalOpen(true);
                    }}
                >
                    View
                </Button>
            </div>
            {isEditModalOpen && (
                <EditEmployeeModal
                    handleUpdateEmployee={handleUpdateEmployee}
                    handleFireEmployee={handleFireEmployee}
                    setEditModalOpen={setEditModalOpen}
                    userData={userData}
                />
            )}
        </>
    );
};

export default Employee;
