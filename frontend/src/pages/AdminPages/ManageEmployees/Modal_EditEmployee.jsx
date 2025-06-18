import React, { useEffect, useState } from "react";
import RoleSelector from "./Comp_RoleSelector";
import NumericInput from "@components/NumericInput.jsx";
import styles from "./Styles/Modal_EditEmployee.module.css";
import Button from "@components/Button";
import Modal from "@components/Modal";
import { useAuth } from "@utils/Auth/AuthContext";
import { RxCross2 } from "react-icons/rx";

const EditEmployeeModal = ({ userData, allRoles, closeModal, handleUpdateEmployee, handleFireEmployee }) => {
    const { employee } = useAuth();
    const [isDelModalOpen, setDelModalOpen] = useState(false);
    const [currentRoles, setCurrentRoles] = useState([]);
    const [rolesChanged, setRolesChanged] = useState(false);

    const compEmpData = {
        _id: userData._id,
        salary: userData?.salary,
        hireDate: userData?.hireDate,
        terminationDate: userData?.terminationDate,
        roles: userData?.roles,
    };

    const [updatedCompEmpData, setUpdatedCompEmpData] = useState(compEmpData);

    const formatDate = (isoDate) => {
        if (!isoDate) return "";
        return new Date(isoDate).toISOString().split("T")[0]; // yyyy-MM-dd
    };

    const handleRolesChange = (selectedRoles) => {
        let roleIds = [];
        for (let role of selectedRoles) {
            roleIds.push(role._id);
        }
        setRolesChanged(true);
        setCurrentRoles(roleIds);
    };

    return (
        <>
            <div className={styles.cover}>
                <div className={styles.wrapper}>
                    <div className={styles.exit} onClick={closeModal}>
                        <RxCross2 />
                    </div>

                    <h1>Edit Employee</h1>

                    <div className={styles.main}>
                        <div className={styles.left}>
                            <form>
                                <div className={styles.formField}>
                                    <label htmlFor="upid">UPID</label>
                                    <input type="text" id="upid" disabled={true} value={userData.upid} />
                                </div>
                                <div className={styles.formFieldInline}>
                                    <div className={styles.formField}>
                                        <label htmlFor="firstName">First Name</label>
                                        <input type="text" id="firstName" disabled={true} value={userData.firstName} />
                                    </div>
                                    <div className={styles.formField}>
                                        <label htmlFor="lastName">Last Name</label>
                                        <input type="text" id="lastName" disabled={true} value={userData.lastName} />
                                    </div>
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="phone">Phone</label>
                                    <input type="text" id="phone" disabled={true} value={userData.phone} />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="email">Email</label>
                                    <input type="text" id="email" disabled={true} value={userData.email} />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="bdate">Date of Birth</label>
                                    <input
                                        type="date"
                                        id="bdate"
                                        style={{ padding: "0.2rem" }}
                                        disabled={true}
                                        value={formatDate(userData.dateOfBirth)}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="country">Country</label>
                                    <input
                                        type="text"
                                        id="country"
                                        disabled={true}
                                        value={userData.address?.country || "Country"}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="address">Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        disabled={true}
                                        value={userData.address?.address || "Address"}
                                    />
                                </div>
                                <div className={styles.formFieldInline}>
                                    <div className={styles.formField} style={{ width: "calc(20% - 0.25rem)" }}>
                                        <label htmlFor="zip">Zip</label>
                                        <input type="text" id="zip" disabled={true} value={userData.address?.zip || "Zip"} />
                                    </div>
                                    <div className={styles.formField} style={{ width: "calc(80% - 0.25rem)" }}>
                                        <label htmlFor="city">City</label>
                                        <input type="text" id="city" disabled={true} value={userData.address?.city || "City"} />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className={styles.right}>
                            <form>
                                <div className={styles.formField}>
                                    <label htmlFor="employmentDate">Date of Employment</label>
                                    <input
                                        type="date"
                                        id="employmentDate"
                                        style={{ padding: "0.2rem" }}
                                        value={formatDate(updatedCompEmpData.hireDate)}
                                        onChange={(e) => {
                                            setUpdatedCompEmpData({ ...updatedCompEmpData, hireDate: e.target.value });
                                        }}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="terminationDate">Date of Termination</label>
                                    <input
                                        type="date"
                                        id="terminationDate"
                                        style={{ padding: "0.2rem" }}
                                        value={formatDate(updatedCompEmpData.terminationDate)}
                                        onChange={(e) => {
                                            setUpdatedCompEmpData({ ...updatedCompEmpData, terminationDate: e.target.value });
                                        }}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="salary">Salary</label>
                                    <NumericInput
                                        maxLength={6}
                                        value={updatedCompEmpData.salary}
                                        id={"salary"}
                                        onChange={(e) => {
                                            setUpdatedCompEmpData({ ...updatedCompEmpData, salary: e.target.value });
                                        }}
                                    />
                                </div>
                                {compEmpData.roles.some((el) => el.name !== "Owner") && (
                                    <RoleSelector
                                        allRoles={allRoles}
                                        currentRoles={compEmpData.roles}
                                        onChange={handleRolesChange}
                                    />
                                )}
                            </form>
                        </div>
                    </div>

                    <div className={styles.buttons}>
                        {userData._id !== employee._id && userData.roles.some((rl) => rl.name != "Owner") && (
                            <Button
                                size="small"
                                backgroundColor="var(--error-color)"
                                color="black"
                                onClick={() => setDelModalOpen(true)}
                            >
                                Fire
                            </Button>
                        )}

                        <Button
                            style={{ marginLeft: "auto" }}
                            size="small"
                            color="black"
                            onClick={() => {
                                handleUpdateEmployee(updatedCompEmpData, currentRoles, rolesChanged);
                                closeModal();
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
            {isDelModalOpen && (
                <Modal
                    message="Are you sure you want to fire this person?"
                    onConfirm={() => {
                        handleFireEmployee(userData._id);
                        setDelModalOpen(false);
                        closeModal();
                    }}
                    onCancel={() => {
                        setDelModalOpen(false);
                    }}
                />
            )}
        </>
    );
};

export default EditEmployeeModal;
