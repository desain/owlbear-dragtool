import OBR from "@owlbear-rodeo/sdk";
import walk from "../../assets/walk.svg";
import {
    ID_CONTEXTMENU_EDIT,
    ID_CONTEXTMENU_TRACK,
    METADATA_KEY_SPEED,
} from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";

export async function startWatchingContextMenuEnabled(): Promise<VoidFunction> {
    if (usePlayerStorage.getState().contextMenuEnabled) {
        await installContextMenu();
    }
    return usePlayerStorage.subscribe(
        (store) => store.contextMenuEnabled,
        async (enabled) => {
            if (enabled) {
                await installContextMenu();
            } else {
                await uninstallContextMenu();
            }
        },
    );
}

function installContextMenu() {
    return Promise.all([
        OBR.contextMenu.create({
            id: ID_CONTEXTMENU_TRACK,
            icons: [
                {
                    icon: walk,
                    label: "Track Movement",
                    filter: {
                        min: 1,
                        max: 1,
                        every: [
                            {
                                key: "layer",
                                value: "CHARACTER",
                            },
                            {
                                key: "type",
                                value: "IMAGE",
                            },
                            {
                                key: ["metadata", METADATA_KEY_SPEED],
                                value: undefined,
                            },
                        ],
                    },
                },
            ],
            onClick: async (context) =>
                await OBR.scene.items.updateItems(context.items, (items) =>
                    items.forEach((item) => {
                        item.metadata[METADATA_KEY_SPEED] = 30;
                    }),
                ),
        }),

        OBR.contextMenu.create({
            id: ID_CONTEXTMENU_EDIT,
            icons: [
                {
                    icon: walk,
                    label: "Edit Movement",
                    filter: {
                        every: [
                            {
                                key: ["metadata", METADATA_KEY_SPEED],
                                operator: "!=",
                                value: undefined,
                            },
                        ],
                    },
                },
            ],
            embed: {
                url: "/src/contextmenu/contextMenuEmbed.html",
                height: 50,
            },
        }),
    ]);
}

function uninstallContextMenu() {
    return Promise.all([
        OBR.contextMenu.remove(ID_CONTEXTMENU_TRACK),
        OBR.contextMenu.remove(ID_CONTEXTMENU_EDIT),
    ]);
}
