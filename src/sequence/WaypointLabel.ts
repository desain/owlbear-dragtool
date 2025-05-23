import type { GridScale, Item, Label } from "@owlbear-rodeo/sdk";
import { buildLabel } from "@owlbear-rodeo/sdk";
import { ZIndex } from "../constants";
import type { SequenceItem } from "./SequenceItem";
import { buildSequenceItem } from "./SequenceItem";

export type WaypointLabel = Label & SequenceItem;

export function createWaypointLabel(target: Item): WaypointLabel {
    // Labels always go above characters so put them on the ruler layer
    return buildSequenceItem(
        target,
        "CONTROL",
        ZIndex.LABEL,
        {},
        buildLabel()
            .name(`Path Label for ${target.name}`)
            .position(target.position)
            .backgroundColor("black")
            .backgroundOpacity(0.6)
            .pointerDirection("DOWN")
            .pointerWidth(20)
            .pointerHeight(40),
    );
}

export function getWaypointLabelText(numGridUnits: number, scale: GridScale, didLimit: boolean) {
    return `${Math.round(numGridUnits * scale.parsed.multiplier).toString()}${
        scale.parsed.unit
    }${didLimit ? '*' : ''}`;
}
