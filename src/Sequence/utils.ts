import type { Item, Vector2 } from "@owlbear-rodeo/sdk";
import OBR, { buildPath, Math2 } from "@owlbear-rodeo/sdk";
import type { HasParameterizedMetadata } from "owlbear-utils";
import { METADATA_KEY, VECTOR2_COMPARE_EPSILON } from "../constants";
import type { SimpleAura } from "../integration_emanation/Aura";
import { isAura } from "../integration_emanation/Aura";
import type { ItemApi } from "../ItemApi";
import { withBothItemApis } from "../ItemApi";
import { isDragMarker } from "./DragMarker";
import type { SequenceTarget, SequenceTargetMetadata } from "./ItemMetadata";
import { isSequenceTarget } from "./ItemMetadata";
import { isSegment } from "./Segment";
import type { SequenceItem } from "./SequenceItem";
import { buildSequenceItem, isSequenceItem } from "./SequenceItem";
import type { Sweep } from "./Sweep";

export async function getAuras(
    id: string,
    api: ItemApi,
): Promise<SimpleAura[]> {
    return (await api.getItemAttachments([id])).filter(isAura);
}

export function itemMovedOutsideItsSequence(
    item: Item,
    items: Item[],
): boolean {
    const segments = items
        .filter(belongsToSequenceForTarget(item.id))
        .filter(isSegment);
    const previousPositions: Vector2[] = segments.flatMap((segment) => [
        segment.startPosition,
        segment.endPosition,
    ]);
    for (const position of previousPositions) {
        if (Math2.compare(item.position, position, VECTOR2_COMPARE_EPSILON)) {
            return false;
        }
    }
    return true;
}

export async function deleteSequence(target: SequenceTarget, api: ItemApi) {
    // console.log('deleting sequence for', target.id);
    const toDelete = (
        await api.getItems(belongsToSequenceForTarget(target.id))
    ).map((item) => item.id);

    if (isDragMarker(target)) {
        toDelete.push(target.id);
    } else {
        await api.updateItems([target], ([target]) => {
            if (isSequenceTarget(target)) {
                const targetDeletable = target as HasParameterizedMetadata<
                    typeof METADATA_KEY,
                    Partial<SequenceTargetMetadata>
                >;
                delete targetDeletable.metadata[METADATA_KEY].hasSequence;
                delete targetDeletable.metadata[METADATA_KEY].playerId;
                delete targetDeletable.metadata[METADATA_KEY].activelyDragging;
            }
        });
    }
    await api.deleteItems(toDelete);
}

export async function deleteAllSequencesForCurrentPlayer() {
    // console.log('deleting all for current');
    return await withBothItemApis(async (api) => {
        const sequenceTargets = await api.getItems(isSequenceTarget);
        await Promise.all(
            sequenceTargets
                .filter(
                    (target) =>
                        target.metadata[METADATA_KEY].playerId ===
                        OBR.player.id,
                )
                .map((target) => deleteSequence(target, api)),
        );
    });
}

export async function getSequenceLength(targetId: string, api: ItemApi) {
    return (
        await Promise.all(
            (await api.getItems(isSegment))
                .filter(belongsToSequenceForTarget(targetId))
                .map(async (ruler) => {
                    const distance = await OBR.scene.grid.getDistance(
                        ruler.startPosition,
                        ruler.endPosition,
                    );
                    return (
                        distance * ruler.metadata[METADATA_KEY].scalingFactor
                    );
                }),
        )
    ).reduce((a, b) => a + b, 0);
}

export function getOrCreateSweep(
    target: Item,
    aura: SimpleAura,
    existingSweeps: Sweep[],
): Sweep {
    const existingSweep = existingSweeps.find(
        (sweep) => sweep.metadata[METADATA_KEY].auraId === aura.id,
    );
    if (existingSweep) {
        return existingSweep;
    } else {
        const sweep: Sweep = buildSequenceItem(
            target,
            "DRAWING",
            null,
            { auraId: aura.id },
            buildPath()
                .position({ x: 0, y: 0 })
                .commands([])
                .strokeWidth(aura.style.strokeWidth)
                .strokeColor(aura.style.strokeColor)
                .strokeDash(aura.style.strokeDash)
                .strokeOpacity(0)
                .fillColor(aura.style.fillColor)
                .fillOpacity(aura.style.fillOpacity)
                .fillRule("nonzero"),
        ); // todo how to typecheck this?
        return sweep;
    }
}

export function belongsToSequenceForTarget(
    targetId: string,
): (item: Item) => item is SequenceItem {
    return (item): item is SequenceItem =>
        isSequenceItem(item) && item.attachedTo === targetId;
}
