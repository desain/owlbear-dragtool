import type { Item } from "@owlbear-rodeo/sdk";
import OBR from "@owlbear-rodeo/sdk";
import type { HasParameterizedMetadata } from "owlbear-utils";
import { METADATA_KEY, METADATA_KEY_SPEED } from "../constants";

export interface SequenceTargetMetadata {
    hasSequence: true;
    playerId: string;
    activelyDragging: boolean;
}

function isSequenceTargetMetadata(
    metadata: unknown,
): metadata is SequenceTargetMetadata {
    return (
        typeof metadata === "object" &&
        metadata !== null &&
        "hasSequence" in metadata &&
        metadata.hasSequence === true &&
        "playerId" in metadata &&
        typeof metadata.playerId === "string" &&
        "activelyDragging" in metadata &&
        typeof metadata.activelyDragging === "boolean"
    );
}

export type SequenceTarget = Item &
    HasParameterizedMetadata<typeof METADATA_KEY, SequenceTargetMetadata>;

export type DraggableItem = Item &
    HasParameterizedMetadata<typeof METADATA_KEY_SPEED, number | undefined>;

export function isDraggableItem(item: Item): item is DraggableItem {
    return (
        !(METADATA_KEY_SPEED in item.metadata) ||
        typeof item.metadata[METADATA_KEY_SPEED] === "number"
    );
}

export function createDraggingSequenceTargetMetadata(): SequenceTargetMetadata {
    return {
        hasSequence: true,
        playerId: OBR.player.id,
        activelyDragging: true,
    };
}

export function isSequenceTarget(item: Item): item is SequenceTarget {
    const metadata = item.metadata[METADATA_KEY];
    return isSequenceTargetMetadata(metadata);
}
