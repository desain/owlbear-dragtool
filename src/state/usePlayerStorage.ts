import OBR from "@owlbear-rodeo/sdk";
import { enableMapSet } from "immer";
import type {
    ExtractNonFunctions,
    GridParams,
    GridParsed,
} from "owlbear-utils";
import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { LOCAL_STORAGE_STORE_NAME } from "../constants";

enableMapSet();

interface LocalStorage {
    readonly contextMenuEnabled: boolean;
    readonly defaultSpeed: number;
    readonly setContextMenuEnabled: (
        this: void,
        contextMenuEnabled: boolean,
    ) => void;
    readonly setDefaultSpeed: (this: void, defaultSpeed: number) => void;
}
function partializeLocalStorage({
    contextMenuEnabled,
    defaultSpeed,
}: LocalStorage): ExtractNonFunctions<LocalStorage> {
    return { contextMenuEnabled, defaultSpeed };
}

interface OwlbearStore {
    readonly sceneReady: boolean;
    playerColor: string;
    grid: GridParsed;
    setSceneReady: (this: void, sceneReady: boolean) => void;
    setPlayerColor: (this: void, playerColor: string) => void;
    setGrid: (this: void, grid: GridParams) => Promise<void>;
}

export const usePlayerStorage = create<LocalStorage & OwlbearStore>()(
    subscribeWithSelector(
        persist(
            immer((set) => ({
                // local storage
                contextMenuEnabled: false,
                defaultSpeed: 30,
                setContextMenuEnabled: (contextMenuEnabled) =>
                    set({ contextMenuEnabled }),
                setDefaultSpeed: (defaultSpeed) => set({ defaultSpeed }),

                // owlbear store
                sceneReady: false,
                playerColor: "#ffffff",
                grid: {
                    dpi: -1,
                    measurement: "CHEBYSHEV",
                    type: "SQUARE",
                    parsedScale: {
                        digits: 1,
                        unit: "ft",
                        multiplier: 5,
                    },
                },
                setSceneReady: (sceneReady: boolean) => set({ sceneReady }),
                setPlayerColor: (playerColor: string) => set({ playerColor }),
                setGrid: async (grid: GridParams) => {
                    const parsedScale = (await OBR.scene.grid.getScale())
                        .parsed;
                    return set({
                        grid: {
                            dpi: grid.dpi,
                            measurement: grid.measurement,
                            type: grid.type,
                            parsedScale,
                        },
                    });
                },
            })),
            {
                name: LOCAL_STORAGE_STORE_NAME,
                partialize: partializeLocalStorage,
            },
        ),
    ),
);
