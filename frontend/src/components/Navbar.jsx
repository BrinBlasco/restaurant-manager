import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";

import { useAuth } from "@utils/Auth/AuthContext";
import { useClickOutside } from "@hooks/useClickOutside";
import "./Styles/Navbar.css";

const UserActions = ({ onNavigate, onLogout }) => (
    <>
        <button onClick={() => onNavigate("/dashboard")}>Dashboard</button>
        <button
            onClick={() => {
                onLogout();
                onNavigate("/login");
            }}
        >
            Logout
        </button>
    </>
);

const Navbar = ({
    navBarLabel,
    navLinks = {
        Company: "/AdminPanel/manageCompany",
        Employees: "/AdminPanel/manageEmployees",
        Roles: "/AdminPanel/manageRoles",
        Menu: "/AdminPanel/manageMenu",
    },
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const dropdownRef = useRef(null);
    const userCircleRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const burgerIconRef = useRef(null);

    useClickOutside([dropdownRef, userCircleRef], () => setShowDropdown(false));
    useClickOutside([mobileMenuRef, burgerIconRef], () => setShowMobileMenu(false));

    const handleNavigation = (path) => {
        navigate(path);
        setShowDropdown(false);
        setShowMobileMenu(false);
    };

    const renderNavLinks = (reversed = false) => {
        let entries = Object.entries(navLinks);
        if (reversed) {
            entries.reverse();
        }

        return entries.map(([label, path]) => (
            <a
                key={path}
                href={path}
                onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(path);
                }}
                className={location.pathname === path ? "active-link" : ""}
            >
                {label}
            </a>
        ));
    };

    return (
        <header className="navbar--Navbar">
            <div className="logo">{navBarLabel}</div>

            <nav className="nav-links">{renderNavLinks()}</nav>

            <div className="navbar--right-section">
                <div className="menu-icon" onClick={() => setShowMobileMenu(true)} ref={burgerIconRef}>
                    <FaBars />
                </div>

                <div
                    className="employee-circle"
                    onClick={() => setShowDropdown(!showDropdown)}
                    ref={userCircleRef}
                    aria-expanded={showDropdown}
                    aria-haspopup="true"
                >
                    <FaUserCircle size={30} />
                </div>

                {showDropdown && (
                    <div className="dropdown-menu" ref={dropdownRef}>
                        <UserActions onNavigate={handleNavigation} onLogout={logout} />
                    </div>
                )}
            </div>

            {/* Mobile Flyout Menu */}
            <div className={`mobile-menu ${showMobileMenu ? "open" : ""}`} ref={mobileMenuRef}>
                <div className="close-icon" onClick={() => setShowMobileMenu(false)}>
                    <FaTimes size={30} />
                </div>
                <nav className="mobile-nav-links">{renderNavLinks(true)}</nav>
                <div className="mobile-user-links">
                    <UserActions onNavigate={handleNavigation} onLogout={logout} />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
