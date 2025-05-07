import axios from "@config/Axios";
import { useEffect, useState } from "react";

import Button from "@components/Button";

import s from "./Styles/AuthPage.module.css";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@utils/Auth/AuthContext";

const LoginForm = ({ toggleForm }) => {
    const navigate = useNavigate();

    const { isAuthenticated, login } = useAuth();

    const [emailOrUsername, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("/auth/login", {
                login: emailOrUsername,
                password: password,
            });
            if (res.status == 200) {
                await login({ login: emailOrUsername, password: password });
                navigate("/dashboard");
            }
        } catch (error) {
            console.log(error);
            setMessage("Error loggin in!");
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

    return (
        <>
            <form onSubmit={handleLogin}>
                <h1>Login</h1>
                <div className={s.formField}>
                    <label htmlFor="email">Email or Username</label>
                    <input id="email" type="text" onChange={(e) => setLogin(e.target.value)} />
                </div>

                <div className={s.formField}>
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" onChange={(e) => setPassword(e.target.value)} />
                </div>

                <Button type="submit" size="small">
                    Log In
                </Button>

                <p className={s.message}>{message}</p>
                <p className={s.accountPrompt}>
                    Don't have an account? <a onClick={toggleForm}>Make one</a>
                </p>
            </form>
        </>
    );
};

export default LoginForm;
