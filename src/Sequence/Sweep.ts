import OBR, {
    isPath,
    Item,
    Math2,
    Path,
    PathCommand,
    Vector2,
} from "@owlbear-rodeo/sdk";
import { METADATA_KEY } from "../constants";
import { getSweeper, Sweeper } from "../Sweeper";
import { ItemWithMetadata } from "./metadataUtils";
import { isSequenceItem, SequenceItemMetadata } from "./SequenceItem";
import {
    belongsToSequenceForTarget,
    getAuras,
    getOrCreateSweep,
} from "./utils";

export type SweepMetadata = SequenceItemMetadata & {
    /**
     * Which aura the item is for, if it's for one (e.g it's a sweep).
     */
    auraId: string;
};

const AURA_ID: keyof SweepMetadata = "auraId";

export type Sweep = ItemWithMetadata<Path, typeof METADATA_KEY, SweepMetadata>;

export function isSweep(item: Item): item is Sweep {
    return (
        isPath(item) &&
        isSequenceItem(item) &&
        AURA_ID in item.metadata[METADATA_KEY]
    );
}

/**
 * Type that represents the data needed to sweep a path.
 */
export type SweepData = {
    /**
     * Commands from the sweeps for the aura so far.
     */
    baseCommands: PathCommand[];
    sweeper: Sweeper;
    /**
     * Aura position offset from target.
     */
    baseOffset: Vector2;
};

export async function getSweeps(target: Item) {
    const auras = await getAuras(target.id, OBR.scene.local);
    const existingSweeps: Sweep[] = (
        await OBR.scene.items.getItems(belongsToSequenceForTarget(target.id))
    ).filter(isSweep);
    const sweeps = await Promise.all(
        auras.map((aura) => getOrCreateSweep(target, aura, existingSweeps)),
    );
    const sweepDatas: SweepData[] = [];
    for (let i = 0; i < auras.length; i++) {
        sweepDatas.push({
            sweeper: getSweeper(auras[i]),
            baseCommands: sweeps[i].commands,
            baseOffset: Math2.subtract(auras[i].position, target.position),
        });
    }
    return { sweeps, sweepDatas };
}
