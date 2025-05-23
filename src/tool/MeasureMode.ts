import type {
    Item,
    ToolContext,
    ToolEvent,
    ToolMode,
    Vector2,
} from "@owlbear-rodeo/sdk";
import ruler from "../../assets/ruler.svg";
import rulerPrivate from "../../assets/rulerPrivate.svg";
import { ID_TOOL, PLUGIN_ID } from "../constants";
import { isDraggableCharacter } from "../DraggableCharacter";
import DragState from "../DragState";
import { DRAG_MARKER_FILTER, isDragMarker } from "../sequence/DragMarker";
import { deleteAllSequencesForCurrentPlayer } from "../sequence/utils";
import BaseDragMode from "./BaseDragMode";

export default class MeasureMode extends BaseDragMode implements ToolMode {
    public static PUBLIC = false;
    public static PRIVATE = true;
    readonly #privateMode: boolean;

    constructor(
        readAndClearScalingJustClicked: () => boolean,
        privateMode: boolean,
    ) {
        super(readAndClearScalingJustClicked);
        this.#privateMode = privateMode;
    }

    get id() {
        return `${PLUGIN_ID}/measure-path-mode${
            this.#privateMode ? "-private" : ""
        }`;
    }

    get shortcut() {
        return this.#privateMode ? "P" : "R";
    }

    get icons() {
        return [
            {
                icon: this.#privateMode ? rulerPrivate : ruler,
                label: `Measure Path${this.#privateMode ? " (Private)" : ""} `,
                filter: {
                    activeTools: [ID_TOOL],
                },
            },
        ];
    }

    cursors = [
        {
            cursor: "grabbing",
            filter: {
                dragging: true,
                target: DRAG_MARKER_FILTER,
            },
        },
        {
            cursor: "grab",
            filter: {
                target: DRAG_MARKER_FILTER,
            },
        },
        {
            cursor: "crosshair",
        },
    ];

    async onToolDragStart(context: ToolContext, event: ToolEvent) {
        if (this.dragState != null) {
            return;
        }
        if (typeof context.metadata.distanceScaling !== "number") {
            throw new Error("Invalid metadata");
        }

        let startPosition: Vector2;
        let target: Item | null;
        if (isDragMarker(event.target)) {
            startPosition = event.target.position;
            target = event.target;
        } else if (isDraggableCharacter(event.target)) {
            startPosition = event.target.position;
            target = null;
        } else {
            startPosition = event.pointerPosition;
            target = null;
        }

        this.dragState = await DragState.createDrag(
            target,
            startPosition,
            context.metadata.distanceScaling,
            this.#privateMode,
            true,
        );
    }

    onToolDoubleClick = async (_: ToolContext, event: ToolEvent) => {
        void this; // class method
        if (isDragMarker(event.target)) {
            return true;
        } else {
            await deleteAllSequencesForCurrentPlayer();
            return false;
        }
    };
}
