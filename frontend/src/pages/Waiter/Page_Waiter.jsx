import React, { useState, useMemo, useEffect, useCallback } from "react";
import styles from "./Styles/Page_Waiter.module.css";
import NewOrderModal from "./Modal_NewOrder";
import OrderCard from "./Comp_OrderCard";
import { useSocket } from "@utils/Sockets/SocketContext";
import { useAuth } from "@utils/Auth/AuthContext";
import axios from "@config/Axios";
import Navbar from "@components/Navbar";

const filterOptions = ["All", "Pending", "Preparing", "Ready", "Delivered"];

const Page_Waiter = () => {
    const [activeTab, setActiveTab] = useState("Waiters");
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("Ready");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [menuItems, setMenuItems] = useState([]);

    const { currentCompany, currentPermissions } = useAuth();
    const { socket, isConnected, isSocketReadyForData } = useSocket(); // Get isSocketReadyForData

    if (!currentPermissions.accessToWaiters) {
        return (
            <>
                <Navbar
                    navBarLabel={"Waiter"}
                    tabs={["Kitchen", "Waiters"]}
                    links={["/kitchen", "/waiters"]}
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
                return exists ? prevOrders : [newOrder, ...prevOrders];
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

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!orderId || !currentCompany?._id) return;
        const apiUrl = `/company/${currentCompany._id}/orders/${orderId}/status`;
        try {
            await axios.put(apiUrl, { status: newStatus });
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Unknown update error";
            alert(`Error updating order status: ${errorMsg}`);
        }
    };

    const filteredOrders = useMemo(() => {
        if (activeFilter === "All") return orders;
        return orders.filter((order) => order.status === activeFilter);
    }, [orders, activeFilter]);

    const handleFilterClick = (filter) => setActiveFilter(filter);
    const handleFabClick = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleAddOrder = async (newOrderDataFromModal) => {
        if (!currentCompany?._id) {
            alert("Error: Company information is missing.");
            return;
        }
        const apiUrl = `/company/${currentCompany._id}/orders`;
        const orderPayload = { ...newOrderDataFromModal };
        setIsModalOpen(false);
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
                tabs={["Kitchen", "Waiters"]}
                links={["/kitchen", "/waiters"]}
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
            {isModalOpen && (
                <NewOrderModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleAddOrder} menuItems={menuItems} />
            )}
        </div>
    );
};

export default Page_Waiter;
