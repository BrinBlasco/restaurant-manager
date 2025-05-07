import React, { useEffect, useState } from "react";
import RoleSelector from "./Comp_RoleSelector";
import styles from "./Styles/Modal_EditEmployee.module.css";
import Button from "@components/Button";

const EditEmployeeModal = ({ userData, setEditModalOpen }) => {
    useEffect(() => {}, []);

    const formatDate = (isoDate) => {
        if (!isoDate) return "";
        return new Date(isoDate).toISOString().split("T")[0]; // yyyy-MM-dd
    };

    return (
        <>
            <div className={styles.cover}>
                <div className={styles.wrapper}>
                    <div className={styles.exit} onClick={() => setEditModalOpen(false)}>
                        x
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
                                        value={userData.emplymentDate}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="salary">Salary</label>
                                    <input type="text" id="salary" />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="terminationDate">Date of Termination</label>
                                    <input type="date" id="terminationDate" style={{ padding: "0.2rem" }} />
                                </div>
                                Roles:
                                {/*<RoleSelector /> */}
                            </form>
                        </div>
                    </div>

                    <div className={styles.buttons}>
                        <Button size="small" onClick={() => setEditModalOpen(false)}>
                            Close
                        </Button>
                        <Button size="small">Save</Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditEmployeeModal;
