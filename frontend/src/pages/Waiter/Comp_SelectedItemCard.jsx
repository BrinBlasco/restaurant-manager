import styles from "./Styles/Comp_SelectedItemCard.module.css";

const SelectedItemCard = ({ item, onRemoveItem, onUpdateNote, onUpdateQuantity }) => {
    if (!item || !item.uniqueId) return null;

    const handleQuantityChange = (event) => {
        let newQuantity = parseInt(event.target.value, 10);
        if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
        onUpdateQuantity(item.uniqueId, newQuantity);
    };

    const handleNoteChange = (event) => {
        onUpdateNote(item.uniqueId, event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") event.preventDefault();
    };

    const quantityInputId = `quantity-${item.uniqueId}`;
    const noteInputId = `note-${item.uniqueId}`;

    return (
        <div className={styles.selectedItemCard}>
            <span className={styles.selectedItemName}>
                {item.name || "Unnamed Item"} (${item.price != null ? item.price.toFixed(2) : "N/A"})
            </span>
            <div className={styles.inputGroup}>
                <input
                    id={noteInputId}
                    type="text"
                    placeholder="Add note..."
                    value={item.note || ""}
                    onChange={handleNoteChange}
                    className={styles.itemNoteInput}
                    aria-label={`Note for ${item.name}`}
                />

                <div className={styles.quantityGroup}>
                    <label htmlFor={quantityInputId} className={styles.quantityLabel}>
                        Qty:
                    </label>
                    <input
                        type="text"
                        id={quantityInputId}
                        name={quantityInputId}
                        min="1"
                        step="1"
                        value={isNaN(parseInt(item.quantity)) ? 1 : parseInt(item.quantity)}
                        onChange={handleQuantityChange}
                        onKeyDown={handleKeyDown}
                        className={styles.quantityInput}
                        aria-label={`Quantity for ${item.name}`}
                    />
                </div>
                <button
                    onClick={() => onRemoveItem(item.uniqueId)}
                    className={styles.removeItemButton}
                    aria-label={`Remove ${item.name}`}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default SelectedItemCard;
