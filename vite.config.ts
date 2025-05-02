/// <reference types="vitest" />

import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    server: {
        cors: true,
    },
    build: {
        assetsInlineLimit: 0, // disable inlining assets since that doesn't work for OBR
        rollupOptions: {
            input: {
                // must have a 'main' entry point
                background: resolve(
                    __dirname,
                    "/src/background/background.html",
                ),
                contextMenuEmbed: resolve(
                    __dirname,
                    "/src/contextmenu/contextMenuEmbed.html",
                ),
            },
        },
    },
    test: {
        includeSource: ["src/**/*.{js,ts}"],
        setupFiles: ["./test/vitest.setup.ts"],
    },
    define: {
        "import.meta.vitest": "undefined",
    },
});
