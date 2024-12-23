import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        assetsInlineLimit: 0, // disable inlining assets since that doesn't work for OBR
        rollupOptions: {
            input: {
                // must have a 'main' entry point
                main: resolve(__dirname, "/background.html"),
                contextmenu: resolve(__dirname, "/contextmenu.html"),
            },
        },
    },
});
