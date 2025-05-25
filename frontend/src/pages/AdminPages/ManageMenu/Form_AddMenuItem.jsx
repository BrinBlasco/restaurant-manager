import axios from "@config/Axios";
import { useEffect, useState } from "react";

import Button from "@components/Button";
import styles from "./Styles/Form_AddMenuItem.module.css";

const AddMenuItemForm = ({ setCurrItem, setCurrItemId, currentItem, currentCompany, upsertState }) => {
    const [errMsg, setErrMsg] = useState("");

    const itemDefault = {
        imgUrl: "",
        name: "",
        price: "",
        ingredients: "",
        recipe: "",
        description: "",
        type: "Misc",
    };

    const [menuItem, setMenuItem] = useState(itemDefault);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = currentItem
                ? await axios.put(`/company/${currentCompany._id}/menu-items/${currentItem._id}`, menuItem)
                : await axios.post(`/company/${currentCompany._id}/menu-items/`, menuItem);

            upsertState(res.data.item);
            setMenuItem(itemDefault);
            setCurrItem(null);
            setCurrItemId(null);
        } catch {
            console.error("Menu item submission failed");
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
                    <div className={styles.icon}></div>

                    <div className={styles.nameAndPrice}>
                        <div className={styles["add-menu-item-fields"]}>
                            <label htmlFor="addItemName">Name *</label>
                            <input
                                type="text"
                                id="addItemName"
                                value={menuItem.name}
                                required
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
                                required
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
                    Dish type:
                    <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                        <label htmlFor="fullCourse" style={{ paddingRight: "1rem" }}>
                            <input
                                type="radio"
                                name="addItemType"
                                id="fullCourse"
                                checked={menuItem.type === "Full Course"}
                                onChange={(e) => {
                                    setMenuItem({
                                        ...menuItem,
                                        type: e.target.checked ? "Full Course" : menuItem.type,
                                    });
                                }}
                            />
                            <span style={{ margin: "0.5rem" }}>Full Course</span>
                        </label>

                        <label htmlFor="appetizers" style={{ paddingRight: "1rem" }}>
                            <input
                                type="radio"
                                name="addItemType"
                                id="appetizers"
                                checked={menuItem.type === "Appetizers"}
                                onChange={(e) => {
                                    setMenuItem({
                                        ...menuItem,
                                        type: e.target.checked ? "Appetizers" : menuItem.type,
                                    });
                                }}
                            />
                            <span style={{ margin: "0.5rem" }}>Appetizers</span>
                        </label>

                        <label htmlFor="dessert" style={{ paddingRight: "1rem" }}>
                            <input
                                type="radio"
                                name="addItemType"
                                id="dessert"
                                checked={menuItem.type === "Dessert"}
                                onChange={(e) => {
                                    setMenuItem({
                                        ...menuItem,
                                        type: e.target.checked ? "Dessert" : menuItem.type,
                                    });
                                }}
                            />
                            <span style={{ margin: "0.5rem" }}>Dessert</span>
                        </label>

                        <label htmlFor="salads" style={{ paddingRight: "1rem" }}>
                            <input
                                type="radio"
                                name="addItemType"
                                id="salads"
                                checked={menuItem.type === "Salads"}
                                onChange={(e) => {
                                    setMenuItem({
                                        ...menuItem,
                                        type: e.target.checked ? "Salads" : menuItem.type,
                                    });
                                }}
                            />
                            <span style={{ margin: "0.5rem" }}>Salads</span>
                        </label>

                        <label htmlFor="alcoholicDrink" style={{ paddingRight: "1rem" }}>
                            <input
                                type="radio"
                                name="addItemType"
                                id="alcoholicDrink"
                                checked={menuItem.type === "Alcoholic Drink"}
                                onChange={(e) => {
                                    setMenuItem({
                                        ...menuItem,
                                        type: e.target.checked ? "Alcoholic Drink" : menuItem.type,
                                    });
                                }}
                            />
                            <span style={{ margin: "0.5rem" }}>Alcoholic Drink</span>
                        </label>

                        <label htmlFor="nonAlcoholic" style={{ paddingRight: "1rem" }}>
                            <input
                                type="radio"
                                name="addItemType"
                                id="nonAlcoholic"
                                checked={menuItem.type === "Non-Alcoholic Drink"}
                                onChange={(e) => {
                                    setMenuItem({
                                        ...menuItem,
                                        type: e.target.checked ? "Non-Alcoholic Drink" : menuItem.type,
                                    });
                                }}
                            />
                            <span style={{ margin: "0.5rem" }}>Non-Alcoholic Drink</span>
                        </label>

                        <label htmlFor="misc" style={{ paddingRight: "1rem" }}>
                            <input
                                type="radio"
                                name="addItemType"
                                id="misc"
                                checked={menuItem.type === "Misc"}
                                onChange={(e) => {
                                    setMenuItem({
                                        ...menuItem,
                                        type: e.target.checked ? "Misc" : menuItem.type,
                                    });
                                }}
                            />
                            <span style={{ margin: "0.5rem" }}>Misc</span>
                        </label>
                        {/* <label htmlFor="food" style={{ paddingRight: "1rem" }}>
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
                        </label> */}
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
