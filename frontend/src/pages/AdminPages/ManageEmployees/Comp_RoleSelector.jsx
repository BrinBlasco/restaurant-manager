import React, { useState, useEffect, useRef } from "react";
import styles from "./Styles/Comp_RoleSelector.module.css";

const RoleSelector = ({ initialRoles, onChange }) => {
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const availableRoles = initialRoles.filter(
        (initialRole) => !selectedRoles.some((selectedRole) => selectedRole._id === initialRole._id)
    );

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelectRole = (roleId) => {
        const roleToAdd = initialRoles.find((r) => r._id === roleId);
        if (roleToAdd) {
            const newSelectedRoles = [...selectedRoles, roleToAdd];
            setSelectedRoles(newSelectedRoles);
            setIsOpen(false);
            if (onChange) {
                onChange(newSelectedRoles);
            }
        }
    };

    const handleRemoveRole = (roleId) => {
        const newSelectedRoles = selectedRoles.filter((r) => r._id !== roleId);
        setSelectedRoles(newSelectedRoles);
        if (onChange) {
            onChange(newSelectedRoles);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={styles.container}>
            <div className={styles.roleContainer}>
                {selectedRoles.map((role, i) => (
                    <div
                        key={i}
                        className={styles.roleChip}
                        onClick={(e) => {
                            e.preventDefault();
                            handleRemoveRole(role._id);
                        }}
                        title={`Remove ${role.name}`}
                    >
                        {role.name}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ marginLeft: "8px", pointerEvents: "none" }}
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                ))}
            </div>
            <div className={styles.dropdown} ref={dropdownRef}>
                <button
                    className={styles.addRoleBtn}
                    onClick={(e) => {
                        e.preventDefault();
                        toggleDropdown();
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                {isOpen && (
                    <div className={styles.dropdownContent}>
                        {availableRoles.length > 0 ? (
                            availableRoles.map((role, i) => (
                                <div
                                    key={i}
                                    className={styles.dropdownItem}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSelectRole(role._id);
                                    }}
                                >
                                    {role.name}
                                </div>
                            ))
                        ) : (
                            <div className={`${styles.dropdownItem} ${styles.disabled}`}>No roles available</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleSelector;
