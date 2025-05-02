import OBR from "@owlbear-rodeo/sdk";
import walk from "../../assets/walk.svg";
import {
    ID_CONTEXTMENU_EDIT,
    ID_CONTEXTMENU_TRACK,
    METADATA_KEY,
} from "../constants";
import type { DraggableItem } from "../sequence/ItemMetadata";
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
                                key: [
                                    "metadata",
                                    METADATA_KEY,
                                    "movementSpeed",
                                ],
                                value: undefined,
                            },
                        ],
                    },
                },
            ],
            onClick: async (context) =>
                await OBR.scene.items.updateItems(context.items, (items) =>
                    items.forEach((item) => {
                        const draggableItem = item as DraggableItem;
                        draggableItem.metadata[METADATA_KEY] = {
                            ...draggableItem.metadata[METADATA_KEY],
                            movementSpeed: 30,
                        };
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
                                key: [
                                    "metadata",
                                    METADATA_KEY,
                                    "movementSpeed",
                                ],
                                operator: "!=",
                                value: undefined,
                            },
                        ],
                    },
                },
            ],
            embed: {
                url: "/src/contextmenu/contextMenuEmbed.html",
                height: 30,
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
