import axios from "@config/Axios";
import React, { useEffect, useState } from "react";
import Navbar from "@components/Navbar";
import RoleItem from "./Comp_RoleItem";
import AddRoleForm from "./Form_AddRole";
import Loading from "@components/Loading";
import styles from "./Styles/Page_ManageRoles.module.css";
import { useAuth } from "@utils/Auth/AuthContext";

const ManageRoles = () => {
    const { currentPermissions, currentCompany, loading } = useAuth();
    const [activeTab, setActiveTab] = useState("Menu");
    const [items, setItems] = useState([]);
    const [currItemId, setCurrItemId] = useState(null);
    const [currItem, setCurrItem] = useState(null);

    const getItems = async () => {
        try {
            const res = await axios.get(`/company/${currentCompany._id}/roles/`);
            setItems(() => [...res.data]);
        } catch (err) {}
    };

    const getItem = (id) => {
        const item = items.find((item) => item._id === id);
        setCurrItem(item);
    };

    const upsertState = (newItem) => {
        setItems(() => {
            const exists = items.some((item) => item._id === newItem._id);

            return exists ? items.map((item) => (item._id === newItem._id ? newItem : item)) : [...items, newItem];
        });
    };

    const removeFromState = (deletedRoleId) => {
        setItems(() => {
            const exists = items.some((item) => item._id === deletedRoleId);

            return exists ? items.filter((item) => item._id !== deletedRoleId) : items;
        });
    };

    useEffect(() => {
        if (loading && !currentCompany) return;
        getItems();
    }, [loading, currentCompany]);

    useEffect(() => {
        if (currItemId) {
            getItem(currItemId);
        }
    }, [currItemId]);

    if (loading) {
        return <Loading />;
    }
    if (!currentPermissions.editRoles) {
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
            <Navbar navBarLabel={"Admin Panel"} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className={styles.container}>
                <div className={styles.left}>
                    <h1>Roles</h1>
                    <div className={styles.items}>
                        {items.length > 0 &&
                            items.map((item, idx) => (
                                <RoleItem
                                    key={idx}
                                    onRoleDelete={removeFromState}
                                    setCurrItemId={setCurrItemId}
                                    currentCompany={currentCompany}
                                >
                                    {item}
                                </RoleItem>
                            ))}
                    </div>
                </div>
                <div className={styles.right}>
                    <AddRoleForm
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

export default ManageRoles;
