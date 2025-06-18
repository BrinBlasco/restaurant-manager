import axios from "@config/Axios";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "@components/Button";
import styles from "./Styles/Form_AddRole.module.css";

const AddRoleForm = ({ setCurrItem, setCurrItemId, currentItem, currentCompany, upsertState }) => {
    const defaultRole = {
        name: "",
        description: "",
        permissions: {
            accessToKitchen: false,
            accessToWaiters: false,
            editEmployees: false,
            editCompany: false,
            editRoles: false,
            editMenu: false,
        },
        companyID: currentCompany._id,
    };

    const [role, setRoles] = useState(defaultRole);

    useEffect(() => {
        if (!currentItem) return;
        setRoles(currentItem);
    }, [currentItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = currentItem
                ? await axios.put(`/company/${currentCompany._id}/roles/${currentItem._id}`, role)
                : await axios.post(`/company/${currentCompany._id}/roles/`, role);

            upsertState(res.data.item);
            setRoles(defaultRole);
            setCurrItem(null);
            setCurrItemId(null);
            alert("Success!");
        } catch {
            alert("Failed to add a new role.");

            console.error("New Role submission failed");
        }
    };

    return (
        <>
            <h1>{!currentItem ? "Add Role" : "Edit Role"}</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.addMenuItemFields}>
                    <label htmlFor="addRoleName">Role Name</label>
                    <input
                        type="text"
                        id="addRoleName"
                        value={role.name}
                        onChange={(e) => {
                            setRoles({ ...role, name: e.target.value });
                        }}
                    />
                </div>
                <div className={styles.addMenuItemFields}>
                    <label htmlFor="addRoleDescription">Role Description</label>
                    <textarea
                        wrap="hard"
                        id="addRoleDescription"
                        spellCheck="false"
                        value={role.description}
                        onChange={(e) => {
                            setRoles({ ...role, description: e.target.value });
                        }}
                        className={styles.textarea}
                    />
                </div>
                <span style={{ marginBottom: "-1.5rem" }}>Permissions:</span>
                <div
                    style={{
                        display: "flex",
                        flexFlow: "wrap column",
                        justifyContent: "center",
                        alignContent: "space-around",
                    }}
                >
                    <label htmlFor="editCompany" className={styles.roleLabels}>
                        <input
                            type="checkbox"
                            name="editCompany"
                            id="editCompany"
                            checked={role.permissions.editCompany}
                            onChange={(e) => {
                                setRoles({
                                    ...role,
                                    permissions: {
                                        ...role.permissions,
                                        editCompany: e.target.checked,
                                    },
                                });
                            }}
                        />
                        <span style={{ padding: "0.5rem" }}>Edit Company</span>
                    </label>
                    <label htmlFor="editEmployees" className={styles.roleLabels}>
                        <input
                            type="checkbox"
                            name="editEmployees"
                            id="editEmployees"
                            checked={role.permissions.editEmployees}
                            onChange={(e) => {
                                setRoles({
                                    ...role,
                                    permissions: {
                                        ...role.permissions,
                                        editEmployees: e.target.checked,
                                    },
                                });
                            }}
                        />
                        <span style={{ padding: "0.5rem" }}>Edit Employees</span>
                    </label>

                    <label htmlFor="editRoles" className={styles.roleLabels}>
                        <input
                            type="checkbox"
                            name="editRoles"
                            id="editRoles"
                            checked={role.permissions.editRoles}
                            onChange={(e) => {
                                setRoles({
                                    ...role,
                                    permissions: {
                                        ...role.permissions,
                                        editRoles: e.target.checked,
                                    },
                                });
                            }}
                        />
                        <span style={{ padding: "0.5rem" }}>Edit Roles</span>
                    </label>

                    <span style={{ flexBasis: "100%", height: 0 }}></span>

                    <label htmlFor="editMenu" className={styles.roleLabels}>
                        <input
                            type="checkbox"
                            name="editMenu"
                            id="editMenu"
                            checked={role.permissions.editMenu}
                            onChange={(e) => {
                                setRoles({
                                    ...role,
                                    permissions: {
                                        ...role.permissions,
                                        editMenu: e.target.checked,
                                    },
                                });
                            }}
                        />
                        <span style={{ padding: "0.5rem" }}>Edit Menu</span>
                    </label>

                    <label htmlFor="accessKitchen" className={styles.roleLabels}>
                        <input
                            type="checkbox"
                            name="accessKitchen"
                            id="accessKitchen"
                            checked={role.permissions.accessToKitchen}
                            onChange={(e) => {
                                setRoles({
                                    ...role,
                                    permissions: {
                                        ...role.permissions,
                                        accessToKitchen: e.target.checked,
                                    },
                                });
                            }}
                        />
                        <span style={{ padding: "0.5rem" }}>Access Kitchen</span>
                    </label>
                    <label htmlFor="accessWaiters" className={styles.roleLabels}>
                        <input
                            type="checkbox"
                            name="accessWaiters"
                            id="accessWaiters"
                            checked={role.permissions.accessToWaiters}
                            onChange={(e) => {
                                setRoles({
                                    ...role,
                                    permissions: {
                                        ...role.permissions,
                                        accessToWaiters: e.target.checked,
                                    },
                                });
                            }}
                        />
                        <span style={{ padding: "0.5rem" }}>Access Waiters</span>
                    </label>
                </div>
                <Button type="submit" style={{ marginTop: "-1rem" }} backgroundColor={"var(--primary-color)"}>
                    {!currentItem ? "Add Role" : "Save Changes"}
                </Button>
            </form>
        </>
    );
};

AddRoleForm.propTypes = {
    currentCompany: PropTypes.object,
    currentItem: PropTypes.object,
};

export default AddRoleForm;
