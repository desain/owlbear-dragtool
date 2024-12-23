import OBR, { Item, Player } from "@owlbear-rodeo/sdk";
import { METADATA_KEY } from "./constants";
import { createContextMenu } from "./createContextMenu";
import { ItemApi, withBothItemApis } from "./ItemApi";
import { isSequenceTarget } from "./Sequence/ItemMetadata";
import { deleteSequence, itemMovedOutsideItsSequence } from "./Sequence/utils";
import ChangeScalingAction from "./Tool/ChangeScalingAction";
import CLEAR_ACTION from "./Tool/ClearAction";
import DragCharacterMode from "./Tool/DragCharacterMode";
import DRAG_TOOL from "./Tool/DragTool";
import MeasureMode from "./Tool/MeasureMode";

export default async function installDragTool() {
    console.log("Dragtool 0.0.1");
    const changeScalingAction = new ChangeScalingAction();
    await Promise.all([
        createContextMenu(),
        OBR.tool.create(DRAG_TOOL),
        OBR.tool.createAction(changeScalingAction),
        OBR.tool.createAction(CLEAR_ACTION),
        OBR.tool.createMode(
            new DragCharacterMode(changeScalingAction.getAndClearJustClicked),
        ),
        OBR.tool.createMode(
            new MeasureMode(
                changeScalingAction.getAndClearJustClicked,
                MeasureMode.PUBLIC,
            ),
        ),
        OBR.tool.createMode(
            new MeasureMode(
                changeScalingAction.getAndClearJustClicked,
                MeasureMode.PRIVATE,
            ),
        ),
    ]);

    const unsubscribeFunctions: (() => void)[] = [];
    if ((await OBR.player.getRole()) === "GM") {
        unsubscribeFunctions.push(
            OBR.party.onChange(deleteSequencesFromVanishedPlayers),
        );
        await withBothItemApis((api) => {
            unsubscribeFunctions.push(
                api.onChange(async (items) => {
                    await deleteInvalidatedSequences(items, api);
                }),
            );
            return Promise.resolve();
        });
    }
    return () => unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
}

/**
 * Delete a player's sequence when they leave.
 * @param players Current set of players
 */
async function deleteSequencesFromVanishedPlayers(players: Player[]) {
    const activePlayers = new Set(players.map((player) => player.id));
    activePlayers.add(OBR.player.id); // apparently the GM isn't in by default
    // console.log('players', activePlayers, 'iam', OBR.player.id);
    await withBothItemApis(async (api) => {
        const sequenceTargets = await api.getItems(isSequenceTarget);
        for (const target of sequenceTargets) {
            if (!activePlayers.has(target.metadata[METADATA_KEY].playerId)) {
                // console.log('deleting sequence of ownerless target', target, 'owner not in', activePlayers);
                await deleteSequence(target, api);
            }
        }
    });
}

/**
 * Delete a sequence when an item moves sout of it.
 * @param items Current set of items
 * @param api Item API to use (either local or remote)
 */
async function deleteInvalidatedSequences(items: Item[], api: ItemApi) {
    // Remove sequence items whose target was moved
    for (const item of items) {
        if (
            isSequenceTarget(item) &&
            !item.metadata[METADATA_KEY].activelyDragging &&
            itemMovedOutsideItsSequence(item, items)
        ) {
            // console.log(
            //     "item moved out of its sequence",
            //     item.id,
            //     "items are",
            //     items,
            // );
            await deleteSequence(item, api);
        }
    }
}
