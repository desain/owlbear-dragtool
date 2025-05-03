import type { GridScale, GridType, Item, Vector2 } from "@owlbear-rodeo/sdk";
import OBR, { Math2 } from "@owlbear-rodeo/sdk";
import { assertItem, isObject, type GridParsed } from "owlbear-utils";
import type { AbstractInteraction } from "./AbstractInteraction";
import {
    createLocalInteraction,
    wrapRealInteraction,
} from "./AbstractInteraction";
import {
    METADATA_KEY,
    METADATA_KEY_SPEED,
    VECTOR2_COMPARE_EPSILON,
} from "./constants";
import { createDragMarker } from "./sequence/DragMarker";
import type { SequenceTarget } from "./sequence/ItemMetadata";
import {
    createDraggingSequenceTargetMetadata,
    isDraggableItem,
    isSequenceTarget,
} from "./sequence/ItemMetadata";
import type { Segment } from "./sequence/Segment";
import { createSegment, getSegmentText } from "./sequence/Segment";
import type { Sweep, SweepData } from "./sequence/Sweep";
import { getSweeps } from "./sequence/Sweep";
import { getSequenceLength } from "./sequence/utils";
import type { Waypoint } from "./sequence/Waypoint";
import { createWaypoint } from "./sequence/Waypoint";
import type { WaypointLabel } from "./sequence/WaypointLabel";
import {
    createWaypointLabel,
    getWaypointLabelText,
} from "./sequence/WaypointLabel";
import Snapper from "./Snapper";
import { usePlayerStorage } from "./state/usePlayerStorage";

interface DragInteractionItems {
    target: SequenceTarget;
    sweeps: Sweep[];
    segment: Segment;
    waypoint: Waypoint;
    waypointLabel: WaypointLabel;
}

// just for semantics
type DistanceInGridUnits = number; // eg 1 for 5ft on a 5ft grid
type DistanceInGridMultiplied = number; // eg 5 for 5ft on a 5ft grid

function gridMultipliedToUnits(
    gridMultiplied: DistanceInGridMultiplied | null,
    scale: GridParsed["parsedScale"],
): DistanceInGridUnits | null {
    return gridMultiplied === null ? null : gridMultiplied / scale.multiplier;
}

export default class DragState {
    readonly #start: Vector2;
    /**
     * Distance the target has traveled before the current drag.
     */
    readonly #baseDistance: DistanceInGridUnits;
    readonly #distanceScaling: number;
    readonly #interaction: AbstractInteraction<Item[]>;
    readonly #sweepData: SweepData[];
    readonly #snapper: Snapper;
    /**
     * Whether the target was created just for this drag (e.g it's a marker for a measurement).
     */
    readonly #targetIsNew: boolean;
    readonly #movementSpeed: DistanceInGridUnits | null;
    readonly #dpi: number;

    private constructor(
        start: Vector2,
        baseDistance: DistanceInGridUnits,
        distanceScaling: number,
        interaction: AbstractInteraction<Item[]>,
        sweepData: SweepData[],
        snapper: Snapper,
        targetIsNew: boolean,
        movementSpeed: DistanceInGridUnits | null,
        dpi: number,
    ) {
        this.#start = start;
        this.#baseDistance = baseDistance;
        this.#distanceScaling = distanceScaling;
        this.#interaction = interaction;
        this.#sweepData = sweepData;
        this.#snapper = snapper;
        this.#targetIsNew = targetIsNew;
        this.#movementSpeed = movementSpeed;
        this.#dpi = dpi;
    }

    static setupOrCreateTarget = (
        targetArg: Item | null,
        positionForNew: Vector2,
        dpi: number,
        gridType: GridType,
        playerColor: string,
        privateMode: boolean,
    ): { target: SequenceTarget; targetIsNew: boolean } => {
        let target: SequenceTarget;
        const targetIsNew = targetArg === null;
        if (targetArg === null) {
            target = createDragMarker(
                positionForNew,
                dpi,
                gridType,
                playerColor,
                privateMode,
            );
        } else {
            const oldMetadata = targetArg.metadata[METADATA_KEY];
            targetArg.metadata[METADATA_KEY] = {
                ...(isObject(oldMetadata) ? oldMetadata : {}),
                ...createDraggingSequenceTargetMetadata(),
            };
            assertItem(targetArg, isSequenceTarget);
            target = targetArg;
        }
        return { target, targetIsNew };
    };

    /**
     * Create a new drag state and create all necessary items.
     * @param targetArg Item to start moving, or null to create a marker.
     * @param pointerPosition Position of mouse pointer.s
     * @param privateMode Whether to use only local items. Must not be set when the item is not a local item.
     * @param aboveCharacters Whether to place the sequence items above characters in the Z order.
     * @returns New drag state.
     */
    static createDrag = async (
        targetArg: Item | null,
        pointerPosition: Vector2,
        distanceScaling: number,
        privateMode: boolean,
        aboveCharacters: boolean,
    ): Promise<DragState> => {
        const {
            grid: { measurement, type: gridType, dpi, parsedScale: gridScale },
            playerColor,
        } = usePlayerStorage.getState();

        const snapper = new Snapper(targetArg, measurement, gridType);
        const layer = aboveCharacters ? "RULER" : "DRAWING";
        const [end] = await snapper.snap(pointerPosition);
        const { target, targetIsNew } = DragState.setupOrCreateTarget(
            targetArg,
            end,
            dpi,
            gridType,
            playerColor,
            privateMode,
        );
        const movementSpeed = gridMultipliedToUnits(
            isDraggableItem(target)
                ? target.metadata[METADATA_KEY_SPEED] ?? null
                : null,
            gridScale,
        );
        const { sweeps, sweepDatas: sweepData } = await getSweeps(target);
        const segment = createSegment(target, end, layer, distanceScaling);
        const waypoint = createWaypoint(
            target,
            layer,
            dpi,
            gridType,
            playerColor,
        );
        const waypointLabel = createWaypointLabel(target);
        const interactionItems = DragState.composeItems({
            target,
            sweeps,
            segment,
            waypointLabel,
            waypoint,
        });
        const interaction: AbstractInteraction<Item[]> = privateMode
            ? await createLocalInteraction(...interactionItems)
            : await wrapRealInteraction(...interactionItems);

        return new DragState(
            target.position,
            await getSequenceLength(target.id, interaction.itemApi),
            distanceScaling,
            interaction,
            sweepData,
            snapper,
            targetIsNew,
            movementSpeed,
            dpi,
        );
    };

    /**
     * Break down the misc items in an interaction.
     * @param items Misc items
     * @returns object that labels items
     */
    #decomposeItems(items: Item[]): DragInteractionItems {
        let idx = 0;
        const target = items[idx++];
        assertItem(target, isSequenceTarget);

        const numSweeps = this.#sweepData.length;
        const sweeps = items.slice(idx, (idx += numSweeps)) as Sweep[];

        const segment = items[idx++] as Segment;
        const waypointLabel = items[idx++] as WaypointLabel;
        const waypoint = items[idx++] as Waypoint;
        return { target, sweeps, segment, waypointLabel, waypoint };
    }

    static composeItems = ({
        target,
        sweeps,
        segment,
        waypointLabel,
        waypoint,
    }: DragInteractionItems): Item[] => [
        // existing items
        target,
        ...sweeps,
        // new items
        segment,
        waypointLabel,
        waypoint,
    ];

    async #getDistanceAndScale(end: Vector2): Promise<{
        unadjustedDistance: DistanceInGridUnits;
        scale: GridScale;
    }> {
        const [unadjustedDistance, scale] = await Promise.all([
            OBR.scene.grid.getDistance(this.#start, end),
            OBR.scene.grid.getScale(),
        ]);
        return { unadjustedDistance, scale };
    }

    #updateItems(
        changedEnd: boolean,
        end: Vector2,
        didLimit: boolean,
        unadjustedDistance: DistanceInGridUnits,
        scale: GridScale,
        { target, sweeps, segment, waypointLabel }: DragInteractionItems,
    ) {
        if (changedEnd) {
            const adjustedDistance = unadjustedDistance * this.#distanceScaling;
            const totalDistance = this.#baseDistance + adjustedDistance;
            waypointLabel.text = {
                ...waypointLabel.text,
                plainText: getWaypointLabelText(totalDistance, scale, didLimit),
            };
            waypointLabel.position = end;

            segment.endPosition = end;
            segment.measurement = getSegmentText(
                unadjustedDistance,
                scale,
                this.#distanceScaling,
            );

            target.position = end;

            const movementVector = Math2.subtract(end, this.#start);
            for (let i = 0; i < sweeps.length; i++) {
                const sweep = sweeps[i];
                const startPosition = Math2.add(
                    this.#start,
                    this.#sweepData[i].baseOffset,
                );
                const sweepCommands = this.#sweepData[i].sweeper(
                    startPosition,
                    movementVector,
                );
                sweep.commands = [
                    ...this.#sweepData[i].baseCommands,
                    ...sweepCommands,
                ];
            }
        }
    }

    async #limit(
        position: Vector2,
    ): Promise<[position: Vector2, didLimit: boolean]> {
        if (this.#movementSpeed === null) {
            return [position, false];
        } else {
            const speedLeft: DistanceInGridUnits =
                this.#movementSpeed - this.#baseDistance;
            const movementVector = Math2.subtract(position, this.#start);
            const movementVectorLength: DistanceInGridUnits =
                (await OBR.scene.grid.getDistance(this.#start, position)) *
                this.#distanceScaling;

            if (
                movementVectorLength > speedLeft &&
                this.#distanceScaling !== 0
            ) {
                const movementVectorNormalized =
                    Math2.normalize(movementVector);
                const limitedMovementVector = Math2.multiply(
                    movementVectorNormalized,
                    (speedLeft / this.#distanceScaling) * this.#dpi,
                );

                return [Math2.add(this.#start, limitedMovementVector), true];
            } else {
                return [position, false];
            }
        }
    }

    async update(pointerPosition: Vector2) {
        const [limitedEnd, didLimit] = await this.#limit(pointerPosition);
        const [end, changedEnd] = await this.#snapper.snap(limitedEnd);
        const { unadjustedDistance, scale } = await this.#getDistanceAndScale(
            end,
        );
        const { update } = this.#interaction;
        const items = await update((items) => {
            this.#updateItems(
                changedEnd,
                end,
                didLimit,
                unadjustedDistance,
                scale,
                this.#decomposeItems(items),
            );
        });

        return { ...this.#decomposeItems(items), end };
    }

    async finish(pointerPosition?: Vector2): Promise<Item> {
        const { target, segment, waypointLabel, sweeps, waypoint } =
            pointerPosition !== undefined
                ? await this.update(pointerPosition)
                : {
                      ...this.#decomposeItems(
                          await this.#interaction.update(() => {
                              /*TODO changeme*/
                          }),
                      ),
                  };

        const { keepAndStop, itemApi } = this.#interaction;

        const toAdd: Item[] = [segment, waypointLabel, ...sweeps, waypoint];
        if (this.#targetIsNew) {
            toAdd.push(target);
        } else {
            // Network item values snap back by default when an interaction is stopped,
            // so finalize the interaction by updating the target for real.
            // Do this before stopping the interaction to avoid visual flicker.
            // Also, this may cause wall collision.
            await itemApi.updateItems([target.id], ([realTarget]) => {
                realTarget.position = target.position;
                realTarget.metadata[METADATA_KEY] =
                    target.metadata[METADATA_KEY];
                // This triggers an update which checks if the target has moved outside its sequence,
                // so don't mark it as done dragging yet so we skip that check, since the sequence
                // segment for this move doesn't exist yet for network drags.
            });
        }

        await keepAndStop(toAdd);

        // but now collision might have been applied, so fix the segment and label
        const [collidedTarget] = await itemApi.getItems([target.id]);
        const changedEnd = !Math2.compare(
            target.position,
            collidedTarget.position,
            VECTOR2_COMPARE_EPSILON,
        );
        const { unadjustedDistance, scale } = await this.#getDistanceAndScale(
            collidedTarget.position,
        );
        await itemApi.updateItems(
            DragState.composeItems({
                target,
                sweeps,
                segment,
                waypointLabel,
                waypoint,
            }),
            (items) => {
                const dragInteractionItems = this.#decomposeItems(items);
                this.#updateItems(
                    changedEnd,
                    collidedTarget.position,
                    false, // collision can only make the path shorter
                    unadjustedDistance,
                    scale,
                    dragInteractionItems,
                );

                // Now that the sequence segment definitely exists, we can mark the item as not being dragged
                dragInteractionItems.target.metadata[
                    METADATA_KEY
                ].activelyDragging = false;
            },
        );
        return collidedTarget;
    }

    async cancel() {
        const { keepAndStop } = this.#interaction;
        await keepAndStop([]);
    }
}
