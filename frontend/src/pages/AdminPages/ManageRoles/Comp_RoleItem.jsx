import React, { useEffect, useState } from "react";
import Button from "@components/Button";
import Modal from "@components/Modal";
import axios from "@config/Axios";
import trashIcon from "@assets/trashIcon.svg";
import styles from "./Styles/Comp_RoleItem.module.css";

const RoleItem = ({ children, setCurrItemId, currentCompany }) => {
    const { name, description, permissions } = children;
    const [isDelModOpen, setDelModOpen] = useState(false);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/company/${currentCompany._id}/roles/${id}`);
        } catch (err) {}
        setDelModOpen(false);
        window.location.reload();
    };

    return (
        <>
            <div className={styles.item}>
                <h4>{name}</h4>
                <br />
                <div style={{ display: "flex", marginBottom: "2rem" }}>
                    <p style={{ overflowWrap: "break-word" }}>{description}</p>
                </div>
                <div>
                    <h4>Permissions:</h4>
                    {Object.entries(permissions).map(([ky, val]) => {
                        let current;
                        switch (ky) {
                            case "accessToKitchen":
                                current = "Access to Kitchen";
                                break;
                            case "accessToWaiters":
                                current = "Access to Waiters";
                                break;
                            case "editMenu":
                                current = "Edit Menu";
                                break;
                            case "editRoles":
                                current = "Edit Roles";
                                break;
                            case "editCompany":
                                current = "Edit Company";
                                break;
                            case "editEmployees":
                                current = "Edit Employees";
                                break;
                        }
                        return current && val ? <p key={ky}> - {current}</p> : "";
                    })}
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
                    {name !== "Owner" && (
                        <button
                            style={{
                                width: "1.2rem",
                                height: "1.2rem",
                                border: "none",
                                backgroundColor: "transparent",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                            }}
                            onClick={() => setDelModOpen(true)}
                        >
                            <img
                                style={{
                                    padding: "0 !important",
                                    height: "1rem",
                                    width: "1rem",
                                }}
                                src={trashIcon}
                                alt=""
                            />
                        </button>
                    )}
                    {name !== "Owner" && (
                        <Button
                            size={"small"}
                            backgroundColor={"var(--primary-color)"}
                            onClick={() => setCurrItemId(children._id)}
                        >
                            Edit
                        </Button>
                    )}
                </div>
            </div>
            {isDelModOpen && (
                <Modal
                    message="Are you sure you want to delete this item?"
                    onConfirm={() => handleDelete(children._id)}
                    onCancel={() => setDelModOpen(false)}
                    onConfirmBgColor={"var(--error-color)"}
                />
            )}
        </>
    );
};

export default RoleItem;
