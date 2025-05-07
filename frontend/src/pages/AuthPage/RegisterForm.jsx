import axios from "@config/Axios";
import { useState } from "react"; // Removed useRef as it wasn't used

import Button from "@components/Button";
import s from "./Styles/AuthPage.module.css";

import { useNavigate } from "react-router-dom";

// --- Helper Function for Date Calculation ---
const getMaxBirthDate = () => {
    const today = new Date();
    const maxDate = new Date(today.setFullYear(today.getFullYear() - 18));
    return maxDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
};

const RegisterFrom = ({ toggleForm }) => {
    const navigate = useNavigate();

    // --- State for Form Fields ---
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [repPassword, setRepPassword] = useState("");
    const [upid, setUpid] = useState("");
    const [firstName, setFname] = useState("");
    const [lastName, setLname] = useState("");
    const [phone, setPhone] = useState("");
    const [dateOfBirth, setBdate] = useState("");

    // --- State for Single Message ---
    const [message, setMessage] = useState("");

    // --- Input Change Handlers (with formatting/filtering) ---

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        // Allow only letters and numbers, limit length
        const filteredValue = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
        setUsername(filteredValue);
        if (message) setMessage(""); // Clear message on change
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (message) setMessage("");
    };

    const handleRepPasswordChange = (e) => {
        setRepPassword(e.target.value);
        if (message) setMessage("");
    };

    const handleUpidChange = (e) => {
        const value = e.target.value;
        // Allow only numbers, limit length
        const filteredValue = value.replace(/[^0-9]/g, "").slice(0, 15);
        setUpid(filteredValue);
        if (message) setMessage("");
    };

    const handleNameChange = (setter) => (e) => {
        const value = e.target.value;
        // Allow only letters, limit length, format capitalization
        let filteredValue = value.replace(/[^a-zA-Z]/g, "").slice(0, 15);
        if (filteredValue.length > 0) {
            filteredValue = filteredValue.charAt(0).toUpperCase() + filteredValue.slice(1).toLowerCase();
        }
        setter(filteredValue);
        if (message) setMessage("");
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        // Allow only numbers, limit length
        const filteredValue = value.replace(/[^0-9]/g, "").slice(0, 12);
        // Optional basic formatting (example: XXX-XXX-XXXX for 10 digits)
        // let formattedValue = filteredValue;
        // if (filteredValue.length === 10) {
        //     formattedValue = `${filteredValue.slice(0, 3)}-${filteredValue.slice(3, 6)}-${filteredValue.slice(6, 10)}`;
        // } else if (filteredValue.length > 6) {
        //      formattedValue = `${filteredValue.slice(0, 3)}-${filteredValue.slice(3, 6)}-${filteredValue.slice(6)}`;
        // } else if (filteredValue.length > 3) {
        //      formattedValue = `${filteredValue.slice(0, 3)}-${filteredValue.slice(3)}`;
        // }
        // If you use formatting like above, store the raw filteredValue in state
        // and display the formattedValue, but validate/send the raw value.
        // For simplicity here, we'll just store the filtered digits.
        setPhone(filteredValue);
        if (message) setMessage("");
    };

    const handleBdateChange = (e) => {
        setBdate(e.target.value);
        if (message) setMessage("");
    };

    // --- Validation Function ---
    const validateForm = () => {
        // Username
        if (!username.trim()) return "Username is required.";
        if (username.length < 3) return "Username must be at least 3 characters long.";
        if (username.length > 10) return "Username cannot exceed 10 characters.";
        if (!/^[a-zA-Z0-9]+$/.test(username)) return "Username can only contain letters and numbers."; // Redundant due to onChange filter, but good defense

        // Password
        if (!password) return "Password is required.";
        if (password.length < 8) return "Password must be at least 8 characters long.";
        if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter.";
        if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter.";
        if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number.";

        // Confirm Password
        if (!repPassword) return "Please confirm your password.";
        if (password !== repPassword) return "Passwords do not match.";

        // UPID
        if (!upid.trim()) return "UPID is required.";
        if (!/^\d+$/.test(upid)) return "UPID must contain only numbers."; // Redundant, but good defense
        if (upid.length < 9) return "UPID must be at least 9 digits long.";
        if (upid.length > 15) return "UPID cannot exceed 15 digits.";

        // First Name
        if (!firstName.trim()) return "First Name is required.";
        if (!/^[a-zA-Z]+$/.test(firstName)) return "First Name must contain only letters."; // Redundant
        if (firstName.length < 3) return "First Name must be at least 3 letters long.";
        if (firstName.length > 15) return "First Name cannot exceed 15 letters.";

        // Last Name
        if (!lastName.trim()) return "Last Name is required.";
        if (!/^[a-zA-Z]+$/.test(lastName)) return "Last Name must contain only letters."; // Redundant
        if (lastName.length < 3) return "Last Name must be at least 3 letters long.";
        if (lastName.length > 15) return "Last Name cannot exceed 15 letters.";

        // Email (Basic checks - add more if needed)
        if (!email.trim()) return "Email is required.";
        if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";

        // Phone
        if (!phone.trim()) return "Phone number is required.";
        if (!/^\d+$/.test(phone)) return "Phone number must contain only digits."; // Redundant
        if (phone.length < 7) return "Phone number seems too short (minimum 7 digits)."; // Example minimum
        if (phone.length > 12) return "Phone number cannot exceed 12 digits.";

        // Date of Birth
        if (!dateOfBirth) return "Date of Birth is required.";
        try {
            const birthDate = new Date(dateOfBirth);
            const minDate = new Date("1900-01-01");
            // Calculate max date *inside* validation to ensure it's always current
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() - 18);

            // Check if the entered date string is validly parsed
            if (isNaN(birthDate.getTime())) {
                return "Invalid Date of Birth format.";
            }
            // Normalize times to midnight UTC for fair comparison
            birthDate.setUTCHours(0, 0, 0, 0);
            minDate.setUTCHours(0, 0, 0, 0);
            maxDate.setUTCHours(0, 0, 0, 0);

            if (birthDate < minDate) return "Date of Birth cannot be before 1900.";
            if (birthDate > maxDate) return "You must be at least 18 years old.";
        } catch (e) {
            return "Invalid Date of Birth."; // Catch potential errors during Date parsing
        }

        // All checks passed
        return null;
    };

    // --- Form Submission Handler ---
    const handleRegister = async (e) => {
        e.preventDefault(); // Prevent default browser submission

        const validationError = validateForm(); // Run all validations

        if (validationError) {
            setMessage(validationError); // Display the first error found
            return; // Stop submission
        }

        // --- If validation passes ---
        setMessage(""); // Clear any previous success/error message if needed
        console.log("Form is valid. Submitting...");

        try {
            const res = await axios.post("/auth/signup", {
                // Send the state values
                upid,
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth,
                username,
                password, // Send the actual password, not the repeated one
            });
            console.log("Registration successful:", res.data); // Log success response
            // Consider showing a success message before navigating
            // setMessage("Registration successful! Redirecting...");
            // setTimeout(() => navigate("/"), 1500); // Delay navigation
            navigate("/"); // Navigate immediately on success
        } catch (err) {
            console.error("Registration failed:", err);
            // Try to get a more specific error message from the backend response
            const backendError =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Error creating user! Please check your details or try again later.";
            setMessage(backendError);
        }
    };

    // --- Render the Form ---
    return (
        <>
            {/* Add noValidate to prevent default HTML5 validation bubbles */}
            <form onSubmit={handleRegister} noValidate>
                <h1>Register</h1>
                {/* Username */}
                <div className={s.formField}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={username}
                        onChange={handleUsernameChange}
                        maxLength={10} // Helps prevent typing past limit
                        // 'required' is good for accessibility but JS validation is primary
                        required
                    />
                    {/* Optional: add aria-describedby if you link error message programmatically */}
                </div>
                {/* Password */}
                <div className={s.formField}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={password} // Ensure value prop is set
                        onChange={handlePasswordChange}
                        required
                    />
                </div>
                {/* Confirm Password */}
                <div className={s.formField}>
                    <label htmlFor="repPassword">Confirm Password</label>
                    <input
                        type="password"
                        name="repPassword"
                        id="repPassword"
                        value={repPassword} // Ensure value prop is set
                        onChange={handleRepPasswordChange}
                        required
                    />
                </div>
                {/* Email */}
                <div className={s.formField}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email" // Use type="email" for basic mobile keyboard hints
                        name="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (message) setMessage("");
                        }}
                        required
                    />
                </div>
                {/* UPID */}
                <div className={s.formField}>
                    <label htmlFor="upid">UPID (Unique Personal Identifier)</label>
                    <input
                        type="text" // Use text even though it's numbers to handle leading zeros and length
                        inputMode="numeric" // Hint for mobile keyboards
                        pattern="[0-9]*" // Another hint for validation/keyboards
                        id="upid"
                        value={upid}
                        onChange={handleUpidChange}
                        maxLength={15}
                        required
                    />
                </div>
                {/* First Name */}
                <div className={s.formField}>
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={handleNameChange(setFname)}
                        maxLength={15}
                        required
                    />
                </div>
                {/* Last Name */}
                <div className={s.formField}>
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={handleNameChange(setLname)}
                        maxLength={15}
                        required
                    />
                </div>
                {/* Phone */}
                <div className={s.formField}>
                    <label htmlFor="phone">Phone</label>
                    <input
                        type="tel" // Semantic type for telephone numbers
                        inputMode="tel" // Hint for mobile keyboards
                        id="phone"
                        value={phone} // Display the raw digits (or formatted if you implement that)
                        onChange={handlePhoneChange}
                        maxLength={12}
                        required
                    />
                </div>
                {/* Date of Birth */}
                <div className={s.formField}>
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        min="1900-01-01" // Keep for browser UX
                        max={getMaxBirthDate()} // Keep for browser UX, calculate dynamically
                        value={dateOfBirth}
                        onChange={handleBdateChange}
                        required
                    />
                </div>
                {/* Submit Button */}
                <Button type="submit" size="small">
                    Register
                </Button>
                {/* Single Message Area */}
                {message && (
                    <p className={s.message} role="alert">
                        {message}
                    </p>
                )}{" "}
                {/* Add role="alert" for accessibility */}
                {/* Toggle Form Link */}
                <p className={s.accountPrompt}>
                    Already have an account?{" "}
                    <a onClick={toggleForm} role="button">
                        Log in
                    </a>{" "}
                    {/* Use href="#" and role for better accessibility */}
                </p>
            </form>
        </>
    );
};

export default RegisterFrom;
