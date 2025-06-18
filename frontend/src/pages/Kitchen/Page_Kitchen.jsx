import React, { useState, useMemo, useEffect, useCallback } from "react";
import styles from "./Page_Kitchen.module.css";
import { useSocket } from "@utils/Sockets/SocketContext";
import { useAuth } from "@utils/Auth/AuthContext";
import axios from "@config/Axios";
import Navbar from "@components/Navbar";
import OrderCard from "./Comp_OrderCard";

const filterOptions = ["All", "Pending", "Preparing", "Ready", "Delivered"];

const Page_Kitchen = () => {
    const [activeTab, setActiveTab] = useState("Kitchen");
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("Pending");

    const { currentCompany, currentPermissions } = useAuth();
    const { socket, isConnected, isSocketReadyForData } = useSocket();

    if (!currentPermissions.accessToKitchen) {
        return (
            <>
                <Navbar
                    navBarLabel={"Kitchen"}
                    navLinks={{
                        POS: "/receipts",
                        Kitchen: "/kitchen",
                        Waiters: "/waiters",
                    }}
                    onTabChange={setActiveTab}
                />
                <div style={{ height: "100%", placeContent: "center" }}>
                    <h1 style={{ fontSize: "5rem", textAlign: "center" }}>403 - Forbidden</h1>
                </div>
            </>
        );
    }

    const fetchKitchenOrders = useCallback(
        async (reason = "data sync") => {
            if (!currentCompany?._id) return;
            setIsLoading(true);
            setFetchError(null);
            const apiUrl = `/company/${currentCompany._id}/orders`;
            try {
                const response = await axios.get(apiUrl, {
                    params: { status: "Pending,Preparing,Ready,Delivered" },
                });
                setOrders(response.data || []);
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Unknown fetch error";
                setFetchError("Could not load kitchen orders. Please try again later.");
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        },
        [currentCompany?._id]
    );

    useEffect(() => {
        const companyId = currentCompany?._id;
        const shouldSetupSocketListeners = socket && isSocketReadyForData && companyId;

        if (!shouldSetupSocketListeners) return;

        fetchKitchenOrders("socket ready for company " + companyId);

        const handleNewOrder = (newOrder) => {
            setOrders((prevOrders) => {
                const exists = prevOrders.some((o) => o._id === newOrder._id);
                if (!exists && ["Pending", "Preparing", "Ready"].includes(newOrder.status)) {
                    return [...prevOrders, newOrder];
                }
                return prevOrders;
            });
        };

        const handleOrderUpdate = (updatedOrder) => {
            if (["Delivered"].includes(updatedOrder.status)) {
                setOrders((prevOrders) => prevOrders.filter((order) => order._id !== updatedOrder._id));
            } else {
                setOrders((prevOrders) => prevOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)));
            }
        };

        const handleOrderDelete = (targetOrder) => {
            const orderIdToDelete = targetOrder.orderId || targetOrder._id;
            if (orderIdToDelete) {
                setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderIdToDelete));
            }
        };

        socket.on("NEW_ORDER", handleNewOrder);
        socket.on("ORDER_UPDATE", handleOrderUpdate);
        socket.on("ORDER_DELETE", handleOrderDelete);

        return () => {
            socket.off("NEW_ORDER", handleNewOrder);
            socket.off("ORDER_UPDATE", handleOrderUpdate);
            socket.off("ORDER_DELETE", handleOrderDelete);
        };
    }, [socket, isSocketReadyForData, currentCompany?._id, fetchKitchenOrders, setOrders]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!orderId || !currentCompany?._id) {
            console.error("Missing orderId or companyId for status update");
            return;
        }
        const apiUrl = `/company/${currentCompany._id}/orders/${orderId}/status`;
        try {
            await axios.put(apiUrl, { status: newStatus });
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Unknown update error";
            alert(`Error updating order status: ${errorMsg}`);
        }
    };

    const filteredAndSortedOrders = useMemo(() => {
        let filtered = orders;
        if (activeFilter !== "All") {
            filtered = orders.filter((order) => order.status === activeFilter);
        } else {
            filtered = orders.filter((order) => !["Delivered", "Cancelled"].includes(order.status));
        }
        return filtered.sort((a, b) => {
            const statusOrder = { Pending: 1, Preparing: 2, Ready: 3 };
            const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
            if (statusDiff !== 0) return statusDiff;
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            return timeA - timeB;
        });
    }, [orders, activeFilter]);

    return (
        <>
            <Navbar
                navBarLabel={"Kitchen"}
                navLinks={{
                    POS: "/receipts",
                    Kitchen: "/kitchen",
                    Waiters: "/waiters",
                }}
                onTabChange={setActiveTab}
            />
            <div className={styles.appContainer}>
                <div className={styles.filters}>
                    {filterOptions.map((filter) => (
                        <button
                            key={filter}
                            className={`${styles.filterButton} ${activeFilter === filter ? styles.filterButtonActive : ""}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
                {isLoading && <p className={styles.loadingMessage}>Loading kitchen orders...</p>}
                {!isLoading && filteredAndSortedOrders.length > 0 ? (
                    <div className={styles.orderGrid}>
                        {filteredAndSortedOrders.map((order) => (
                            <OrderCard key={order._id} order={order} onUpdateStatus={handleUpdateStatus} />
                        ))}
                    </div>
                ) : (
                    !isLoading && <p className={styles.noOrdersMessage}>No orders found for '{activeFilter}'.</p>
                )}
            </div>
        </>
    );
};

export default Page_Kitchen;
