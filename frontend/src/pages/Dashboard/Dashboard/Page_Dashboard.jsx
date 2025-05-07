import React, { useEffect, useState } from "react";
import axios from "@config/Axios";

import Button from "@components/Button";
import Company from "./Comp_Company";

import s from "./Page_Dashboard.module.css";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@utils/Auth/AuthContext";
import Loading from "@components/Loading";

import { BiLogOut } from "react-icons/bi";

const DashboardPage = () => {
    const navigate = useNavigate();

    const { companies, selectCompany, currentPermissions, isAuthenticated, logout, loading } = useAuth();

    const [companySelected, setCompanySelected] = useState(false);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className={s.main}>
            <div className={s.wrapper}>
                {!companySelected ? (
                    <div className={s.companySelect}>
                        <a
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                            className={s.logoutBtn}
                        >
                            <BiLogOut />
                        </a>
                        <h1>Welcome</h1>
                        {companies.length != 0 ? (
                            <p>Select company to proceed: </p>
                        ) : (
                            <p>You are currently not assigned to any company.</p>
                        )}
                        <div className={s.companies}>
                            {companies &&
                                companies
                                    .slice()
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map((company, i) => {
                                        return (
                                            <Company
                                                key={i}
                                                companyData={company}
                                                setCompanySelected={setCompanySelected}
                                                selectCompany={selectCompany}
                                            />
                                        );
                                    })}
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 style={{ textAlign: "center", color: "var(--primary-color)" }}>Select Your Role:</h1>

                        <div className={s.btnsPermissions}>
                            {(currentPermissions.editMenu ||
                                currentPermissions.editRoles ||
                                currentPermissions.editEmployees ||
                                currentPermissions.editCompany) && (
                                <Button
                                    size="small"
                                    onClick={() => {
                                        navigate("/AdminPanel/manageMenu");
                                    }}
                                >
                                    Admins
                                </Button>
                            )}
                            {currentPermissions.accessToWaiters && (
                                <Button size="small" onClick={() => navigate("/waiters")}>
                                    Waiters
                                </Button>
                            )}
                            {currentPermissions.accessToKitchen && (
                                <Button size="small" onClick={() => navigate("/kitchen")}>
                                    Kitchen
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {!companySelected ? (
                    <div className={s.btnsMisc}>
                        <Button
                            size="small"
                            onClick={() => {
                                navigate("/dashboard/createCompany");
                            }}
                        >
                            Create New Company
                        </Button>

                        <Button
                            size="small"
                            onClick={() => {
                                navigate("/dashboard/changeAccountData");
                            }}
                        >
                            Change Account Data
                        </Button>
                    </div>
                ) : (
                    <Button
                        size="small"
                        style={{ placeSelf: "center" }}
                        onClick={() => {
                            setCompanySelected(false);
                        }}
                    >
                        Back
                    </Button>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
