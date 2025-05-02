import {
    GridType,
    Item,
    KeyFilter,
    Shape,
    Vector2,
    buildShape,
    isShape,
} from "@owlbear-rodeo/sdk";
import { getScale } from "../axonometricUtils";
import {
    MARKER_STROKE_WIDTH_DPI_SCALING,
    METADATA_KEY,
    THIN_RULER_COLOR,
    ZIndex,
} from "../constants";
import {
    SequenceTarget,
    createDraggingSequenceTargetMetadata,
    isSequenceTarget,
} from "./ItemMetadata";
import { assertHasMetadata } from "./metadataUtils";

type DragMarker = Shape & SequenceTarget;

export function createDragMarker(
    position: Vector2,
    dpi: number,
    gridType: GridType,
    playerColor: string,
    privateMode: boolean,
): DragMarker {
    const diameter = dpi / 2;
    const scale = getScale(gridType);
    const shape = buildShape()
        .name("Measurement Marker")
        .shapeType("CIRCLE")
        .position(position)
        .disableAutoZIndex(true)
        .zIndex(ZIndex.MARKER)
        .width(diameter * scale.x)
        .height(diameter * scale.y)
        .fillColor(playerColor)
        .fillOpacity(1)
        .strokeColor(THIN_RULER_COLOR)
        .strokeOpacity(1)
        .strokeDash(privateMode ? [30, 10] : [])
        .strokeWidth(dpi * MARKER_STROKE_WIDTH_DPI_SCALING)
        .locked(true)
        .layer("CONTROL")
        .metadata({ [METADATA_KEY]: createDraggingSequenceTargetMetadata() })
        .build();
    return assertHasMetadata(shape);
}

export function isDragMarker(target: Item | undefined): target is DragMarker {
    return target !== undefined && isShape(target) && isSequenceTarget(target);
}

export const DRAG_MARKER_FILTER: KeyFilter[] = [
    { key: "type", value: "SHAPE", coordinator: "&&" },
    { key: ["metadata", METADATA_KEY, "hasSequence"], value: true },
];
