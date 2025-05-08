import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { SocketProvider } from "@utils/Sockets/SocketProvider";
import { useAuth } from "@utils/Auth/AuthContext";
import Loading from "@components/Loading";

const SocketLayout = () => {
    const { isAuthenticated, currentCompany, loading: authLoading } = useAuth();

    if (authLoading) {
        return <Loading />;
    }

    if (!isAuthenticated || !currentCompany) {
        console.warn("Redirecting from SocketLayout: Not authenticated or no company selected.");
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <SocketProvider>
            <Outlet />
        </SocketProvider>
    );
};

export default SocketLayout;
