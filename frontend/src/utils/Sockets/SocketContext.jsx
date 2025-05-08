import { createContext, useContext } from "react";

export const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        console.warn("useSocket() called outside of a SocketProvider. Returning null.");
        return null;
    }
    return context;
};
