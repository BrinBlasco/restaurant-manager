import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
    server: {
        port: 9999,
    },
    preview: {
        port: 8000,
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@components": path.resolve(__dirname, "src/components"),
            "@pages": path.resolve(__dirname, "src/pages"),
            "@styles": path.resolve(__dirname, "src/styles"),
            "@assets": path.resolve(__dirname, "src/assets"),
            "@config": path.resolve(__dirname, "src/.config"),
            "@utils": path.resolve(__dirname, "src/utils"),
        },
    },
});
