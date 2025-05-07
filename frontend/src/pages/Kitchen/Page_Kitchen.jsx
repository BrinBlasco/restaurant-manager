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
    const { socket, isConnected } = useSocket();

    if (!currentPermissions.accessToKitchen) {
        return (
            <>
                <Navbar
                    companyName={currentCompany?.name}
                    tabs={["Kitchen", "Waiters"]}
                    links={["/kitchen", "/waiters"]}
                    onTabChange={setActiveTab}
                />
                <div
                    style={{
                        height: "100%",
                        placeContent: "center",
                    }}
                >
                    <h1 style={{ fontSize: "5rem", textAlign: "center" }}>403 - Forbidden</h1>
                </div>
            </>
        );
    }

    const fetchKitchenOrders = useCallback(async () => {
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
            console.error(`Failed to fetch initial kitchen orders from ${apiUrl}:`, errorMsg);
            setFetchError("Could not load kitchen orders. Please try again later.");
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentCompany?._id]);

    useEffect(() => {
        fetchKitchenOrders();
    }, [fetchKitchenOrders]);

    useEffect(() => {
        if (!socket || !isConnected) {
            if (socket) {
                socket.off("NEW_ORDER");
                socket.off("ORDER_UPDATE");
                socket.off("ORDER_DELETE");
            }
            return;
        }
        console.log("Kitchen Page: Attaching WebSocket listeners...");

        const handleNewOrder = (newOrder) => {
            console.log("Kitchen WS received NEW_ORDER:", newOrder);
            setOrders((prevOrders) => {
                const exists = prevOrders.some((o) => o._id === newOrder._id);
                if (!exists && ["Pending", "Preparing", "Ready"].includes(newOrder.status)) {
                    return [...prevOrders, newOrder];
                }
                return prevOrders;
            });
        };

        const handleOrderUpdate = (updatedOrder) => {
            console.log("Kitchen WS received ORDER_UPDATE:", updatedOrder);
            if (["Delivered", "Cancelled"].includes(updatedOrder.status)) {
                setOrders((prevOrders) => prevOrders.filter((order) => order._id !== updatedOrder._id));
            } else {
                setOrders((prevOrders) => prevOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)));
            }
        };

        const handleOrderDelete = (targetOrder) => {
            console.log("Waiter WS received ORDER_DELETE", targetOrder);
            setOrders((prevOrders) => prevOrders.filter((order) => order._id !== targetOrder._id));
        };

        socket.on("NEW_ORDER", handleNewOrder);
        socket.on("ORDER_UPDATE", handleOrderUpdate);
        socket.on("ORDER_DELETE", handleOrderDelete);
        return () => {
            console.log("Kitchen Page: Removing WebSocket listeners...");
            socket.off("NEW_ORDER", handleNewOrder);
            socket.off("ORDER_UPDATE", handleOrderUpdate);
            socket.off("ORDER_DELETE", handleOrderDelete);
        };
    }, [socket, isConnected]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!orderId || !currentCompany?._id) {
            console.error("Missing orderId or companyId for status update");
            return;
        }
        const apiUrl = `/company/${currentCompany._id}/orders/${orderId}/status`;
        console.log(`Sending status update for Order ${orderId} to ${newStatus} via API: PUT ${apiUrl}`);
        try {
            await axios.put(apiUrl, { status: newStatus });
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Unknown update error";
            console.error(`Failed to update status for order ${orderId} via API:`, errorMsg);
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
                companyName={currentCompany?.name}
                tabs={["Kitchen", "Waiters"]}
                links={["/kitchen", "/waiters"]}
                onTabChange={setActiveTab}
            />
            <div className={styles.appContainer}>
                <header className={styles.header}>
                    <p style={{ fontSize: "0.8em", textAlign: "center", margin: "5px 0" }}>
                        Socket Status: {isConnected ? "Connected" : "Disconnected"}
                        {socket?.id ? ` (ID: ${socket.id})` : ""}
                    </p>
                    {fetchError && <p className={styles.errorMessage}>{fetchError}</p>}
                </header>
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
