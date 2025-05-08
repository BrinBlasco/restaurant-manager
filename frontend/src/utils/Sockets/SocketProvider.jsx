import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import PropTypes from "prop-types";

import { SocketContext } from "./SocketContext";
import { useAuth } from "@utils/Auth/AuthContext";

const SOCKET_SERVER_URL = import.meta.env.VITE_API_BASE_URL;

export const SocketProvider = ({ children }) => {
    const { currentCompany, isAuthenticated, loading: authLoading } = useAuth();
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const intendedCompanyIdRef = useRef(null);

    const setIsConnectedRef = useRef(setIsConnected);
    const setErrorRef = useRef(setError);
    useEffect(() => {
        setIsConnectedRef.current = setIsConnected;
        setErrorRef.current = setError;
    }, []);

    const cleanupSocket = useCallback(() => {
        if (socketRef.current) {
            console.log("SocketProvider: Cleaning up existing socket instance:", socketRef.current.id);
            socketRef.current.off("connect");
            socketRef.current.off("disconnect");
            socketRef.current.off("connect_error");
            socketRef.current.off("joinedRoom");
            socketRef.current.off("errorJoining");
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnectedRef.current(false);
            intendedCompanyIdRef.current = null;
        } else {
            console.log("SocketProvider: cleanupSocket called but no socket instance exists.");
        }
    }, []);

    const connectSocket = useCallback(
        (companyIdToConnect) => {
            if (!isAuthenticated || !companyIdToConnect || authLoading) {
                console.log("SocketProvider: connectSocket preconditions not met (auth/company/loading).");
                return;
            }
            if (socketRef.current) {
                console.warn("SocketProvider: connectSocket called but socketRef already exists.");
                return;
            }

            console.log(`SocketProvider: Creating new socket connection for company: ${companyIdToConnect}`);
            setErrorRef.current(null);

            const newSocket = io(SOCKET_SERVER_URL, {
                withCredentials: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            newSocket.on("connect", () => {
                console.log("SocketProvider: Socket connected:", newSocket.id);
                setIsConnectedRef.current(true);
                console.log(`SocketProvider: Emitting joinCompanyRoom for ${companyIdToConnect}`);
                newSocket.emit("joinCompanyRoom", companyIdToConnect);
                intendedCompanyIdRef.current = companyIdToConnect;
            });

            newSocket.on("disconnect", (reason) => {
                console.log("SocketProvider: Socket disconnected:", newSocket.id, "Reason:", reason);
                if (socketRef.current === newSocket) {
                    setIsConnectedRef.current(false);
                    intendedCompanyIdRef.current = null;
                }
            });

            newSocket.on("connect_error", (err) => {
                console.error("SocketProvider: Socket connection error:", newSocket.id, err.message);
                if (socketRef.current === newSocket) {
                    setErrorRef.current(`Connection failed: ${err.message}`);
                    setIsConnectedRef.current(false);
                    intendedCompanyIdRef.current = null;
                    if (err.message.includes("Authentication error")) {
                        console.warn("SocketProvider: Closing socket due to auth error.");
                        cleanupSocket();
                    }
                }
            });

            newSocket.on("joinedRoom", (roomId) => {
                console.log(`SocketProvider: Successfully joined room: ${roomId}`);
            });

            newSocket.on("errorJoining", (errorMessage) => {
                console.error("SocketProvider: Error joining room:", errorMessage);
                if (socketRef.current === newSocket) {
                    setErrorRef.current(`Room Error: ${errorMessage}`);
                    cleanupSocket();
                }
            });

            socketRef.current = newSocket;
        },
        [isAuthenticated, authLoading, cleanupSocket]
    );

    useEffect(() => {
        const targetCompanyId = currentCompany?._id;

        console.log(
            `SocketProvider Effect: Auth=${isAuthenticated}, Loading=${authLoading}, TargetCompany=${targetCompanyId}, SocketExists=${!!socketRef.current}, IntendedCompany=${
                intendedCompanyIdRef.current
            }`
        );

        if (isAuthenticated && targetCompanyId && !authLoading) {
            if (!socketRef.current) {
                console.log("SocketProvider Effect: No socket ref. Calling connectSocket.");
                connectSocket(targetCompanyId);
            } else if (intendedCompanyIdRef.current && targetCompanyId !== intendedCompanyIdRef.current) {
                console.log(
                    `SocketProvider Effect: Company changed (${intendedCompanyIdRef.current} -> ${targetCompanyId}). Cleaning up old socket and reconnecting.`
                );
                cleanupSocket();
            } else {
                console.log(
                    `SocketProvider Effect: Socket exists for intended company ${intendedCompanyIdRef.current} or connection in progress. No action needed.`
                );
            }
        } else {
            if (socketRef.current) {
                console.log("SocketProvider Effect: Conditions no longer met. Cleaning up existing socket.");
                cleanupSocket();
            } else {
                console.log("SocketProvider Effect: Conditions not met, no socket exists. No action.");
            }
        }

        return () => {
            console.log("SocketProvider Effect: Unmount cleanup. Cleaning up socket.");
            if (socketRef.current) {
                cleanupSocket();
            }
        };
    }, [isAuthenticated, currentCompany?._id, authLoading, connectSocket, cleanupSocket]);

    const value = {
        socket: socketRef.current,
        isConnected: isConnected,
        error: error,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

SocketProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
