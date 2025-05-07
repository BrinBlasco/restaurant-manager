import React, { useState, useMemo } from "react";
import styles from "./Styles/Modal_NewOrder.module.css";
import SelectedItemCard from "./Comp_SelectedItemCard";
import { v4 as genUuid } from "uuid";

const MenuItemSearchResult = ({ item, onAddItem }) => {
    if (!item || !item._id) return null;
    return (
        <div className={styles.menuItemResult}>
            <div className={styles.menuItemInfo}>
                <span>
                    {item.name || "Unnamed Item"} - ${item.price != null ? item.price.toFixed(2) : "N/A"}
                </span>
            </div>
            <button onClick={() => onAddItem(item)} className={styles.quickAddButton}>
                Add
            </button>
        </div>
    );
};

const NewOrderModal = ({ isOpen, onClose, onSubmit, menuItems = [] }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentOrderItems, setCurrentOrderItems] = useState([]);
    const [tableNumber, setTableNumber] = useState("");

    const searchResults = useMemo(() => {
        if (!searchTerm.trim() || !Array.isArray(menuItems)) return [];
        const lowerCaseSearch = searchTerm.toLowerCase();
        return menuItems.filter((item) => item?.name?.toLowerCase().includes(lowerCaseSearch));
    }, [searchTerm, menuItems]);

    const handleAddItem = (menuItem) => {
        if (!menuItem || !menuItem._id) return;
        const existingItemIndex = currentOrderItems.findIndex((item) => item.menuItem_id === menuItem._id && !item.note);
        if (existingItemIndex > -1) {
            const existingItem = currentOrderItems[existingItemIndex];
            handleUpdateQuantity(existingItem.uniqueId, existingItem.quantity + 1);
        } else {
            const newItem = {
                menuItem_id: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                uniqueId: genUuid(),
                quantity: 1,
                note: "",
            };
            setCurrentOrderItems((prevItems) => [...prevItems, newItem]);
        }
        setSearchTerm("");
    };

    const handleRemoveItem = (uniqueIdToRemove) => {
        setCurrentOrderItems((prevItems) => prevItems.filter((item) => item.uniqueId !== uniqueIdToRemove));
    };

    const handleUpdateNote = (uniqueIdToUpdate, newNote) => {
        setCurrentOrderItems((prevItems) =>
            prevItems.map((item) => (item.uniqueId === uniqueIdToUpdate ? { ...item, note: newNote } : item))
        );
    };

    const handleUpdateQuantity = (uniqueIdToUpdate, newQuantity) => {
        const quantity = Math.max(1, parseInt(newQuantity, 10) || 1);
        setCurrentOrderItems((prevItems) =>
            prevItems.map((item) => (item.uniqueId === uniqueIdToUpdate ? { ...item, quantity: quantity } : item))
        );
    };

    const handleDiscardOrder = () => {
        setSearchTerm("");
        setCurrentOrderItems([]);
        setTableNumber("");
        onClose();
    };

    const handleSubmitOrder = (event) => {
        event.preventDefault();
        // if (!tableNumber.trim()) {
        //     alert("Please enter a table number.");
        //     return;
        // }
        if (currentOrderItems.length === 0) {
            alert("Cannot submit an empty order.");
            return;
        }

        const orderData = {
            table: tableNumber.trim(),
            items: currentOrderItems.map(({ menuItem_id, name, price, quantity, note }) => ({
                menuItemId: menuItem_id,
                name,
                price,
                quantity,
                note,
            })),
        };

        console.log("Submitting corrected order data from modal:", orderData);
        onSubmit(orderData);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close new order window">
                    ×
                </button>
                <h1>Create New Order</h1>
                <div className={styles.formGroup}>
                    <label htmlFor="menuSearch">Search Menu Items:</label>
                    <input
                        id="menuSearch"
                        type="search"
                        placeholder="Search food or drinks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                        autoFocus
                    />
                </div>
                {searchTerm.trim() && (
                    <div className={styles.searchResults}>
                        {searchResults.length > 0 ? (
                            searchResults.map((item) => (
                                <MenuItemSearchResult key={item._id} item={item} onAddItem={handleAddItem} />
                            ))
                        ) : (
                            <p className={styles.noResultsText}>No items found matching "{searchTerm}".</p>
                        )}
                    </div>
                )}
                <div className={styles.currentOrderSection}>
                    <h2>Current Order Items:</h2>
                    {currentOrderItems.length > 0 ? (
                        <div className={styles.currentOrderList}>
                            {currentOrderItems.map((item) => (
                                <SelectedItemCard
                                    key={item.uniqueId}
                                    item={item}
                                    onRemoveItem={handleRemoveItem}
                                    onUpdateNote={handleUpdateNote}
                                    onUpdateQuantity={handleUpdateQuantity}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noItemsText}>Search above to add items.</p>
                    )}
                </div>
                <form onSubmit={handleSubmitOrder}>
                    <div className={`${styles.formGroup} ${styles.tableNumberGroup}`}>
                        <input
                            id="tableNumber"
                            type="text"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            //placeholder="e.g., 15 or Bar 3"
                            //required
                            className={styles.tableInput}
                        />
                        <label htmlFor="tableNumber" style={{ whiteSpace: "normal" }}>
                            Table
                            <br />
                            Number
                        </label>
                    </div>
                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            onClick={handleDiscardOrder}
                            className={`${styles.modalButton} ${styles.discardButton}`}
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={currentOrderItems.length === 0} // || !tableNumber.trim()}
                            className={`${styles.modalButton} ${styles.submitButton}`}
                        >
                            Submit Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewOrderModal;
