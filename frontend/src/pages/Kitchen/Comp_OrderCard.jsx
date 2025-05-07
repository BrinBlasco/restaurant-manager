import React from "react";
import styles from "./Page_Kitchen.module.css";

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

const OrderCard = ({ order, onUpdateStatus }) => {
    const orderIdentifier = order._id;
    if (!order || !orderIdentifier) {
        console.warn("OrderTicket received invalid order data:", order);
        return <div className={styles.orderTicket}>Invalid Order Data</div>;
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
        <div className={styles.orderTicket}>
            <div className={styles.ticketHeader}>
                <span className={styles.orderId}>
                    #{orderIdentifier.toString().slice(-6)} {order.table ? `(Table: ${order.table})` : "(Table: N/A)"}
                </span>
                <span className={`${styles.orderStatus} ${getStatusStyle(order.status)}`}>{order.status}</span>
                <div style={{ flexBasis: "100%" }}></div>
                <div className={styles.orderTime}>{timeAgo}</div>
            </div>
            <ul className={styles.itemList}>
                {order.items?.map((item, index) => (
                    <li key={index} className={styles.itemEntry}>
                        <span className={styles.itemQuantity}>{item.quantity}x</span>
                        <span className={styles.itemName}>{item.name}</span>
                        {item.note && <span className={styles.itemNotes}>({item.note})</span>}
                    </li>
                )) ?? <li>No items</li>}
            </ul>
            {order.status === "Pending" && (
                <button
                    className={`${styles.actionButton} ${styles.buttonPrimary}`}
                    onClick={() => onUpdateStatus(orderIdentifier, "Preparing")}
                >
                    Start Preparing
                </button>
            )}
            {order.status === "Preparing" && (
                <button
                    className={`${styles.actionButton} ${styles.buttonSecondary}`}
                    onClick={() => onUpdateStatus(orderIdentifier, "Ready")}
                >
                    Mark as Ready
                </button>
            )}
        </div>
    );
};

export default OrderCard;
