import React from "react";
import styles from "./Styles/Page_Receipts.module.css";

const ReceiptCard = ({ receipt, companyInfo }) => {
    const { orderID: order, dateIssued, subtotal, taxAmount, finalAmount } = receipt;

    if (!order) {
        return <div className={styles.receiptCard}>Error: Order data missing.</div>;
    }

    const formattedDate = new Date(dateIssued).toLocaleString();
    const taxPercentage = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0;
    const displayOrderId = typeof order._id === "string" ? order._id.slice(-8).toUpperCase() : "N/A";
    const customerType = order.table ? `Table: ${order.table}` : "Table: N/A";

    const formatAddress = (addressObj) => {
        if (!addressObj) return "123 Main St, City";
        return `${addressObj.address || ""}, ${addressObj.city || ""} ${addressObj.zip || ""}`.trim();
    };

    return (
        <div className={styles.receiptCard}>
            <header className={styles.cardHeader}>
                <div className={styles.companyInfo}>
                    <h3>{companyInfo?.name || "Restaurant Name"}</h3>
                    <p>{formatAddress(companyInfo?.address)}</p>
                    <p>{companyInfo?.phone || "(555) 555-5555"}</p>
                </div>
                <button className={styles.printButton} onClick={() => alert(`Printing Order ${displayOrderId}...`)}>
                    Print
                </button>
            </header>

            <hr className={styles.divider} />

            <div className={styles.orderDetails}>
                <p>Order ID: {displayOrderId}</p>
                <p>Date: {formattedDate}</p>
                <p>{customerType}</p>
                <p>Issuer: {receipt.employeeName || "N/A"}</p>
            </div>

            <div className={styles.itemsTable}>
                <div className={styles.tableHeader}>
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Price</span>
                    <span>Total</span>
                </div>
                {order.items.map((item, index) => (
                    <div className={styles.tableRow} key={item.menuItemId + index}>
                        <span>{item.name}</span>
                        <span>{item.quantity}</span>
                        <span>${item.price.toFixed(2)}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className={styles.totalsSection}>
                <div>
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div>
                    <span>Tax ({taxPercentage.toFixed(0)}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className={styles.finalTotal}>
                    <span>Total:</span>
                    <span>${finalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default ReceiptCard;
