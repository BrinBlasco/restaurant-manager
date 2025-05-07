import React from "react";
import Button from "@components/Button";
import s from "./Page_Dashboard.module.css";
const Company = ({ companyData, setCompanySelected, selectCompany }) => {
    return (
        <div className={s.company} key={companyData.name}>
            <p style={{ lineHeight: "32px" }}>{companyData.name}</p>
            <Button
                size="small"
                onClick={() => {
                    setCompanySelected(true);
                    selectCompany(companyData._id);
                }}
            >
                Switch
            </Button>
        </div>
    );
};

export default Company;
