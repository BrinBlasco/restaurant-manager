import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { SocketProvider } from "@utils/Sockets/SocketProvider";
import { useAuth } from "@utils/Auth/AuthContext";
import Loading from "@components/Loading"; // Assuming you have this

const SocketLayout = () => {
    const { isAuthenticated, currentCompany, loading: authLoading } = useAuth();

    if (authLoading) {
        return <Loading />; // Wait for authentication check
    }

    // Redirect if not authenticated or no company selected for socket routes
    if (!isAuthenticated || !currentCompany) {
        console.warn("Redirecting from SocketLayout: Not authenticated or no company selected.");
        return <Navigate to="/dashboard" replace />; // Or to login page '/'
    }

    // Only render the provider and outlet if auth/company checks pass
    return (
        <SocketProvider>
            <Outlet /> {/* This renders the matched child route (WaiterPage or KitchenPage) */}
        </SocketProvider>
    );
};

export default SocketLayout;
