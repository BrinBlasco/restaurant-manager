import { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import RegisterFrom from "./RegisterForm";
import Loading from "@components/Loading";

import s from "./Styles/AuthPage.module.css";

import { useAuth } from "@utils/Auth/AuthContext";

const AuthPage = ({ login }) => {
    const { loading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => setIsLogin((current) => !current);

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <div className={s.main}>
                <div className={s.wrapper}>
                    {isLogin ? <LoginForm toggleForm={toggleForm} /> : <RegisterFrom toggleForm={toggleForm} />}
                </div>
            </div>
        </>
    );
};

export default AuthPage;
