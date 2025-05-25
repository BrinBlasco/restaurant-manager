import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import PropTypes from "prop-types";

import { SocketContext } from "./SocketContext";
import { useAuth } from "@utils/Auth/AuthContext";

const SOCKET_SERVER_URL = import.meta.env.MODE === "production" ? window.location.origin : "http://localhost:5000";

export const SocketProvider = ({ children }) => {
    const { currentCompany, isAuthenticated, loading: authLoading } = useAuth();
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
    const [error, setError] = useState(null);
    const intendedCompanyIdRef = useRef(null);

    const setIsConnectedRef = useRef(setIsConnected);
    const setHasJoinedRoomRef = useRef(setHasJoinedRoom);
    const setErrorRef = useRef(setError);

    useEffect(() => {
        setIsConnectedRef.current = setIsConnected;
        setHasJoinedRoomRef.current = setHasJoinedRoom;
        setErrorRef.current = setError;
    }, []);

    const cleanupSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.off("connect");
            socketRef.current.off("disconnect");
            socketRef.current.off("connect_error");
            socketRef.current.off("joinedRoom");
            socketRef.current.off("errorJoining");
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setIsConnectedRef.current(false);
        setHasJoinedRoomRef.current(false);
        intendedCompanyIdRef.current = null;
        setErrorRef.current(null);
    }, []);

    const connectSocket = useCallback(
        (companyIdToConnect) => {
            if (!isAuthenticated || !companyIdToConnect || authLoading) {
                return;
            }
            if (socketRef.current && isConnected && hasJoinedRoom && intendedCompanyIdRef.current === companyIdToConnect) {
                return;
            }
            if (socketRef.current) {
                cleanupSocket();
            }

            setErrorRef.current(null);
            setHasJoinedRoomRef.current(false);

            const newSocket = io(SOCKET_SERVER_URL, {
                path: "/socket.io/",
                withCredentials: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            intendedCompanyIdRef.current = companyIdToConnect;
            socketRef.current = newSocket;

            newSocket.on("connect", () => {
                if (socketRef.current === newSocket && intendedCompanyIdRef.current) {
                    setIsConnectedRef.current(true);
                    newSocket.emit("joinCompanyRoom", intendedCompanyIdRef.current);
                }
            });

            newSocket.on("disconnect", (reason) => {
                if (socketRef.current === newSocket) {
                    cleanupSocket();
                }
            });

            newSocket.on("connect_error", (err) => {
                if (socketRef.current === newSocket) {
                    setErrorRef.current(`Connection failed: ${err.message}`);
                    cleanupSocket();
                }
            });

            newSocket.on("joinedRoom", (roomId) => {
                if (socketRef.current === newSocket && roomId === intendedCompanyIdRef.current) {
                    setHasJoinedRoomRef.current(true);
                } else if (socketRef.current === newSocket) {
                    cleanupSocket();
                }
            });

            newSocket.on("errorJoining", (errorMessage) => {
                if (socketRef.current === newSocket) {
                    setErrorRef.current(`Room Error: ${errorMessage}`);
                    cleanupSocket();
                }
            });
        },
        [isAuthenticated, authLoading, cleanupSocket, isConnected, hasJoinedRoom]
    );

    useEffect(() => {
        const targetCompanyId = currentCompany?._id;

        if (isAuthenticated && targetCompanyId && !authLoading) {
            if (!socketRef.current || targetCompanyId !== intendedCompanyIdRef.current) {
                if (socketRef.current && targetCompanyId !== intendedCompanyIdRef.current) {
                    cleanupSocket();
                }
                if (!socketRef.current) {
                    connectSocket(targetCompanyId);
                }
            }
        } else {
            if (socketRef.current) {
                cleanupSocket();
            }
        }
    }, [isAuthenticated, currentCompany?._id, authLoading, connectSocket, cleanupSocket]);

    useEffect(() => {
        return () => {
            cleanupSocket();
        };
    }, [cleanupSocket]);

    const isSocketReadyForData = isConnected && hasJoinedRoom;

    const value = {
        socket: socketRef.current,
        isConnected: isConnected,
        hasJoinedRoom: hasJoinedRoom,
        isSocketReadyForData: isSocketReadyForData,
        error: error,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

SocketProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
