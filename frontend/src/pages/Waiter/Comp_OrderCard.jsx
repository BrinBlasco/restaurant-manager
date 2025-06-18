import React from "react";
import { useState } from "react";
import styles from "./Styles/Page_Waiter.module.css";
import trashIcon from "@assets/trashIcon.svg";
import Modal from "@components/Modal";

const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const OrderCard = ({ onUpdateStatus, onDelete, order }) => {
    const [isDelModalOpen, setDelModalOpen] = useState(false);

    if (!order || !order._id) {
        console.warn("OrderCard received invalid order data:", order);
        return <div className={styles.orderCard}>Invalid Order Data</div>;
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending":
                return styles.statusPending;
            case "Preparing":
                return styles.statusPreparing;
            case "Ready":
                return styles.statusReady;
            case "Delivered":
                return styles.statusDelivered;
            default:
                return "";
        }
    };
    const displayTimestamp = order.updatedAt || order.createdAt;
    const timeAgo = displayTimestamp ? formatTimeAgo(displayTimestamp) : "Unknown time";

    return (
        <div className={styles.orderCard}>
            <div className={styles.ticketHeader}>
                <span className={styles.orderId}>
                    #{order._id.toString().slice(-6)} {order.table ? `(Table: ${order.table})` : "(Table: N/A)"}
                </span>
                <div style={{ display: "flex", gap: "0.3rem", justifyContent: "center", alignItems: "center" }}>
                    <img
                        src={trashIcon}
                        style={{ scale: "0.7", cursor: "pointer", padding: "0.3rem" }}
                        onClick={() => setDelModalOpen(true)}
                    />
                    <span className={`${styles.orderStatus} ${getStatusStyle(order.status)}`}>{order.status}</span>
                </div>
                <div style={{ flexBasis: "100%" }}></div>
                <div className={styles.orderTime}>{timeAgo}</div>
            </div>
            {order.items && order.items.length > 0 ? (
                <ul className={styles.orderCardItems}>
                    {order.items.map((item, index) => (
                        <li key={index} className={styles.itemEntry}>
                            <span className={styles.itemQuantity}>{item.quantity}x</span>
                            <span className={styles.itemName}>{item.name}</span>
                            {item.note && <span className={styles.itemNotes}>({item.note})</span>}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.noItemsText}>No items in this order.</p>
            )}
            {order.status === "Ready" && (
                <button
                    className={`${styles.actionButton} ${styles.buttonPrimary}`}
                    onClick={() => onUpdateStatus(order._id, "Delivered")}
                >
                    Mark as Delivered
                </button>
            )}
            {order.status === "Delivered" && (
                <button
                    className={`${styles.actionButton} ${styles.buttonPay}`}
                    onClick={() => onUpdateStatus(order._id, "Paid")}
                >
                    Mark as Paid
                </button>
            )}
            {isDelModalOpen && (
                <Modal
                    message="Are you sure you want to delete this order?"
                    onConfirm={() => {
                        onDelete(order._id);
                        setDelModalOpen(false);
                    }}
                    onCancel={() => {
                        setDelModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default OrderCard;
