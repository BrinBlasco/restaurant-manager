import React, { useState, useMemo, useEffect } from "react";
import styles from "./Styles/Modal_Checkout.module.css";

const TAX_RATE = 0.09; // 9%

const Modal_Checkout = ({ isOpen, onClose, order, onTransactionComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [peopleCount, setPeopleCount] = useState(1);
    const [tipOption, setTipOption] = useState({ type: null, value: 0 });
    const [customTip, setCustomTip] = useState("");
    const [paymentMode, setPaymentMode] = useState(null);
    const [currentPayer, setCurrentPayer] = useState(1);
    const [payments, setPayments] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    const subtotal = useMemo(
        () => (order?.items ? order.items.reduce((total, item) => total + item.price * item.quantity, 0) : 0),
        [order]
    );

    const taxAmount = useMemo(() => subtotal * TAX_RATE, [subtotal]);

    const tipAmount = useMemo(() => {
        if (tipOption.type === "percent") return subtotal * (tipOption.value / 100);
        if (tipOption.type === "custom") return parseFloat(customTip) || 0;
        return 0;
    }, [subtotal, tipOption, customTip]);

    const finalAmount = useMemo(() => subtotal + taxAmount + tipAmount, [subtotal, taxAmount, tipAmount]);

    const perPersonTotal = useMemo(() => (peopleCount > 0 ? finalAmount / peopleCount : 0), [finalAmount, peopleCount]);

    const resetState = () => {
        setCurrentStep(1);
        setPeopleCount(1);
        setTipOption({ type: null, value: 0 });
        setCustomTip("");
        setPaymentMode(null);
        setCurrentPayer(1);
        setPayments([]);
        setSelectedPaymentMethod(null);
    };

    useEffect(() => {
        if (isOpen) {
            resetState();
        }
    }, [isOpen, order]);

    const handleFinishAndClose = () => {
        if (onTransactionComplete) {
            const receiptData = {
                orderID: order._id,
                subtotal: subtotal,
                taxAmount: taxAmount,
                tipAmount: tipAmount,
                finalAmount: finalAmount,
                paymentMode: paymentMode,
                splitDetails:
                    paymentMode === "individual"
                        ? Array.from({ length: peopleCount }, (_, i) => ({
                              method: "link_pending",
                              amount: perPersonTotal,
                              payerIdentifier: `Person ${i + 1}`,
                              status: "pending",
                          }))
                        : payments,
            };
            onTransactionComplete(receiptData);
        }
        onClose();
    };

    const handleNextToProcessing = () => {
        if (!paymentMode) {
            alert("Please select a payment collection method.");
            return;
        }
        setPayments([]);
        setCurrentPayer(1);
        if (paymentMode === "individual") {
            setCurrentStep(5);
        } else {
            setCurrentStep(4);
        }
    };

    const handleConfirmPayment = () => {
        if (!selectedPaymentMethod) {
            alert("Please select a payment method for this person.");
            return;
        }
        const newPayments = [
            ...payments,
            {
                method: selectedPaymentMethod,
                amount: perPersonTotal,
                payerIdentifier: `Person ${currentPayer}`,
                status: "paid",
            },
        ];
        setPayments(newPayments);

        if (currentPayer < peopleCount) {
            setCurrentPayer(currentPayer + 1);
            setSelectedPaymentMethod(null);
        } else {
            setCurrentStep(5);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <div className={styles.billSummary}>
                            <div className={styles.billTotal}>${subtotal.toFixed(2)}</div>
                            <div className={styles.billTotalLabel}>Bill Subtotal for Table {order.table || "N/A"}</div>
                        </div>
                        <div className={styles.peopleCounter}>
                            <label>Split Between:</label>
                            <div className={styles.counterButtons}>
                                <button
                                    onClick={() => setPeopleCount((p) => p - 1)}
                                    disabled={peopleCount <= 1}
                                    className={styles.counterBtn}
                                >
                                    −
                                </button>
                                <span className={styles.peopleCount}>{peopleCount} People</span>
                                <button onClick={() => setPeopleCount((p) => p + 1)} className={styles.counterBtn}>
                                    +
                                </button>
                            </div>
                        </div>
                    </>
                );
            case 2:
                const tipButtons = [
                    { label: `10% ($${(subtotal * 0.1).toFixed(2)})`, type: "percent", value: 10 },
                    { label: `15% ($${(subtotal * 0.15).toFixed(2)})`, type: "percent", value: 15 },
                    { label: `20% ($${(subtotal * 0.2).toFixed(2)})`, type: "percent", value: 20 },
                    { label: "No Tip", type: "none", value: 0 },
                ];
                return (
                    <>
                        <div className={styles.tipOptions}>
                            {tipButtons.map((btn) => (
                                <div
                                    key={btn.label}
                                    className={`${styles.tipBtn} ${
                                        tipOption.type === btn.type && tipOption.value === btn.value ? styles.selected : ""
                                    }`}
                                    onClick={() => {
                                        setTipOption({ type: btn.type, value: btn.value });
                                        setCustomTip("");
                                    }}
                                >
                                    {btn.label}
                                </div>
                            ))}
                        </div>
                        <input
                            type="number"
                            placeholder="Or enter custom tip amount"
                            value={customTip}
                            onChange={(e) => {
                                setCustomTip(e.target.value);
                                setTipOption({ type: "custom", value: 0 });
                            }}
                            className={styles.customTipInput}
                        />
                        <div className={styles.summarySection}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Tax (9%):</span>
                                <span>${taxAmount.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Tip:</span>
                                <span>${tipAmount.toFixed(2)}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Total:</span>
                                <span>${finalAmount.toFixed(2)}</span>
                            </div>
                            <div className={styles.perPersonDisplay}>
                                Each person pays: <strong>${perPersonTotal.toFixed(2)}</strong>
                            </div>
                        </div>
                    </>
                );
            case 3:
                return (
                    <div className={styles.paymentMethodsGrid}>
                        <div
                            className={`${styles.methodCard} ${paymentMode === "sequential" ? styles.selected : ""}`}
                            onClick={() => setPaymentMode("sequential")}
                        >
                            <h4>💳 One Device</h4>
                            <p>Collect payments one by one here.</p>
                        </div>
                        <div
                            className={`${styles.methodCard} ${paymentMode === "individual" ? styles.selected : ""}`}
                            onClick={() => setPaymentMode("individual")}
                        >
                            <h4>👥 Individual Links</h4>
                            <p>Send a payment link to each person.</p>
                        </div>
                    </div>
                );
            case 4:
                const paymentOptions = [
                    { label: "💳 Card", method: "card" },
                    { label: "💵 Cash", method: "cash" },
                    { label: "📱 Apple Pay", method: "applepay" },
                    { label: "🔵 Venmo", method: "venmo" },
                ];
                return (
                    <>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${((currentPayer - 1) / peopleCount) * 100}%` }}
                            ></div>
                        </div>
                        <div className={styles.paymentConfirmation}>
                            <div style={{ fontSize: "1.2rem", marginBottom: "15px" }}>
                                Person {currentPayer} of {peopleCount}
                            </div>
                            <div className={styles.billTotal} style={{ color: "var(--success-color, #27ae60)" }}>
                                ${perPersonTotal.toFixed(2)}
                            </div>
                        </div>
                        <div className={styles.paymentMethodsGrid} style={{ marginTop: "25px" }}>
                            {paymentOptions.map((opt) => (
                                <div
                                    key={opt.method}
                                    className={`${styles.methodCard} ${
                                        selectedPaymentMethod === opt.method ? styles.selected : ""
                                    }`}
                                    onClick={() => setSelectedPaymentMethod(opt.method)}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 5:
                return (
                    <div className={styles.paymentConfirmation}>
                        <div className={styles.paymentConfirmationIcon}>✅</div>
                        <h3 style={{ marginTop: "15px" }}>Payment Complete!</h3>
                        <p style={{ color: "var(--secondary-text-color)" }}>All payments have been processed.</p>
                        <div className={styles.summarySection}>
                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Total Collected:</span>
                                <span>${finalAmount.toFixed(2)}</span>
                            </div>
                            {paymentMode === "individual"
                                ? Array.from({ length: peopleCount }).map((_, i) => (
                                      <div className={styles.receiptItem} key={i}>
                                          <span>Person {i + 1}</span>
                                          <span>Paid via Link</span>
                                          <span>${perPersonTotal.toFixed(2)}</span>
                                      </div>
                                  ))
                                : payments.map((p) => (
                                      <div className={styles.receiptItem} key={p.payerIdentifier}>
                                          <span>{p.payerIdentifier}</span>
                                          <span style={{ textTransform: "capitalize" }}>{p.method}</span>
                                          <span>${p.amount.toFixed(2)}</span>
                                      </div>
                                  ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getModalTitle = () => {
        const titles = [
            "Split Bill",
            "Add a Tip",
            "Payment Method",
            `Processing Payment ${currentPayer}/${peopleCount}`,
            "Success!",
        ];
        return titles[currentStep - 1];
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close checkout">
                    ×
                </button>
                <h1 className={styles.modalHeader}>{getModalTitle()}</h1>

                <div className={styles.stepContent}>{renderStepContent()}</div>

                <div className={styles.modalActions}>
                    {currentStep > 1 && currentStep < 5 && (
                        <button
                            onClick={() => setCurrentStep((s) => s - 1)}
                            className={`${styles.modalButton} ${styles.secondaryButton}`}
                        >
                            Back
                        </button>
                    )}
                    {currentStep < 3 && (
                        <button
                            onClick={() => setCurrentStep((s) => s + 1)}
                            disabled={currentStep === 2 && !tipOption.type}
                            className={`${styles.modalButton} ${styles.primaryButton}`}
                        >
                            Next
                        </button>
                    )}
                    {currentStep === 3 && (
                        <button
                            onClick={handleNextToProcessing}
                            disabled={!paymentMode}
                            className={`${styles.modalButton} ${styles.primaryButton}`}
                        >
                            Next
                        </button>
                    )}
                    {currentStep === 4 && (
                        <button
                            onClick={handleConfirmPayment}
                            disabled={!selectedPaymentMethod}
                            className={`${styles.modalButton} ${styles.primaryButton}`}
                        >
                            Confirm Payment
                        </button>
                    )}
                    {currentStep === 5 && (
                        <button onClick={handleFinishAndClose} className={`${styles.modalButton} ${styles.primaryButton}`}>
                            Finish & Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal_Checkout;
