import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { useAuth } from "@utils/Auth/AuthContext";

import "./Styles/Navbar.css";

const Navbar = ({
    navBarLabel,
    tabs = ["Company", "Employees", "Roles", "Menu"],
    links = ["/AdminPanel/ManageCompany", "/AdminPanel/ManageEmployees", "/AdminPanel/ManageRoles", "/AdminPanel/ManageMenu"],
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const [showDropdown, setShowDropdown] = useState(false);

    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const userCircleRef = useRef(null);
    const burgerIconRef = useRef(null);

    const handleNavigation = (path) => {
        navigate(path);
        setShowDropdown(false);
        setShowMobileMenu(false);
    };

    const toggleDropdown = () => setShowDropdown(!showDropdown);
    const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                userCircleRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !userCircleRef.current.contains(event.target) &&
                showDropdown
            ) {
                setShowDropdown(false);
            }

            if (
                mobileMenuRef.current &&
                burgerIconRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                !burgerIconRef.current.contains(event.target) &&
                showMobileMenu
            ) {
                setShowMobileMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown, showMobileMenu]);

    return (
        <header className="navbar--Navbar">
            <div className="logo">{navBarLabel}</div>
            <div style={{ display: "flex" }}>
                <nav className="nav-links">
                    {tabs.map((tab, idx) => (
                        <a
                            key={tab}
                            href={links[idx]}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigation(links[idx]);
                            }}
                            className={location.pathname === links[idx] ? "active-link" : ""}
                        >
                            {tab}
                        </a>
                    ))}
                </nav>

                <div className="navbar--right-section">
                    <div className="menu-icon" onClick={toggleMobileMenu} ref={burgerIconRef}>
                        <FaBars />
                    </div>

                    <div
                        className="employee-circle"
                        onClick={toggleDropdown}
                        ref={userCircleRef}
                        aria-expanded={showDropdown}
                        aria-haspopup="true"
                    >
                        <FaUserCircle size={30} />
                    </div>

                    {showDropdown && (
                        <div className="dropdown-menu" ref={dropdownRef}>
                            <button onClick={() => handleNavigation("/dashboard")}>Dashboard</button>

                            <button
                                onClick={() => {
                                    logout();
                                    handleNavigation("/login");
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className={`mobile-menu ${showMobileMenu ? "open" : ""}`} ref={mobileMenuRef}>
                <div className="close-icon" onClick={toggleMobileMenu}>
                    <FaTimes size={30} />
                </div>

                <nav className="mobile-nav-links">
                    {tabs.map((tab, idx) => (
                        <a
                            key={tab}
                            href={links[idx]}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigation(links[idx]);
                            }}
                            className={location.pathname === links[idx] ? "active-link" : ""}
                        >
                            {tab}
                        </a>
                    ))}
                </nav>

                <div className="mobile-user-links">
                    <button onClick={() => handleNavigation("/dashboard")}>Dashboard</button>

                    <button onClick={() => console.log("Logout clicked")}>Logout</button>
                </div>
            </div>
        </header>
    );
};

Navbar.propTypes = {
    navBarLabel: PropTypes.string,
    tabs: PropTypes.arrayOf(PropTypes.string),
    links: PropTypes.arrayOf(PropTypes.string),
};

export default Navbar;
