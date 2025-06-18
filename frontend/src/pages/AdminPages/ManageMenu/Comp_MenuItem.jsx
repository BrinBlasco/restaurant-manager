import axios from "@config/Axios";
import React, { useEffect, useState } from "react";

import Button from "@components/Button";
import Modal from "@components/Modal";

import trashIcon from "@assets/trashIcon.svg";
import styles from "./Styles/Comp_MenuItem.module.css";

const MenuItem = ({ children, setCurrItemId, currentCompany, onMenuItemDelete }) => {
    const { name, price, description } = children;
    const [isDelModOpen, setDelModOpen] = useState(false);

    const handleDelete = async (id) => {
        setDelModOpen(false);
        try {
            const res = await axios.delete(`/company/${currentCompany._id}/menu-items/${id}`);
            onMenuItemDelete(id);
            setCurrItemId(null);
        } catch (err) {
            console.log("Error Deleting");
        }
    };

    return (
        <>
            <div data-item-type={children.type} className={styles.item}>
                <h4>{name}</h4>
                <p style={{ fontSize: "0.7rem", color: "darkgray" }}>{children.type}</p>
                <div style={{ marginBottom: "1.75rem" }}>
                    <p style={{ overflowWrap: "break-word", margin: "0.5rem 0" }}>{description}</p>
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

                    <Button size={"small"} backgroundColor={"var(--primary-color)"} onClick={() => setCurrItemId(children._id)}>
                        Edit
                    </Button>
                </div>

                <div className={styles.price}>
                    <span>${parseFloat(price).toFixed(2)}</span>
                </div>
            </div>

            {isDelModOpen && (
                <Modal
                    message="Are you sure you want to delete this item?"
                    onConfirm={() => handleDelete(children._id)}
                    onCancel={() => setDelModOpen(false)}
                />
            )}
        </>
    );
};

export default MenuItem;
