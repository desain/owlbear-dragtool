import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Stack } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import React, { useEffect, useState } from "react";
import { METADATA_KEY_SPEED } from "../constants";
import { isDraggableItem, type DraggableItem } from "../sequence/ItemMetadata";
import { SpeedInput } from "./SpeedInput";

export const ContextMenu: React.FC = () => {
    const [selection, setSelection] = useState<string[]>([]);
    const [selectedItems, setSelectedItems] = useState<DraggableItem[]>([]);

    useEffect(() => {
        void OBR.player.getSelection().then((selection) => {
            if (selection) {
                setSelection(selection);
            }
        });
        return OBR.player.onChange((player) => {
            if (player.selection) {
                setSelection(player.selection);
            }
        });
    }, [setSelection]);

    useEffect(() => {
        if (selection.length > 0) {
            // SAFETY: we can only open this context menu on DraggableItem's
            void OBR.scene.items
                .getItems<DraggableItem>(selection)
                .then(setSelectedItems);
        }
        return OBR.scene.items.onChange((items) =>
            setSelectedItems(
                items
                    .filter(isDraggableItem)
                    .filter((item) => selection.includes(item.id)),
            ),
        );
    }, [selection]);

    if (selectedItems.length !== 1) {
        return null;
    }

    const speed = selectedItems[0].metadata[METADATA_KEY_SPEED] ?? 0;

    return (
        <Stack
            direction={"row"}
            gap={2}
            sx={{ px: 2 }}
            justifyContent={"space-between"}
        >
            <SpeedInput
                value={speed}
                sx={{ maxWidth: 120 }}
                onChange={(newSpeed) =>
                    void OBR.scene.items.updateItems(selectedItems, (items) =>
                        items.forEach((item) => {
                            item.metadata[METADATA_KEY_SPEED] = newSpeed;
                        }),
                    )
                }
            />
            <Button
                startIcon={<DeleteIcon />}
                onClick={() => {
                    void OBR.scene.items.updateItems(selectedItems, (items) =>
                        items.forEach((item) => {
                            delete item.metadata[METADATA_KEY_SPEED];
                        }),
                    );
                }}
            >
                Remove
            </Button>
        </Stack>
    );
};
