import OBR, { Item } from "@owlbear-rodeo/sdk";
import { isObject } from "util";
import { METADATA_KEY } from "../constants";
import { ItemWithMetadata } from "./metadataUtils";

interface SequenceTargetMetadata {
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

export type SequenceTarget = ItemWithMetadata<
    Item,
    typeof METADATA_KEY,
    SequenceTargetMetadata
>;

interface PreviousTargetMetadata {
    hasSequence: false;
}

function isPreviousTargetMetadata(
    metadata: unknown,
): metadata is PreviousTargetMetadata {
    return (
        typeof metadata === "object" &&
        metadata !== null &&
        "hasSequence" in metadata &&
        !metadata.hasSequence
    );
}

type DraggableItemMetadata = (
    | SequenceTargetMetadata
    | PreviousTargetMetadata
    | Record<string, never>
) & {
    movementSpeed?: number;
};

function isDraggableItemMetadata(
    metadata: unknown,
): metadata is DraggableItemMetadata {
    return (
        metadata !== null &&
        typeof metadata === 'object' &&
        (!("movementSpeed" in metadata) ||
            typeof metadata.movementSpeed === "number")
    );
}

export type DraggableItem = ItemWithMetadata<
    Item,
    typeof METADATA_KEY,
    DraggableItemMetadata
>;

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

export function getItemMetadata(item: Item): DraggableItemMetadata | null {
    const metadata = item.metadata[METADATA_KEY];
    if (isDraggableItemMetadata(metadata)) {
        return metadata;
    }
    return null;
}
