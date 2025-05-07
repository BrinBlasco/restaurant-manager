import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./Styles/GeneralizedForm.module.css"; // Fixed typo: syles -> styles

const GeneralizedForm = ({
    title,
    mask, // We will use this prop now
    onSubmit = () => {}, // Default empty function is good
    submitButtonText = "Submit", // Optional text for the submit button
}) => {
    // --- State Management ---
    // Initialize state based on the keys in the mask object
    const [formData, setFormData] = useState(() => {
        const initialState = {};
        // Check if mask is defined and is an object before iterating
        if (mask && typeof mask === "object") {
            Object.keys(mask).forEach((fieldName) => {
                // Use a default value from the mask if provided, otherwise empty string
                initialState[fieldName] = mask[fieldName]?.defaultValue || "";
            });
        }
        return initialState;
    });

    // --- Event Handlers ---
    // Generic handler to update state when any input changes
    const handleChange = useCallback((event) => {
        const { name, value, type, checked } = event.target;
        // Handle checkboxes differently as their value is in 'checked'
        const newValue = type === "checkbox" ? checked : value;

        setFormData((prevData) => ({
            ...prevData,
            [name]: newValue,
        }));
    }, []); // No dependencies needed as setFormData is stable

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default browser page reload
        console.log("Form Data Submitted:", formData); // Log data for debugging
        onSubmit(formData); // Call the onSubmit prop with the collected data
    };

    // --- Dynamic Field Rendering ---
    const renderFormField = (fieldName, fieldConfig) => {
        const {
            label,
            type = "text", // Default to 'text' if not specified
            placeholder = "",
            options = [], // For select dropdowns
            required = false, // Basic HTML required attribute
            // Add other config options as needed: validation, help text, etc.
        } = fieldConfig;

        const commonProps = {
            id: fieldName,
            name: fieldName,
            value: formData[fieldName],
            onChange: handleChange,
            placeholder: placeholder,
            required: required,
            className: styles.input, // General input style
        };

        // Render different input types based on fieldConfig.type
        switch (type) {
            case "textarea":
                return <textarea {...commonProps} className={styles.textarea}></textarea>;
            case "select":
                return (
                    <select {...commonProps} className={styles.select}>
                        {placeholder && <option value="">{placeholder}</option>}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case "checkbox":
                // Checkbox needs slightly different handling for value/checked
                return (
                    <input
                        type="checkbox"
                        id={fieldName}
                        name={fieldName}
                        checked={!!formData[fieldName]} // Use checked instead of value
                        onChange={handleChange}
                        required={required}
                        className={styles.checkbox}
                    />
                );
            // Add cases for 'radio', 'number', 'date', 'password', 'email', etc.
            case "password":
            case "email":
            case "number":
            case "date":
            case "text": // Fallback for explicit 'text' or default
            default:
                return <input type={type} {...commonProps} />;
        }
    };

    // --- Component Return ---
    return (
        <div className={styles.formContainer}>
            {title && <h1 className={styles.title}>{title}</h1>}
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Check if mask is defined before trying to map over it */}
                {mask && typeof mask === "object" ? (
                    Object.entries(mask).map(([fieldName, fieldConfig]) => (
                        <div key={fieldName} className={styles.field}>
                            {/* Render label separately for layout flexibility, associate with input using htmlFor */}
                            {/* Don't render label for checkbox type if it looks odd, adjust as needed */}
                            {fieldConfig.label && fieldConfig.type !== "checkbox" && (
                                <label htmlFor={fieldName} className={styles.label}>
                                    {fieldConfig.label}
                                </label>
                            )}
                            {/* Special label handling for checkbox */}
                            {fieldConfig.label && fieldConfig.type === "checkbox" && (
                                <label htmlFor={fieldName} className={styles.checkboxLabel}>
                                    {renderFormField(fieldName, fieldConfig)}{" "}
                                    {/* Render checkbox first */}
                                    <span>{fieldConfig.label}</span> {/* Then the text */}
                                </label>
                            )}
                            {/* Render the actual input field (unless it's a checkbox already rendered with label) */}
                            {fieldConfig.type !== "checkbox" &&
                                renderFormField(fieldName, fieldConfig)}
                        </div>
                    ))
                ) : (
                    <p>No form fields defined in the mask.</p> // Informative message if mask is missing/invalid
                )}

                <button type="submit" className={styles.submitButton}>
                    {submitButtonText}
                </button>
            </form>
        </div>
    );
};

// --- PropTypes ---
GeneralizedForm.propTypes = {
    title: PropTypes.string,
    // More specific shape for the mask prop
    mask: PropTypes.objectOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired, // Label is usually essential
            type: PropTypes.string, // e.g., 'text', 'password', 'email', 'textarea', 'select', 'checkbox'
            placeholder: PropTypes.string,
            defaultValue: PropTypes.any, // Default value for the field
            options: PropTypes.arrayOf(
                // For select type
                PropTypes.shape({
                    value: PropTypes.string.isRequired,
                    label: PropTypes.string.isRequired,
                })
            ),
            required: PropTypes.bool,
            // Add other potential configurations here (e.g., validation rules)
        })
    ).isRequired, // Mask is essential for this component to work
    onSubmit: PropTypes.func,
    submitButtonText: PropTypes.string,
};

export default GeneralizedForm;
