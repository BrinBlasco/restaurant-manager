import React from "react";

const DecimalInput = ({ value, onChange, allowNegative = true, ...props }) => {
    const handleKeyDown = (e) => {
        const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];

        const isDigit = /^\d$/.test(e.key);
        const isDot = e.key === ".";
        const isMinus = e.key === "-";

        if (
            isDigit ||
            allowedKeys.includes(e.key) ||
            (isDot && !value.includes(".")) ||
            (allowNegative && isMinus && value.length === 0)
        ) {
            return;
        }

        e.preventDefault();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData("Text");
        const validPattern = allowNegative ? /^-?\d*(\.\d*)?$/ : /^\d*(\.\d*)?$/;

        if (!validPattern.test(pasted)) {
            e.preventDefault();
        }
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        const validPattern = allowNegative ? /^-?\d*(\.\d*)?$/ : /^\d*(\.\d*)?$/;

        if (newValue === "" || validPattern.test(newValue)) {
            onChange?.(e);
        }
    };

    return (
        <input
            autoComplete={false}
            type="text"
            inputMode="decimal"
            pattern={allowNegative ? "-?\\d*(\\.\\d*)?" : "\\d*(\\.\\d*)?"}
            value={value}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onChange={handleChange}
            {...props}
        />
    );
};

export default DecimalInput;
