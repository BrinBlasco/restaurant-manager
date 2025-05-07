import { createContext, useContext } from "react";

export const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        // This error likely means useSocket is called outside of a SocketProvider
        // which is expected if the component isn't under the SocketLayout
        console.warn("useSocket() called outside of a SocketProvider. Returning null.");
        return null; // Return null instead of throwing error if used outside intended routes
    }
    return context;
};
