import { useEffect } from "react";

/**
 * A custom hook that triggers a callback when a click is detected outside of a set of elements.
 * @param {React.RefObject[]} refs - An array of refs to the elements to monitor.
 * @param {() => void} callback - The function to call on an outside click.
 */
export const useClickOutside = (refs, callback) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutside = refs.every((ref) => ref.current && !ref.current.contains(event.target));

            if (isOutside) {
                callback();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [refs, callback]);
};
