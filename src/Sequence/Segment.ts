import type {
    GridScale,
    Item,
    Layer,
    Ruler,
    Vector2,
} from "@owlbear-rodeo/sdk";
import { buildRuler, isRuler } from "@owlbear-rodeo/sdk";
import type { HasParameterizedMetadata } from "owlbear-utils";
import { METADATA_KEY, ZIndex } from "../constants";
import type { SequenceItemMetadata } from "./SequenceItem";
import { buildSequenceItem, isSequenceItem } from "./SequenceItem";

type SegmentMetadata = SequenceItemMetadata & {
    scalingFactor: number;
};

export type Segment = Ruler &
    HasParameterizedMetadata<typeof METADATA_KEY, SegmentMetadata>;

export function isSegment(item: Item): item is Segment {
    return (
        isRuler(item) &&
        isSequenceItem(item) &&
        "scalingFactor" in item.metadata[METADATA_KEY]
    );
}

export function createSegment(
    target: Item,
    end: Vector2,
    layer: Layer,
    scalingFactor: number,
): Segment {
    return buildSequenceItem(
        target,
        layer,
        ZIndex.RULER,
        { scalingFactor },
        buildRuler()
            .name(`Path Ruler for ${target.name}`)
            .startPosition(target.position)
            .endPosition(end)
            .variant("DASHED"),
    );
}

export function getSegmentText(
    numGridUnits: number,
    scale: GridScale,
    scalingFactor: number,
) {
    const xFactorText = scalingFactor === 1 ? "" : `x${scalingFactor}`;
    return `${Math.round(
        numGridUnits * scale.parsed.multiplier,
    )}${xFactorText}${scale.parsed.unit}`;
}
