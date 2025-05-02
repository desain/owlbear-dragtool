import type { Tool } from "@owlbear-rodeo/sdk";
import OBR from "@owlbear-rodeo/sdk";
import cog from "../../assets/cog.svg";
import walk from "../../assets/walk.svg";
import {
    ID_TOOL,
    ID_TOOL_ACTION_SETTINGS,
    ID_TOOL_MODE_DRAG,
} from "../constants";
import { openSettings } from "../popoverSettings/openSettings";
import { ChangeScalingAction } from "./ChangeScalingAction";
import { CLEAR_ACTION } from "./ClearAction";
import { DragCharacterMode } from "./DragCharacterMode";
import { DEFAULT_METADATA, setToolMetadata } from "./DragToolMetadata";
import MeasureMode from "./MeasureMode";

const DRAG_TOOL: Tool = {
    id: ID_TOOL,
    icons: [
        {
            icon: walk,
            label: "Drag path",
        },
    ],
    // shortcut: "Z",
    defaultMetadata: DEFAULT_METADATA,
    defaultMode: ID_TOOL_MODE_DRAG,
    onClick: async () => {
        await setToolMetadata({ distanceScaling: 1 });
        return true;
    },
};

export function installTool() {
    const changeScalingAction = new ChangeScalingAction();
    return Promise.all([
        OBR.tool.create(DRAG_TOOL),
        OBR.tool.createAction(changeScalingAction),
        OBR.tool.createAction(CLEAR_ACTION),
        OBR.tool.createAction({
            id: ID_TOOL_ACTION_SETTINGS,
            icons: [
                {
                    icon: cog,
                    label: "Settings",
                    filter: {
                        activeTools: [ID_TOOL],
                    },
                },
            ],
            onClick: openSettings,
        }),
        OBR.tool.createMode(
            new DragCharacterMode(changeScalingAction.getAndClearJustClicked),
        ),
        OBR.tool.createMode(
            new MeasureMode(
                changeScalingAction.getAndClearJustClicked,
                MeasureMode.PUBLIC,
            ),
        ),
        OBR.tool.createMode(
            new MeasureMode(
                changeScalingAction.getAndClearJustClicked,
                MeasureMode.PRIVATE,
            ),
        ),
    ]);
}
