import axios from "@config/Axios";
import React, { useEffect, useRef, useState } from "react";
import Button from "@components/Button";
import styles from "./Page_ChangeAccountData.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@utils/Auth/AuthContext";
import { FaAngleLeft } from "react-icons/fa6";

const ChangeAccountDataPage = () => {
    const navigate = useNavigate();
    const { employee } = useAuth();
    const [error, setError] = useState("");

    const formRef = useRef(null);

    const [personalDetails, setPersonalDetails] = useState({
        upid: "",
        firstName: "",
        lastName: "",
        phone: "",
        dateOfBirth: "",
    });
    const [address, setAddress] = useState({
        country: "",
        address: "",
        zip: "",
        city: "",
    });
    const [accountDetails, setAccountDetails] = useState({
        username: "",
        email: "",
    });
    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const formatDate = (isoDate) => {
        if (!isoDate) return "";
        return new Date(isoDate).toISOString().split("T")[0]; // yyyy-MM-dd
    };

    useEffect(() => {
        if (!employee) return;
        setPersonalDetails({
            upid: employee.upid,
            firstName: employee.firstName,
            lastName: employee.lastName,
            phone: employee.phone,
            dateOfBirth: formatDate(employee.dateOfBirth),
        });
        setAddress({
            country: employee.address?.country,
            address: employee.address?.address,
            zip: employee.address?.zip,
            city: employee.address?.city,
        });
        setAccountDetails({
            username: employee.account?.username,
            email: employee.account?.email,
        });
    }, [employee]);

    const handlePersonalDetailsSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.patch(`/user/${employee._id}/edit/personalDetails`, personalDetails);
        } catch (err) {}
    };
    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.patch(`/user/${employee._id}/edit/address`, address);
        } catch (err) {}
    };
    const handleAccountDetailsSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.patch(`/user/${employee._id}/edit/accountDetails`, accountDetails);
        } catch (err) {}
    };
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.patch(`/user/${employee._id}/edit/password`, password);
            e.target.reset();
        } catch (err) {}
    };

    return (
        <div className={styles.main}>
            <a className={styles.backButton} onClick={() => navigate("/dashboard")}>
                <FaAngleLeft />
            </a>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className={`${styles.wrapper} ${styles.personalDetails}`}>
                    <h1>Change Personal Details</h1>

                    <form onSubmit={handlePersonalDetailsSubmit}>
                        <div className={styles.formFields}>
                            <label htmlFor="upid">UPID (Unique Personal Identifier)</label>
                            <input
                                id="upid"
                                value={personalDetails.upid || ""}
                                onChange={(e) => setPersonalDetails({ ...personalDetails, upid: e.target.value })}
                            />
                        </div>

                        <div className={styles.formFields}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        width: "50%",
                                    }}
                                >
                                    <label htmlFor="fname">First Name</label>
                                    <input
                                        type="text"
                                        id="fname"
                                        value={personalDetails.firstName || ""}
                                        onChange={(e) =>
                                            setPersonalDetails({
                                                ...personalDetails,
                                                firstName: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        width: "50%",
                                    }}
                                >
                                    <label htmlFor="lname">Last Name</label>
                                    <input
                                        type="text"
                                        id="lname"
                                        value={personalDetails.lastName || ""}
                                        onChange={(e) =>
                                            setPersonalDetails({
                                                ...personalDetails,
                                                lastName: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formFields}>
                            <label htmlFor="phone">Phone</label>
                            <input
                                id="phone"
                                type="text"
                                value={personalDetails.phone || ""}
                                onChange={(e) =>
                                    setPersonalDetails({
                                        ...personalDetails,
                                        phone: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className={styles.formFields}>
                            <label htmlFor="bdate">Date of Birth</label>
                            <input
                                id="bdate"
                                type="date"
                                value={personalDetails.dateOfBirth || ""}
                                onChange={(e) =>
                                    setPersonalDetails({
                                        ...personalDetails,
                                        dateOfBirth: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <p className={styles.error}>{error}</p>

                        <Button
                            type="submit"
                            size="small"
                            style={{ marginTop: "1.5rem" }}
                            backgroundColor={"var(--primary-color)"}
                        >
                            Update
                        </Button>
                    </form>
                </div>

                <div className={`${styles.wrapper} ${styles.changeAddress}`}>
                    <h1>Change Address</h1>
                    <form onSubmit={handleAddressSubmit}>
                        <div className={styles.formFields}>
                            <label htmlFor="country">Country</label>
                            <input
                                id="country"
                                type="text"
                                value={address.country || ""}
                                placeholder={address.country ? "" : "Enter your country"}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        country: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className={styles.formFields}>
                            <label htmlFor="address">Address</label>
                            <input
                                type="text"
                                id="address"
                                value={address.address || ""}
                                placeholder={address.address ? "" : "Enter your address"}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        address: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className={styles.formFields}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        width: "30%",
                                    }}
                                >
                                    <label htmlFor="zipcode">Zip Code</label>
                                    <input
                                        type="text"
                                        id="zipcode"
                                        value={address.zip || ""}
                                        placeholder={address.zip ? "" : "Enter zip code"}
                                        onChange={(e) => {
                                            const zip = e.target.value;
                                            if (zip === "" || (/^[0-9]*$/.test(zip) && zip.length <= 7)) {
                                                setAddress({
                                                    ...address,
                                                    zip: zip,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        width: "70%",
                                    }}
                                >
                                    <label htmlFor="city">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        value={address.city || ""}
                                        placeholder={address.city ? "" : "Enter your city"}
                                        onChange={(e) =>
                                            setAddress({
                                                ...address,
                                                city: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <p className={styles.error}>{error}</p>
                        <Button
                            type="submit"
                            size="small"
                            style={{ marginTop: "1.5rem" }}
                            backgroundColor={"var(--primary-color)"}
                        >
                            Update
                        </Button>
                    </form>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <div className={`${styles.wrapper} ${styles.accountDetails}`}>
                    <h3>Change Account Details</h3>
                    <form onSubmit={handleAccountDetailsSubmit}>
                        <div className={styles.formFields}>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                value={accountDetails.username}
                                onChange={(e) => {
                                    setAccountDetails({
                                        ...accountDetails,
                                        username: e.target.value,
                                    });
                                }}
                            />
                        </div>

                        <div className={styles.formFields}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                value={accountDetails.email}
                                onChange={(e) => {
                                    setAccountDetails({
                                        ...accountDetails,
                                        email: e.target.value,
                                    });
                                }}
                            />
                        </div>

                        <p className={styles.error}>{error}</p>

                        <Button
                            type="submit"
                            size="small"
                            style={{ marginTop: "1.5rem" }}
                            backgroundColor={"var(--primary-color)"}
                        >
                            Update
                        </Button>
                    </form>
                </div>

                <div className={`${styles.wrapper} ${styles.changePassword}`}>
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordSubmit} useref={formRef}>
                        <div className={styles.formFields}>
                            <label htmlFor="currentPassword">Current Password</label>
                            <input
                                id="currentPassword"
                                type="password"
                                onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                            />
                        </div>
                        <div className={styles.formFields}>
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                            />
                        </div>

                        <div className={styles.formFields}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                            />
                        </div>

                        <p className={styles.error}>{error}</p>

                        <Button
                            type="submit"
                            size="small"
                            style={{ marginTop: "1.5rem" }}
                            backgroundColor={"var(--primary-color)"}
                        >
                            Update
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangeAccountDataPage;
