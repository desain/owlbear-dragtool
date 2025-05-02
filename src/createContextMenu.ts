import OBR from "@owlbear-rodeo/sdk";
import walk from "../assets/walk.svg";
import { EDIT_MOVEMENT_ID, METADATA_KEY, TRACK_MOVEMENT_ID } from "./constants";
import { DraggableItem } from "./Sequence/ItemMetadata";

export async function createContextMenu() {
    await OBR.contextMenu.create({
        id: TRACK_MOVEMENT_ID,
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
                            key: ["metadata", METADATA_KEY, "movementSpeed"],
                            value: undefined,
                        },
                    ],
                },
            },
        ],
        async onClick(context) {
            return await OBR.scene.items.updateItems(context.items, (items) =>
                items.forEach((item) => {
                    const draggableItem = item as DraggableItem;
                    draggableItem.metadata[METADATA_KEY] = {
                        ...draggableItem.metadata[METADATA_KEY],
                        movementSpeed: 30,
                    };
                }),
            );
        },
    });

    await OBR.contextMenu.create({
        id: EDIT_MOVEMENT_ID,
        icons: [
            {
                icon: walk,
                label: "Edit Movement",
                filter: {
                    every: [
                        {
                            key: ["metadata", METADATA_KEY, "movementSpeed"],
                            operator: "!=",
                            value: undefined,
                        },
                    ],
                },
            },
        ],
        embed: {
            url: "/contextmenu.html",
            height: 30,
        },
    });
}
