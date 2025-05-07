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

    const [currItemId, setCurrItemId] = useState(null);
    const [currItem, setCurrItem] = useState(null);

    const [currFilter, setCurrFilter] = useState("");

    useEffect(() => {
        if (loading && !currentCompany) return;
        getItems();
    }, [loading, currentCompany]);

    useEffect(() => {
        if (!currItemId) return;
        getItem(currItemId);
    }, [currItemId]);

    useEffect(() => {
        filterItems();
    }, [currFilter]);

    const filterItems = () => {
        let items = document.querySelectorAll(`.${styles.items} .${styles.item}`);
        items.forEach((item) => {
            if (item.dataset.itemType !== currFilter && currFilter !== "all") {
                item.style.display = "none";
            } else {
                item.style.display = "block";
            }
        });
    };

    const getItems = async () => {
        try {
            const res = await axios.get(`/company/${currentCompany._id}/menu-items`);
            setItems(() => [...res.data]);
        } catch (err) {
            console.log(err);
        }
    };

    const getItem = async (id) => {
        try {
            const res = await axios.get(`/company/${currentCompany._id}/menu-items/${id}`);
            setCurrItem(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!currentPermissions.editMenu) {
        return (
            <>
                <Navbar />
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

    return (
        <>
            <Navbar companyName={currentCompany?.name} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className={styles.ManageMenu}>
                <div className={styles.left}>
                    <h1>Menu Items</h1>

                    <div className={styles.filters}>
                        <div onClick={() => setCurrFilter("all")}>All</div>
                        <div onClick={() => setCurrFilter("food")}>Food</div>
                        <div onClick={() => setCurrFilter("drink")}>Drinks</div>
                    </div>

                    <div className={styles.items}>
                        {items.length > 0 &&
                            items.map((item, idx) => (
                                <MenuItem key={idx} setCurrItemId={setCurrItemId} currentCompany={currentCompany}>
                                    {item}
                                </MenuItem>
                            ))}
                    </div>
                </div>

                <div className={styles.right}>
                    <AddMenuItemForm currentItem={currItem} currentCompany={currentCompany} />
                </div>
            </div>
        </>
    );
};

export default ManageMenu;
