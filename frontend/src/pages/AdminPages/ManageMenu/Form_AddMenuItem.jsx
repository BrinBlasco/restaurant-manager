import axios from "@config/Axios";
import { useEffect, useState } from "react";

import Button from "@components/Button";
import styles from "./Styles/Form_AddMenuItem.module.css";

const AddMenuItemForm = ({ currentItem, currentCompany }) => {
    const [errMsg, setErrMsg] = useState("");

    const [menuItem, setMenuItem] = useState({
        imgUrl: "",
        name: "",
        price: "",
        ingredients: "",
        recipe: "",
        description: "",
        type: "food",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentItem) {
            try {
                const res = await axios.put(`/company/${currentCompany._id}/menu-items/${currentItem._id}`, menuItem);
                window.location.reload();
            } catch {
                console.error("Error");
            }
        } else {
            try {
                const res = await axios.post(`/company/${currentCompany._id}/menu-items/`, menuItem);
                window.location.reload();
            } catch {
                console.error("Error");
            }
        }
    };

    useEffect(() => {
        if (!currentItem) return;
        if (!currentCompany) return;

        setMenuItem(currentItem);
    }, [currentItem, currentCompany]);

    return (
        <>
            <h1>{!currentItem ? "Add Item" : "Edit Item"}</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles["img-name-price"]}>
                    <div className={styles.icon} style={{ marginRight: "2rem" }}></div>

                    <div
                        style={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                        }}
                    >
                        <div className={styles["add-menu-item-fields"]}>
                            <label htmlFor="addItemName">Name *</label>
                            <input
                                type="text"
                                id="addItemName"
                                value={menuItem.name}
                                onChange={(e) => {
                                    setMenuItem({
                                        ...menuItem,
                                        name: e.target.value,
                                    });
                                }}
                            />
                        </div>

                        <div className={styles["add-menu-item-fields"]}>
                            <label htmlFor="addItemPrice">Price *</label>
                            <input
                                type="text"
                                id="addItemPrice"
                                style={{ width: "5rem" }}
                                value={menuItem.price}
                                onChange={(e) => {
                                    let newValue = e.target.value;
                                    if (/^\d*\.?\d{0,2}$/.test(newValue)) {
                                        if (newValue !== "" && newValue[0] === "0" && newValue[1] !== ".") {
                                            newValue = newValue.slice(1);
                                        }
                                        setMenuItem({
                                            ...menuItem,
                                            price: newValue,
                                        });
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles["add-menu-item-fields"]}>
                    <label htmlFor="addItemIngredients">Ingredients</label>
                    <textarea
                        wrap="hard"
                        id="addItemIngredients"
                        value={menuItem.ingredients}
                        onChange={(e) => {
                            setMenuItem({
                                ...menuItem,
                                ingredients: e.target.value,
                            });
                        }}
                    />
                </div>

                <div className={styles["add-menu-item-fields"]}>
                    <label htmlFor="addItemRecipe">Recipe</label>
                    <textarea
                        wrap="hard"
                        type="text"
                        id="addItemRecipe"
                        spellCheck="false"
                        value={menuItem.recipe}
                        onChange={(e) => {
                            setMenuItem({
                                ...menuItem,
                                recipe: e.target.value,
                            });
                        }}
                    />
                </div>

                <div className={styles["add-menu-item-fields"]}>
                    <label htmlFor="addItemDescription">Description</label>
                    <textarea
                        wrap="hard"
                        type="text"
                        id="addItemDescription"
                        spellCheck="false"
                        value={menuItem.description}
                        onChange={(e) => {
                            setMenuItem({
                                ...menuItem,
                                description: e.target.value,
                            });
                        }}
                    />
                </div>

                <div className={styles["add-menu-item-fields"]}>
                    Type:
                    <div style={{ marginTop: "0.5rem", display: "flex" }}>
                        <label htmlFor="food" style={{ paddingRight: "1rem" }}>
                            <input
                                type="radio"
                                name="addItemType"
                                id="food"
                                checked={menuItem.type === "food"}
                                onChange={(e) => {
                                    setMenuItem({
                                        ...menuItem,
                                        type: e.target.checked ? "food" : menuItem.type,
                                    });
                                }}
                            />
                            <span style={{ margin: "0.5rem" }}>Food</span>
                        </label>
                        <label htmlFor="drink">
                            <input
                                type="radio"
                                name="addItemType"
                                id="drink"
                                checked={menuItem.type === "drink"}
                                onChange={(e) => {
                                    setMenuItem({
                                        ...menuItem,
                                        type: e.target.checked ? "drink" : menuItem.type,
                                    });
                                }}
                            />
                            <span style={{ margin: "0.5rem" }}>Drink</span>
                        </label>
                    </div>
                </div>

                <p
                    style={{
                        margin: "-0.5rem",
                        paddingLeft: "0.5rem",
                        color: "var(--error-color)",
                    }}
                >
                    {errMsg}
                </p>

                <Button type="submit" style={{ marginTop: "auto" }} backgroundColor={"var(--primary-color)"}>
                    {!currentItem ? "Add Item" : "Save Changes"}
                </Button>
            </form>
        </>
    );
};

export default AddMenuItemForm;
