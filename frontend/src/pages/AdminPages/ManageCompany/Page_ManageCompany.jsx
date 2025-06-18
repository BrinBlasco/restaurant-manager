import axios from "@config/Axios";
import React, { useEffect, useState } from "react";
import Navbar from "@components/Navbar";
import Button from "@components/Button";
import Loading from "@components/Loading";
import Modal from "@components/Modal";

import styles from "./Styles/Page_ManageCompany.module.css";

import { useAuth } from "@utils/Auth/AuthContext";

const ManageCompany = () => {
    const { currentPermissions, currentCompany, loading } = useAuth();

    const [activeTab, setActiveTab] = useState("Company");
    const [error, setError] = useState("");

    const [timetable, setTimetable] = useState({
        Mon: { start: "", end: "" },
        Tue: { start: "", end: "" },
        Wed: { start: "", end: "" },
        Thu: { start: "", end: "" },
        Fri: { start: "", end: "" },
        Sat: { start: "", end: "" },
        Sun: { start: "", end: "" },
    });

    const [contactInfo, setContactInfo] = useState({
        phoneNumber: "",
        email: "",
    });

    const [identifiers, setIdentifiers] = useState({
        owner: "",
        crn: "",
        vat: "",
        companyName: "",
    });

    const [address, setAddress] = useState({
        country: "",
        address: "",
        zip: "",
        city: "",
    });

    useEffect(() => {
        if (!currentCompany) return;

        setIdentifiers({
            crn: currentCompany.crn || "",
            vat: currentCompany.vat || "",
            companyName: currentCompany.name || "",
        });

        setAddress({
            country: currentCompany.address?.country || "",
            address: currentCompany.address?.address || "",
            zip: currentCompany.address?.zip || "",
            city: currentCompany.address?.city || "",
        });

        setContactInfo({
            email: currentCompany.contactInfo?.email || "",
            phoneNumber: currentCompany.contactInfo?.phoneNumber || "",
        });

        const newTimetableState = {
            Mon: { start: "", end: "" },
            Tue: { start: "", end: "" },
            Wed: { start: "", end: "" },
            Thu: { start: "", end: "" },
            Fri: { start: "", end: "" },
            Sat: { start: "", end: "" },
            Sun: { start: "", end: "" },
        };

        if (currentCompany.operatingHours) {
            for (const day of Object.keys(newTimetableState)) {
                if (currentCompany.operatingHours[day]) {
                    newTimetableState[day].start = currentCompany.operatingHours[day].start || "";
                    newTimetableState[day].end = currentCompany.operatingHours[day].end || "";
                }
            }
        }
        setTimetable(newTimetableState);
    }, [currentCompany]);

    const handleTimeChange = (day, field, value) => {
        setTimetable((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value,
            },
        }));
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axios.patch(`/company/${currentCompany._id}/edit/companyDetails`, {
                identifiers,
                address,
            });
            alert("Updated!");
        } catch (err) {
            alert("Failed, try restarting the application...");
            setError(err.response?.data?.message || err.message || "Failed to update company details.");
        }
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axios.patch(`/company/${currentCompany._id}/edit/contactInfo`, contactInfo);
            alert("Updated!");
        } catch (err) {
            alert("Failed, try restarting the application...");
            setError(err.response?.data?.message || err.message || "Failed to update contact info.");
        }
    };

    const handleTimeTableSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axios.patch(`/company/${currentCompany._id}/edit/workingHours`, timetable);
            alert("Updated!");
        } catch (err) {
            alert("Failed, try restarting the application...");
            setError(err.response?.data?.message || err.message || "Failed to update working hours.");
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!currentPermissions.editCompany) {
        return (
            <>
                <Navbar navBarLabel={"Admin Panel"} activeTab={activeTab} onTabChange={setActiveTab} />
                <div
                    style={{
                        height: "100%",
                        placeContent: "center",
                        display: "grid",
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
                <div className={styles.contact}>
                    <h3>Contact Info</h3>
                    <br />

                    <form className={styles.contactForm} onSubmit={handleContactSubmit}>
                        <div className={styles["form-field"]}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                autoComplete="off"
                                value={contactInfo.email || ""}
                                onChange={(e) => {
                                    setContactInfo({
                                        ...contactInfo,
                                        email: e.target.value,
                                    });
                                }}
                            />
                        </div>
                        <div className={styles["form-field"]}>
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                                id="phoneNumber"
                                autoComplete="off"
                                value={contactInfo.phoneNumber || ""}
                                onChange={(e) => {
                                    setContactInfo({
                                        ...contactInfo,
                                        phoneNumber: e.target.value,
                                    });
                                }}
                            />
                        </div>
                        <Button
                            type="submit"
                            size="small"
                            style={{ marginTop: "1.5rem" }}
                            backgroundColor={"var(--primary-color)"}
                        >
                            Save
                        </Button>
                    </form>
                </div>

                <div className={styles.wrapper}>
                    <h1>Edit Company</h1>
                    <form onSubmit={handleDetailsSubmit}>
                        <h4>Company Details</h4>
                        <div className={styles["form-field"]}>
                            <label htmlFor="crn">CRN (Company Registration Number)</label>
                            <input
                                id="crn"
                                autoComplete="off"
                                value={identifiers.crn || ""}
                                onChange={(e) => {
                                    setIdentifiers({
                                        ...identifiers,
                                        crn: e.target.value,
                                    });
                                }}
                            />
                        </div>
                        <div className={styles["form-field"]}>
                            <label htmlFor="vat">VAT (Value Added Tax Number)</label>
                            <input
                                id="vat"
                                autoComplete="off"
                                value={identifiers.vat || ""}
                                onChange={(e) => {
                                    setIdentifiers({
                                        ...identifiers,
                                        vat: e.target.value,
                                    });
                                }}
                            />
                        </div>
                        <div className={styles["form-field"]}>
                            <label htmlFor="name">Company Name</label>
                            <input
                                id="name"
                                autoComplete="off"
                                value={identifiers.companyName || ""}
                                onChange={(e) => {
                                    setIdentifiers({
                                        ...identifiers,
                                        companyName: e.target.value,
                                    });
                                }}
                            />
                        </div>

                        <h4>Address</h4>
                        <div className={styles["form-field"]}>
                            <label htmlFor="country">Country</label>
                            <input
                                id="country"
                                autoComplete="off"
                                value={address.country || ""}
                                onChange={(e) => {
                                    setAddress({
                                        ...address,
                                        country: e.target.value,
                                    });
                                }}
                            />
                        </div>
                        <div className={styles["form-field"]}>
                            <label htmlFor="address">Address</label>
                            <input
                                id="address"
                                autoComplete="off"
                                value={address.address || ""}
                                onChange={(e) => {
                                    setAddress({
                                        ...address,
                                        address: e.target.value,
                                    });
                                }}
                            />
                        </div>
                        <div className={styles["form-fields"]}>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                }}
                            >
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
                                        autoComplete="off"
                                        value={address.zip || ""}
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
                                        autoComplete="off"
                                        value={address.city || ""}
                                        onChange={(e) => {
                                            setAddress({
                                                ...address,
                                                city: e.target.value,
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="small"
                            style={{ marginTop: "1.5rem" }}
                            backgroundColor={"var(--primary-color)"}
                        >
                            Save
                        </Button>
                    </form>
                </div>

                <div className={styles.hours}>
                    <h3>Working Hours</h3>
                    <br />
                    <form className={styles["working-hours"]} onSubmit={handleTimeTableSubmit}>
                        <div className={styles.timetable}>
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                <div key={day} className={styles.dayEntry}>
                                    {" "}
                                    <label htmlFor={`${day}-start`} className={styles.dayLabel}>
                                        {day}
                                    </label>{" "}
                                    <div className={styles.timeInputs}>
                                        {" "}
                                        <input
                                            autoComplete="off"
                                            type="time"
                                            id={`${day}-start`}
                                            value={timetable[day].start || ""}
                                            onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                                        />
                                        <span> - </span>
                                        <input
                                            autoComplete="off"
                                            type="time"
                                            id={`${day}-end`}
                                            value={timetable[day].end || ""}
                                            onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            type="submit"
                            size="small"
                            style={{ marginTop: "1.5rem" }}
                            backgroundColor={"var(--primary-color)"}
                        >
                            Save
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ManageCompany;
