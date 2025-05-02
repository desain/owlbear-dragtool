import { GridType, Item, Layer, Shape, buildShape } from "@owlbear-rodeo/sdk";
import { getScale } from "../axonometricUtils";
import {
    MARKER_STROKE_WIDTH_DPI_SCALING,
    THIN_RULER_COLOR,
    ZIndex,
} from "../constants";
import { SequenceItem, buildSequenceItem } from "./SequenceItem";

export type Waypoint = Shape & SequenceItem;

export function createWaypoint(
    target: Item,
    layer: Layer,
    dpi: number,
    gridType: GridType,
    color: string,
): Waypoint {
    const diameter = dpi / 4;
    const scale = getScale(gridType);
    return buildSequenceItem(
        target,
        layer,
        ZIndex.WAYPOINT,
        {},
        buildShape()
            .name(`Path Waypoint for ${target.name}`)
            .position(target.position)
            .shapeType("CIRCLE")
            .width(diameter * scale.x)
            .height(diameter * scale.y)
            .fillColor(color)
            .strokeColor(THIN_RULER_COLOR)
            .strokeWidth(dpi * MARKER_STROKE_WIDTH_DPI_SCALING),
    );
}
