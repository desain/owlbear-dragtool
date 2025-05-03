import type { Item, Layer } from "@owlbear-rodeo/sdk";
import type { GenericItemBuilder } from "@owlbear-rodeo/sdk/lib/builders/GenericItemBuilder";
import type { HasParameterizedMetadata } from "owlbear-utils";
import { METADATA_KEY } from "../constants";

export interface SequenceItemMetadata {
    type: "SEQUENCE_ITEM";
}

function createSequenceItemMetadata(): SequenceItemMetadata {
    return { type: "SEQUENCE_ITEM" };
}

export type SequenceItem = Item &
    HasParameterizedMetadata<typeof METADATA_KEY, SequenceItemMetadata>;

export function isSequenceItem(item: Item): item is SequenceItem {
    const metadata = item.metadata[METADATA_KEY];
    return (
        typeof metadata === "object" &&
        metadata !== null &&
        "type" in metadata &&
        metadata.type === "SEQUENCE_ITEM"
    );
}

interface Builds<Result extends Item> {
    build(): Result;
}
type BuildResult<Builder extends Builds<Item>> = ReturnType<Builder["build"]>;

export function buildSequenceItem<
    MetadataType extends SequenceItemMetadata,
    Builder extends GenericItemBuilder<Builder> & Builds<Item>,
>(
    target: Item,
    layer: Layer,
    zIndex: number | null,
    metadata: Omit<MetadataType, keyof SequenceItemMetadata>,
    builder: Builder,
): BuildResult<Builder> &
    HasParameterizedMetadata<typeof METADATA_KEY, MetadataType> {
    const builder2 = builder
        .attachedTo(target.id)
        .visible(target.visible)
        .layer(layer)
        .disableAutoZIndex(zIndex !== null)
        .zIndex(zIndex ?? 0)
        .disableHit(true)
        .locked(true)
        .disableAttachmentBehavior([
            "LOCKED",
            "POSITION",
            "ROTATION",
            "SCALE",
            "COPY",
        ])
        .metadata({
            // assuming this is all that's needed to create a MetadataType - don't manually pass in a type param more restrictive
            [METADATA_KEY]: { ...metadata, ...createSequenceItemMetadata() },
        }) as Builder &
        Builds<
            BuildResult<Builder> &
                HasParameterizedMetadata<typeof METADATA_KEY, MetadataType>
        >;
    return builder2.build() as BuildResult<typeof builder2>;
}
