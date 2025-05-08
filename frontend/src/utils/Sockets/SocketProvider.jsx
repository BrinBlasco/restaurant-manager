// --- START OF FILE SocketProvider.jsx --- (REVISED AGAIN TO FIX LOOP)
import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import PropTypes from "prop-types";

import { SocketContext } from "./SocketContext";
import { useAuth } from "@utils/Auth/AuthContext";

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL;
//"https://brinblazko.ddns.net";

export const SocketProvider = ({ children }) => {
    const { currentCompany, isAuthenticated, loading: authLoading } = useAuth();
    // Use useRef for the socket instance to prevent it from triggering useEffect changes directly
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const intendedCompanyIdRef = useRef(null); // Tracks the company the current socketRef is for

    // --- Stable function references using useRef for setters ---
    // This avoids adding setters to useCallback dependencies later
    const setIsConnectedRef = useRef(setIsConnected);
    const setErrorRef = useRef(setError);
    useEffect(() => {
        setIsConnectedRef.current = setIsConnected;
        setErrorRef.current = setError;
    }, []);

    // --- Function to clean up socket listeners and instance ---
    const cleanupSocket = useCallback(() => {
        if (socketRef.current) {
            console.log("SocketProvider: Cleaning up existing socket instance:", socketRef.current.id);
            // Remove all listeners to prevent memory leaks
            socketRef.current.off("connect");
            socketRef.current.off("disconnect");
            socketRef.current.off("connect_error");
            socketRef.current.off("joinedRoom");
            socketRef.current.off("errorJoining");
            // Disconnect and nullify the ref
            socketRef.current.disconnect();
            socketRef.current = null;
            // Update state via refs
            setIsConnectedRef.current(false);
            intendedCompanyIdRef.current = null;
            // Optionally clear error on manual cleanup?
            // setErrorRef.current(null);
        } else {
            console.log("SocketProvider: cleanupSocket called but no socket instance exists.");
        }
    }, []); // No dependencies, relies on refs

    // --- Function to establish connection ---
    // This function now primarily sets up the socket and listeners.
    // It doesn't depend on the socket state itself anymore.
    const connectSocket = useCallback(
        (companyIdToConnect) => {
            // Check prerequisites
            if (!isAuthenticated || !companyIdToConnect || authLoading) {
                console.log("SocketProvider: connectSocket preconditions not met (auth/company/loading).");
                return;
            }
            // Prevent creating multiple sockets if one exists (safety check)
            if (socketRef.current) {
                console.warn("SocketProvider: connectSocket called but socketRef already exists.");
                return;
            }

            console.log(`SocketProvider: Creating new socket connection for company: ${companyIdToConnect}`);
            setErrorRef.current(null); // Clear previous errors via ref

            const newSocket = io(SOCKET_SERVER_URL, {
                withCredentials: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            // --- Assign listeners ---
            newSocket.on("connect", () => {
                console.log("SocketProvider: Socket connected:", newSocket.id);
                setIsConnectedRef.current(true); // Update state via ref
                console.log(`SocketProvider: Emitting joinCompanyRoom for ${companyIdToConnect}`);
                newSocket.emit("joinCompanyRoom", companyIdToConnect);
                intendedCompanyIdRef.current = companyIdToConnect; // Set intended company *after* connect/join emit
            });

            newSocket.on("disconnect", (reason) => {
                console.log("SocketProvider: Socket disconnected:", newSocket.id, "Reason:", reason);
                // Only update state if this socket instance is still the current one in the ref
                // (Prevents updates from stale sockets during quick reconnects/changes)
                if (socketRef.current === newSocket) {
                    setIsConnectedRef.current(false);
                    intendedCompanyIdRef.current = null;
                    // If disconnect was unexpected, cleanupSocket might be called by useEffect
                    // If it was intentional (e.g., logout), useEffect handles cleanup.
                    // Don't call cleanupSocket directly here, as it might be a temporary disconnect.
                }
            });

            newSocket.on("connect_error", (err) => {
                console.error("SocketProvider: Socket connection error:", newSocket.id, err.message);
                if (socketRef.current === newSocket) {
                    // Check if still the current socket
                    setErrorRef.current(`Connection failed: ${err.message}`);
                    setIsConnectedRef.current(false);
                    intendedCompanyIdRef.current = null;
                    // Close socket on persistent auth error to stop retries
                    if (err.message.includes("Authentication error")) {
                        console.warn("SocketProvider: Closing socket due to auth error.");
                        cleanupSocket(); // Use cleanup to disconnect and nullify ref
                    }
                    // For other errors, Socket.IO might retry automatically.
                }
            });

            newSocket.on("joinedRoom", (roomId) => {
                console.log(`SocketProvider: Successfully joined room: ${roomId}`);
            });

            newSocket.on("errorJoining", (errorMessage) => {
                console.error("SocketProvider: Error joining room:", errorMessage);
                if (socketRef.current === newSocket) {
                    // Check if still the current socket
                    setErrorRef.current(`Room Error: ${errorMessage}`);
                    cleanupSocket(); // Disconnect fully if we can't join the required room
                }
            });

            // --- Update the ref ---
            // Store the new socket instance in the ref *without* causing a state update/re-render itself
            socketRef.current = newSocket;
            // We still need *some* state update to trigger consumers to re-render with the new socket object.
            // Let's use isConnected state for this purpose. The 'connect' event will set it.
            // Or, less ideally, force a dummy state update, but relying on isConnected is cleaner.

            // Stable dependencies based on initial checks
        },
        [isAuthenticated, authLoading, cleanupSocket]
    );

    // --- Effect for connection management ---
    useEffect(() => {
        const targetCompanyId = currentCompany?._id;

        console.log(
            `SocketProvider Effect: Auth=${isAuthenticated}, Loading=${authLoading}, TargetCompany=${targetCompanyId}, SocketExists=${!!socketRef.current}, IntendedCompany=${
                intendedCompanyIdRef.current
            }`
        );

        if (isAuthenticated && targetCompanyId && !authLoading) {
            // Scenario 1: Need initial connection
            if (!socketRef.current) {
                console.log("SocketProvider Effect: No socket ref. Calling connectSocket.");
                connectSocket(targetCompanyId);
            }
            // Scenario 2: Socket exists, but is for a DIFFERENT company
            // IMPORTANT CHECK: Ensure intendedCompanyIdRef.current is not null before comparing
            else if (intendedCompanyIdRef.current && targetCompanyId !== intendedCompanyIdRef.current) {
                console.log(
                    `SocketProvider Effect: Company changed (${intendedCompanyIdRef.current} -> ${targetCompanyId}). Cleaning up old socket and reconnecting.`
                );
                cleanupSocket(); // Clean up the old socket completely
                // Don't call connectSocket immediately, let the effect re-run
                // because cleanupSocket sets socketRef.current to null.
                // The next run will hit Scenario 1.
            }
            // Scenario 3: Socket exists and is for the correct company (or intendedCompanyId is still null - meaning connecting)
            else {
                console.log(
                    `SocketProvider Effect: Socket exists for intended company ${intendedCompanyIdRef.current} or connection in progress. No action needed.`
                );
            }
        }
        // Scenario 4: Conditions for connection NOT met (logout, no company, loading)
        else {
            if (socketRef.current) {
                console.log("SocketProvider Effect: Conditions no longer met. Cleaning up existing socket.");
                cleanupSocket(); // Clean up if connection should no longer exist
            } else {
                console.log("SocketProvider Effect: Conditions not met, no socket exists. No action.");
            }
        }

        // --- Cleanup Function on Unmount ---
        // This ensures cleanup happens if the provider itself is unmounted.
        return () => {
            console.log("SocketProvider Effect: Unmount cleanup. Cleaning up socket.");
            // Make sure cleanup is idempotent (safe to call multiple times)
            if (socketRef.current) {
                cleanupSocket();
            }
        };
        // Dependencies determine when to CHECK the connection status
    }, [isAuthenticated, currentCompany?._id, authLoading, connectSocket, cleanupSocket]);

    // --- Context Value ---
    // Provide the *current* value of the ref, isConnected state, and error state
    const value = {
        socket: socketRef.current, // Provide the socket instance from the ref
        isConnected: isConnected,
        error: error,
    };

    // Re-render provider only when isConnected or error state changes
    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

SocketProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
// --- END OF FILE SocketProvider.jsx ---
