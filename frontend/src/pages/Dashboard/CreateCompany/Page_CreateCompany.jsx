import axios from "@config/Axios";
import React, { useEffect, useState } from "react";
import Button from "@components/Button";

import s from "./Page_CreateCompany.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@utils/Auth/AuthContext";
import Loading from "../../../components/Loading";
import { FaAngleLeft } from "react-icons/fa6";

const CreateCompanyPage = () => {
    const { employee, loading } = useAuth();

    const navigate = useNavigate();

    const [error, setError] = useState("");

    const [identifiers, setIdentifiers] = useState({
        owner: "", // GET CURRENT USER ID AND NAME PROBABLY DONT KNOW YET
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

    const [data, setData] = useState({
        identifiers: identifiers,
        address: address,
    });

    useEffect(() => {
        setData({
            identifiers,
            address,
        });
    }, [identifiers, address]);

    useEffect(() => {
        if (!employee) return;
        console.log(employee);
        setIdentifiers({ ...identifiers, owner: employee._id });
    }, [employee]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("/company/", data);
            navigate("/dashboard");
        } catch (err) {
            setError("Error, probably already exists nothing else can go wrong xd");
            console.log(err);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className={s.main}>
            <a
                className={s.backButton}
                onClick={() => {
                    navigate("/dashboard");
                }}
            >
                <FaAngleLeft />
            </a>
            <div className={s.wrapper}>
                <h1>Create Company</h1>

                <form onSubmit={handleSubmit}>
                    <div className={s.formField}>
                        <label htmlFor="owner">Owner:</label>
                        <input
                            id="owner"
                            disabled={true}
                            value={
                                employee?.firstName + " " + employee?.lastName + " - " + employee?.upid + " : " + employee?._id
                            }
                        />
                    </div>

                    <div className={s.formField}>
                        <label htmlFor="crn">CRN (Company Registration Number)</label>
                        <input
                            id="crn"
                            value={identifiers.crn}
                            onChange={(e) => {
                                const crn = e.target.value;

                                if (crn === "" || (/^[0-9]*$/.test(crn) && crn.length <= 12)) {
                                    setIdentifiers({ ...identifiers, crn });
                                }
                            }}
                        />
                    </div>

                    <div className={s.formField}>
                        <label htmlFor="vat">VAT (Value Added Tax Number)</label>
                        <input
                            id="vat"
                            value={identifiers.vat}
                            onChange={(e) => {
                                const vat = e.target.value;

                                if (vat === "" || (/^[0-9]*$/.test(vat) && vat.length <= 112)) {
                                    setIdentifiers({ ...identifiers, vat });
                                }
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "1.5rem" }} className={s.formField}>
                        <label htmlFor="companyName">Company name</label>
                        <input
                            id="companyName"
                            value={identifiers.companyName}
                            onChange={(e) => {
                                setIdentifiers({
                                    ...identifiers,
                                    companyName: e.target.value,
                                });
                            }}
                        />
                        <p style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
                            Other info will be able to be configured later.
                        </p>
                    </div>

                    <div className={s.formField}>
                        <label htmlFor="country">Country</label>
                        <input
                            id="country"
                            value={address.country}
                            onChange={(e) => {
                                setAddress({
                                    ...address,
                                    country: e.target.value,
                                });
                            }}
                        />
                    </div>
                    <div className={s.formField}>
                        <label htmlFor="address">Address</label>
                        <input
                            type="text"
                            id="address"
                            value={address.address}
                            onChange={(e) => {
                                setAddress({
                                    ...address,
                                    address: e.target.value,
                                });
                            }}
                        />
                    </div>
                    <div className={s.formField}>
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
                                    value={address.zip}
                                    onChange={(e) => {
                                        const zip = e.target.value;

                                        if (zip === "" || (/^[0-9]*$/.test(zip) && zip.length <= 7)) {
                                            setAddress({ ...address, zip });
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
                                    value={address.city}
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

                    <p
                        style={{
                            margin: "-0.5rem",
                            paddingLeft: "0.5rem",
                            color: "var(--error-color)",
                        }}
                    >
                        {error}
                    </p>
                    <Button type="submit" size="small" style={{ marginTop: "1.5rem" }} backgroundColor={"var(--primary-color)"}>
                        Create
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CreateCompanyPage;
