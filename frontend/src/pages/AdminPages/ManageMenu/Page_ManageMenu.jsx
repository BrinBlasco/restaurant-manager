import axios from "@config/Axios";
import React, { useEffect, useState } from "react";

import Navbar from "@components/Navbar";
import MenuItem from "./Comp_MenuItem";
import AddMenuItemForm from "./Form_AddMenuItem";
import Loading from "@components/Loading";

import styles from "./Styles/Page_ManageMenu.module.css";

import { useAuth } from "@utils/Auth/AuthContext";

const ManageMenu = () => {
    const { currentPermissions, currentCompany, loading } = useAuth();

    const [activeTab, setActiveTab] = useState("Menu");
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

    const [currItemId, setCurrItemId] = useState(null);
    const [currItem, setCurrItem] = useState(null);

    const [currFilter, setCurrFilter] = useState("All");

    useEffect(() => {
        if (loading && !currentCompany) return;
        getItems();
    }, [loading, currentCompany]);

    useEffect(() => {
        if (!currItemId) {
            setCurrItem(null);
            return;
        }
        getItem(currItemId);
    }, [currItemId]);

    const filterItems = () => {
        if (currFilter === "All") {
            setFilteredItems([...items]);
        } else {
            const newFilteredItems = items.filter((item) => item.type === currFilter);
            setFilteredItems(newFilteredItems);
        }
    };

    useEffect(() => {
        filterItems();
    }, [currFilter, items]);

    const removeFromState = (itemId) => {
        setItems((prevItems) => {
            const exists = prevItems.some((item) => item._id === itemId);
            return exists ? prevItems.filter((item) => item._id !== itemId) : prevItems;
        });
    };

    const upsertState = (newItem) => {
        alert("Success");
        setItems((prevItems) => {
            const exists = prevItems.some((item) => item._id === newItem._id);
            return exists ? prevItems.map((item) => (item._id === newItem._id ? newItem : item)) : [...prevItems, newItem];
        });
    };

    const getItems = async () => {
        try {
            const res = await axios.get(`/company/${currentCompany._id}/menu-items`);
            setItems([...res.data]);
        } catch (err) {
            console.log(err);
        }
    };

    const getItem = (id) => {
        const item = items.find((item) => item._id === id);
        setCurrItem(item);
    };

    if (loading) {
        return <Loading />;
    }

    if (!currentPermissions.editMenu) {
        return (
            <>
                <Navbar />
                <div style={{ height: "100%", placeContent: "center" }}>
                    <h1 style={{ fontSize: "5rem", textAlign: "center" }}>403 - Forbidden</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar navBarLabel={"Admin Panel"} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className={styles.ManageMenu}>
                <div className={styles.left}>
                    <h1>Menu Items</h1>

                    <div className={styles.filters}>
                        <div onClick={() => setCurrFilter("All")} className={currFilter === "All" ? styles.activeFilter : ""}>
                            All
                        </div>
                        <div
                            onClick={() => setCurrFilter("Full Course")}
                            className={currFilter === "Full Course" ? styles.activeFilter : ""}
                        >
                            Full Course
                        </div>
                        <div
                            onClick={() => setCurrFilter("Appetizers")}
                            className={currFilter === "Appetizers" ? styles.activeFilter : ""}
                        >
                            Appetizers
                        </div>
                        <div
                            onClick={() => setCurrFilter("Dessert")}
                            className={currFilter === "Dessert" ? styles.activeFilter : ""}
                        >
                            Dessert
                        </div>
                        <div
                            onClick={() => setCurrFilter("Salads")}
                            className={currFilter === "Salads" ? styles.activeFilter : ""}
                        >
                            Salads
                        </div>
                        <div
                            onClick={() => setCurrFilter("Alcoholic Drink")}
                            className={currFilter === "Alcoholic Drink" ? styles.activeFilter : ""}
                        >
                            Alcoholic Drink
                        </div>
                        <div onClick={() => setCurrFilter("Misc")} className={currFilter === "Misc" ? styles.activeFilter : ""}>
                            Misc
                        </div>
                    </div>

                    <div className={styles.items} id="menuItemContainer">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <MenuItem
                                    key={item._id}
                                    onMenuItemDelete={removeFromState}
                                    setCurrItemId={setCurrItemId}
                                    currentCompany={currentCompany}
                                >
                                    {item}
                                </MenuItem>
                            ))
                        ) : (
                            <p style={{ padding: "0.5rem" }}>No items match the current filter or no items available.</p>
                        )}
                    </div>
                </div>

                <div className={styles.right}>
                    <AddMenuItemForm
                        setCurrItem={setCurrItem}
                        setCurrItemId={setCurrItemId}
                        currentItem={currItem}
                        currentCompany={currentCompany}
                        upsertState={upsertState}
                    />
                </div>
            </div>
        </>
    );
};

export default ManageMenu;
