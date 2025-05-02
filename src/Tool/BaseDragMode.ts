import type {
    Item,
    KeyEvent,
    ToolContext,
    ToolEvent,
} from "@owlbear-rodeo/sdk";
import DragState from "../DragState";
import { deleteAllSequencesForCurrentPlayer } from "../Sequence/utils";

export default abstract class BaseDragMode {
    readonly #readAndClearScalingJustClicked: () => boolean;
    protected dragState: DragState | null;

    constructor(readAndClearScalingJustClicked: () => boolean) {
        this.#readAndClearScalingJustClicked = readAndClearScalingJustClicked;
        this.dragState = null;
    }

    async onToolDragMove(_: ToolContext, event: ToolEvent) {
        await this.dragState?.update(event.pointerPosition);
    }

    async onToolDragEnd(_: ToolContext, event: ToolEvent) {
        await this.dragState?.finish(event.pointerPosition);
        this.dragState = null;
    }

    async onToolDragCancel() {
        await this.dragState?.cancel();
        this.dragState = null;
    }

    async onDeactivate() {
        if (!this.#readAndClearScalingJustClicked()) {
            await deleteAllSequencesForCurrentPlayer();
        }
    }

    async onKeyDown(context: ToolContext, event: KeyEvent) {
        if (
            event.code === "KeyZ" &&
            !event.repeat &&
            this.dragState !== null &&
            typeof context.metadata.distanceScaling === "number"
        ) {
            const target: Item = await this.dragState.finish();
            this.dragState = await DragState.createDrag(
                target,
                target.position,
                context.metadata.distanceScaling,
                false,
                false,
            );
        }
    }
}
