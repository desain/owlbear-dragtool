import type { ToolContext, ToolEvent, ToolMode } from "@owlbear-rodeo/sdk";
import walk from "../../assets/walk.svg";
import { ID_TOOL, ID_TOOL_MODE_DRAG } from "../constants";
import {
    DRAGGABLE_CHARACTER_FILTER,
    DRAGGABLE_CHARACTER_FILTER_INVERSE,
    isDraggableCharacter,
} from "../DraggableCharacter";
import DragState from "../DragState";
import { deleteAllSequencesForCurrentPlayer } from "../sequence/utils";
import BaseDragMode from "./BaseDragMode";

export default class DragCharacterMode
    extends BaseDragMode
    implements ToolMode
{
    id = ID_TOOL_MODE_DRAG;

    shortcut = "G";

    icons = [
        {
            icon: walk,
            label: "Move Character",
            filter: {
                activeTools: [ID_TOOL /*'rodeo.owlbear.tool/move'*/],
            },
        },
    ];

    preventDrag = {
        target: DRAGGABLE_CHARACTER_FILTER_INVERSE,
    };

    cursors = [
        {
            cursor: "grabbing",
            filter: {
                dragging: true,
                target: DRAGGABLE_CHARACTER_FILTER,
            },
        },
        {
            cursor: "grab",
            filter: {
                target: DRAGGABLE_CHARACTER_FILTER,
            },
        },
        {
            cursor: "move",
        },
    ];

    async onToolDragStart(context: ToolContext, event: ToolEvent) {
        if (
            event.transformer ||
            !isDraggableCharacter(event.target) ||
            this.dragState != null
        ) {
            return;
        }
        if (typeof context.metadata.distanceScaling !== "number") {
            throw new Error("Invalid metadata");
        }

        this.dragState = await DragState.createDrag(
            event.target,
            event.pointerPosition,
            context.metadata.distanceScaling,
            false,
            false,
        );
    }

    onToolDoubleClick = async (_: ToolContext, event: ToolEvent) => {
        void this;
        if (isDraggableCharacter(event.target, false)) {
            return true; // continue default handler
        } else {
            await deleteAllSequencesForCurrentPlayer();
            return false; // prevent default
        }
    };
}
