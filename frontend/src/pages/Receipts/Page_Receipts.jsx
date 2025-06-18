import React, { useState, useMemo, useEffect, useCallback } from "react";
import styles from "./Styles/Page_Receipts.module.css";
import ReceiptCard from "./Comp_ReceiptCard";
import { useAuth } from "@utils/Auth/AuthContext";
import axios from "@config/Axios";
import Navbar from "@components/Navbar";

const getTodayString = () => new Date().toISOString().split("T")[0];

const ReceiptsPage = () => {
    const [allReceipts, setAllReceipts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("today");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    const { currentCompany } = useAuth();

    const fetchReceipts = useCallback(async () => {
        if (!currentCompany?._id) return;
        setIsLoading(true);
        setError(null);
        try {
            const apiUrl = `/company/${currentCompany._id}/receipts`;
            const response = await axios.get(apiUrl);
            setAllReceipts(response.data.receipts || []);
        } catch (err) {
            setError("Failed to load receipt history. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [currentCompany?._id]);

    useEffect(() => {
        fetchReceipts();
    }, [fetchReceipts]);

    const filteredReceipts = useMemo(() => {
        if (!allReceipts.length) return [];
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (activeFilter) {
            case "today":
                return allReceipts.filter((r) => new Date(r.dateIssued) >= startOfToday);

            case "week":
                const startOfWeek = new Date(startOfToday);
                startOfWeek.setDate(startOfToday.getDate() - now.getDay());
                return allReceipts.filter((r) => new Date(r.dateIssued) >= startOfWeek);

            case "month":
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return allReceipts.filter((r) => new Date(r.dateIssued) >= startOfMonth);

            case "custom":
                if (!customStartDate || !customEndDate) return [];
                const start = new Date(customStartDate);
                const end = new Date(customEndDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return allReceipts.filter((r) => {
                    const receiptDate = new Date(r.dateIssued);
                    return receiptDate >= start && receiptDate <= end;
                });

            default:
                return allReceipts;
        }
    }, [allReceipts, activeFilter, customStartDate, customEndDate]);

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
    };

    return (
        <>
            <Navbar navBarLabel={"POS"} navLinks={{ Kitchen: "/kitchen", Waiters: "/waiters", POS: "/receipts" }} />
            <div className={styles.pageContainer}>
                <h1 className={styles.pageHeader}>Receipt History</h1>

                <div className={styles.filterContainer}>
                    <button
                        className={`${styles.filterButton} ${activeFilter === "today" ? styles.filterButtonActive : ""}`}
                        onClick={() => handleFilterChange("today")}
                    >
                        Today
                    </button>
                    <button
                        className={`${styles.filterButton} ${activeFilter === "week" ? styles.filterButtonActive : ""}`}
                        onClick={() => handleFilterChange("week")}
                    >
                        This Week
                    </button>
                    <button
                        className={`${styles.filterButton} ${activeFilter === "month" ? styles.filterButtonActive : ""}`}
                        onClick={() => handleFilterChange("month")}
                    >
                        This Month
                    </button>
                    <button
                        className={`${styles.filterButton} ${activeFilter === "custom" ? styles.filterButtonActive : ""}`}
                        onClick={() => handleFilterChange("custom")}
                    >
                        Custom
                    </button>
                    {activeFilter === "custom" && (
                        <div className={styles.datePickerContainer}>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                max={getTodayString()}
                            />
                            <span>to</span>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                max={getTodayString()}
                            />
                        </div>
                    )}
                </div>

                {isLoading && <p className={styles.statusMessage}>Loading receipts...</p>}
                {error && (
                    <p className={styles.statusMessage} style={{ color: "var(--error-color)" }}>
                        {error}
                    </p>
                )}

                {!isLoading && !error && (
                    <div className={styles.receiptsGrid}>
                        {filteredReceipts.length > 0 ? (
                            filteredReceipts.map((receipt) => (
                                <ReceiptCard key={receipt._id} receipt={receipt} companyInfo={currentCompany} />
                            ))
                        ) : (
                            <p className={styles.statusMessage}>No receipts found for the selected period.</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default ReceiptsPage;
