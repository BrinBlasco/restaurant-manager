import React from "react";

const NumericInput = ({ value, onChange, ...props }) => {
    const handleKeyDown = (e) => {
        const allowed = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];

        if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) {
            e.preventDefault();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData("Text");
        if (!/^\d+$/.test(pasted)) {
            e.preventDefault();
        }
    };

    const handleChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, "");
        onChange?.({ ...e, target: { ...e.target, value: digitsOnly } });
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={value}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onChange={handleChange}
            {...props}
        />
    );
};

export default NumericInput;
