import type { ToolAction } from "@owlbear-rodeo/sdk";
import clear from "../../assets/clear.svg";
import { ID_TOOL, PLUGIN_ID } from "../constants";
import { deleteAllSequencesForCurrentPlayer } from "../sequence/utils";

export const CLEAR_ACTION: ToolAction = {
    id: `${PLUGIN_ID} /tool-action-clear`,
    shortcut: "Enter",
    icons: [
        {
            icon: clear,
            label: "Clear Measurements",
            filter: {
                activeTools: [ID_TOOL],
            },
        },
    ],
    onClick: async () => {
        await deleteAllSequencesForCurrentPlayer();
    },
};
