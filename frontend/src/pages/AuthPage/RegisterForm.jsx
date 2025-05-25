import axios from "@config/Axios";
import { useState } from "react";

import Button from "@components/Button";
import s from "./Styles/AuthPage.module.css";

import { useNavigate } from "react-router-dom";

const getMaxBirthDate = () => {
    const today = new Date();
    const maxDate = new Date(today.setFullYear(today.getFullYear() - 18));
    return maxDate.toISOString().split("T")[0];
};

const RegisterFrom = ({ toggleForm }) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [repPassword, setRepPassword] = useState("");
    const [upid, setUpid] = useState("");
    const [firstName, setFname] = useState("");
    const [lastName, setLname] = useState("");
    const [phone, setPhone] = useState("");
    const [dateOfBirth, setBdate] = useState("");

    const [message, setMessage] = useState("");

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        const filteredValue = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
        setUsername(filteredValue);
        if (message) setMessage("");
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
        const filteredValue = value.replace(/[^0-9]/g, "").slice(0, 15);
        setUpid(filteredValue);
        if (message) setMessage("");
    };

    const handleNameChange = (setter) => (e) => {
        const value = e.target.value;
        let filteredValue = value.replace(/[^a-zA-Z]/g, "").slice(0, 15);
        if (filteredValue.length > 0) {
            filteredValue = filteredValue.charAt(0).toUpperCase() + filteredValue.slice(1).toLowerCase();
        }
        setter(filteredValue);
        if (message) setMessage("");
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const filteredValue = value.replace(/[^0-9]/g, "").slice(0, 12);
        setPhone(filteredValue);
        if (message) setMessage("");
    };

    const handleBdateChange = (e) => {
        setBdate(e.target.value);
        if (message) setMessage("");
    };

    const validateForm = () => {
        if (!username.trim()) return "Username is required.";
        if (username.length < 3) return "Username must be at least 3 characters long.";
        if (username.length > 10) return "Username cannot exceed 10 characters.";
        if (!/^[a-zA-Z0-9]+$/.test(username)) return "Username can only contain letters and numbers.";

        if (!password) return "Password is required.";
        if (password.length < 8) return "Password must be at least 8 characters long.";
        if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter.";
        if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter.";
        if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number.";

        if (!repPassword) return "Please confirm your password.";
        if (password !== repPassword) return "Passwords do not match.";

        if (!upid.trim()) return "UPID is required.";
        if (!/^\d+$/.test(upid)) return "UPID must contain only numbers.";
        if (upid.length < 9) return "UPID must be at least 9 digits long.";
        if (upid.length > 15) return "UPID cannot exceed 15 digits.";

        if (!firstName.trim()) return "First Name is required.";
        if (!/^[a-zA-Z]+$/.test(firstName)) return "First Name must contain only letters.";
        if (firstName.length < 3) return "First Name must be at least 3 letters long.";
        if (firstName.length > 15) return "First Name cannot exceed 15 letters.";

        if (!lastName.trim()) return "Last Name is required.";
        if (!/^[a-zA-Z]+$/.test(lastName)) return "Last Name must contain only letters.";
        if (lastName.length < 3) return "Last Name must be at least 3 letters long.";
        if (lastName.length > 15) return "Last Name cannot exceed 15 letters.";

        if (!email.trim()) return "Email is required.";
        if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";

        if (!phone.trim()) return "Phone number is required.";
        if (!/^\d+$/.test(phone)) return "Phone number must contain only digits.";
        if (phone.length < 7) return "Phone number seems too short (minimum 7 digits).";
        if (phone.length > 12) return "Phone number cannot exceed 12 digits.";

        if (!dateOfBirth) return "Date of Birth is required.";
        try {
            const birthDate = new Date(dateOfBirth);
            const minDate = new Date("1900-01-01");
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() - 18);

            if (isNaN(birthDate.getTime())) {
                return "Invalid Date of Birth format.";
            }
            birthDate.setUTCHours(0, 0, 0, 0);
            minDate.setUTCHours(0, 0, 0, 0);
            maxDate.setUTCHours(0, 0, 0, 0);

            if (birthDate < minDate) return "Date of Birth cannot be before 1900.";
            if (birthDate > maxDate) return "You must be at least 18 years old.";
        } catch (e) {
            return "Invalid Date of Birth.";
        }

        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setMessage(validationError);
            return;
        }

        setMessage("");
        console.log("Form is valid. Submitting...");

        try {
            const res = await axios.post("/auth/signup", {
                upid,
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth,
                username,
                password,
            });
            console.log("Registration successful:", res.data);
            navigate("/login");
        } catch (err) {
            console.error("Registration failed:", err);
            const backendError =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Error creating user! Please check your details or try again later.";
            setMessage(backendError);
        }
    };

    return (
        <>
            <form onSubmit={handleRegister} noValidate>
                <h1>Register</h1>
                <div className={s.formField}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={username}
                        onChange={handleUsernameChange}
                        maxLength={10}
                        required
                    />
                </div>
                <div className={s.formField}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                </div>
                <div className={s.formField}>
                    <label htmlFor="repPassword">Confirm Password</label>
                    <input
                        type="password"
                        name="repPassword"
                        id="repPassword"
                        value={repPassword}
                        onChange={handleRepPasswordChange}
                        required
                    />
                </div>
                <div className={s.formField}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
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
                <div className={s.formField}>
                    <label htmlFor="upid">UPID (Unique Personal Identifier)</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id="upid"
                        value={upid}
                        onChange={handleUpidChange}
                        maxLength={15}
                        required
                    />
                </div>
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
                <div className={s.formField}>
                    <label htmlFor="phone">Phone</label>
                    <input
                        type="tel"
                        inputMode="tel"
                        id="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        maxLength={12}
                        required
                    />
                </div>
                <div className={s.formField}>
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        min="1900-01-01"
                        max={getMaxBirthDate()}
                        value={dateOfBirth}
                        onChange={handleBdateChange}
                        required
                    />
                </div>
                <Button type="submit" size="small">
                    Register
                </Button>
                {message && (
                    <p className={s.message} role="alert">
                        {message}
                    </p>
                )}{" "}
                <p className={s.accountPrompt}>
                    Already have an account?{" "}
                    <a onClick={toggleForm} role="button">
                        Log in
                    </a>{" "}
                </p>
            </form>
        </>
    );
};

export default RegisterFrom;
