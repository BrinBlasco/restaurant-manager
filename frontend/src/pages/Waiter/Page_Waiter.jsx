import React, { useState, useMemo, useEffect, useCallback } from "react";
import styles from "./Styles/Page_Waiter.module.css";
import NewOrderModal from "./Modal_NewOrder";
import OrderCard from "./Comp_OrderCard";
import { useSocket } from "@utils/Sockets/SocketContext";
import { useAuth } from "@utils/Auth/AuthContext";
import axios from "@config/Axios";
import Navbar from "@components/Navbar";
import ModalCheckout from "./Modal_Checkout";

const filterOptions = ["All", "Pending", "Preparing", "Ready", "Delivered"];

const Page_Waiter = () => {
    const [activeTab, setActiveTab] = useState("Waiters");
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("Ready");
    const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
    const [menuItems, setMenuItems] = useState([]);

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [orderToCheckout, setOrderToCheckout] = useState(null);

    const { currentCompany, currentPermissions, employee } = useAuth();
    const { socket, isConnected, isSocketReadyForData } = useSocket();

    if (!currentPermissions.accessToWaiters) {
        return (
            <>
                <Navbar
                    navBarLabel={"Waiter"}
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
    const fetchOrders = useCallback(
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
                setFetchError("Could not load orders. Please try again later.");
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        },
        [currentCompany?._id]
    );

    const fetchMenuItems = useCallback(async () => {
        if (!currentCompany?._id) return;
        const apiUrl = `/company/${currentCompany._id}/menu-items`;
        try {
            const res = await axios.get(apiUrl);
            setMenuItems(res.data || []);
        } catch (err) {
            setMenuItems([]);
        }
    }, [currentCompany?._id]);

    useEffect(() => {
        const companyId = currentCompany?._id;
        const shouldSetupSocketListeners = socket && isSocketReadyForData && companyId;

        if (!shouldSetupSocketListeners) return;

        fetchOrders("socket ready for company " + companyId);
        fetchMenuItems();

        const handleNewOrder = (newOrder) => {
            setOrders((prevOrders) => {
                const exists = prevOrders.some((o) => o._id === newOrder._id);
                return exists ? prevOrders : [...prevOrders, newOrder];
            });
        };

        const handleOrderUpdate = (updatedOrder) => {
            setOrders((prevOrders) => prevOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)));
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
    }, [socket, isSocketReadyForData, currentCompany?._id, fetchOrders, fetchMenuItems, setOrders]);

    const handleTransactionComplete = async (receiptDataFromModal) => {
        if (!currentCompany?._id) {
            alert("Error: Company information is missing.");
            return;
        }

        try {
            const payload = {
                ...receiptDataFromModal,
                employeeID: employee._id,
            };

            const receiptApiUrl = `/company/${currentCompany._id}/receipts`;
            await axios.post(receiptApiUrl, payload);

            const orderStatusApiUrl = `/company/${currentCompany._id}/orders/${receiptDataFromModal.orderID}/status`;
            await axios.put(orderStatusApiUrl, { status: "Paid" });

            setIsCheckoutOpen(false);
            setOrderToCheckout(null);
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || "An error occurred during checkout.";
            alert(`Error during checkout: ${errMsg}`);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!orderId || !currentCompany?._id) return;

        if (newStatus === "Paid") {
            const orderForCheckout = orders.find((o) => o._id === orderId);
            if (orderForCheckout) {
                setOrderToCheckout(orderForCheckout);
                setIsCheckoutOpen(true);
            } else {
                alert("Error: Could not find the order to check out.");
            }
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

    const filteredOrders = useMemo(() => {
        if (activeFilter === "All") return orders.filter((order) => !["Delivered", "Cancelled", "Paid"].includes(order.status));
        return orders.filter((order) => order.status === activeFilter);
    }, [orders, activeFilter]);

    const handleFilterClick = (filter) => setActiveFilter(filter);
    const handleFabClick = () => setIsNewOrderModalOpen(true);
    const handleCloseNewOrderModal = () => setIsNewOrderModalOpen(false);

    const handleAddOrder = async (newOrderDataFromModal) => {
        if (!currentCompany?._id) {
            alert("Error: Company information is missing.");
            return;
        }
        const apiUrl = `/company/${currentCompany._id}/orders`;
        const orderPayload = { ...newOrderDataFromModal };
        setIsNewOrderModalOpen(false);
        try {
            await axios.post(apiUrl, orderPayload);
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || "Unknown submit error";
            alert(`Error submitting order: ${errMsg}`);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!currentCompany?._id || !orderId) return;
        const apiUrl = `/company/${currentCompany._id}/orders/${orderId}`;
        try {
            await axios.delete(apiUrl);
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || "Unknown delete error";
            alert(`Error deleting order: ${errMsg}`);
        }
    };

    return (
        <div className={styles.appContainer}>
            <Navbar
                navBarLabel={"Waiter"}
                navLinks={{
                    POS: "/receipts",
                    Kitchen: "/kitchen",
                    Waiters: "/waiters",
                }}
                onTabChange={setActiveTab}
            />
            <div className={styles.filters}>
                {filterOptions.map((filter) => (
                    <button
                        key={filter}
                        className={`${styles.filterButton} ${activeFilter === filter ? styles.filterButtonActive : ""}`}
                        onClick={() => handleFilterClick(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>
            {isLoading && <p className={styles.loadingMessage}>Loading orders...</p>}
            <div className={styles.orderList}>
                {!isLoading && filteredOrders.length > 0
                    ? filteredOrders.map((order) =>
                          order?._id ? (
                              <OrderCard
                                  key={order._id}
                                  onUpdateStatus={handleUpdateStatus}
                                  onDelete={handleDeleteOrder}
                                  order={order}
                              />
                          ) : null
                      )
                    : !isLoading && <p className={styles.noOrdersMessage}>No orders found for '{activeFilter}' status.</p>}
            </div>
            <button className={styles.fab} onClick={handleFabClick} aria-label="Add new order">
                +
            </button>

            {isNewOrderModalOpen && (
                <NewOrderModal
                    isOpen={isNewOrderModalOpen}
                    onClose={handleCloseNewOrderModal}
                    onSubmit={handleAddOrder}
                    menuItems={menuItems}
                />
            )}

            {isCheckoutOpen && orderToCheckout && (
                <ModalCheckout
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    order={orderToCheckout}
                    onTransactionComplete={handleTransactionComplete}
                />
            )}
        </div>
    );
};

export default Page_Waiter;
