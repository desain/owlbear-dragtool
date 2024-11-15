import OBR, { Item } from "@owlbear-rodeo/sdk";
import { METADATA_KEY } from "../constants";
import { ItemWithMetadata } from "./metadataUtils";

interface SequenceTargetMetadata {
    hasSequence: true;
    playerId: string;
    activelyDragging: boolean;
}

export type SequenceTarget = ItemWithMetadata<
    Item,
    typeof METADATA_KEY,
    SequenceTargetMetadata
>;

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
) & {
    movementSpeed?: number;
};

export type DraggableItem = ItemWithMetadata<
    Item,
    typeof METADATA_KEY,
    DraggableItemMetadata
>;

function isDraggableItemMetadata(
    metadata: unknown,
): metadata is DraggableItemMetadata {
    return (
        (isSequenceTargetMetadata(metadata) ||
            isPreviousTargetMetadata(metadata)) &&
        (!("movementSpeed" in metadata) ||
            typeof metadata.movementSpeed === "number")
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

export function getItemMetadata(item: Item): DraggableItemMetadata | null {
    const metadata = item.metadata[METADATA_KEY];
    if (isDraggableItemMetadata(metadata)) {
        return metadata;
    }
    return null;
}
