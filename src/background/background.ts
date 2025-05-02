import type { Item, Player } from "@owlbear-rodeo/sdk";
import OBR from "@owlbear-rodeo/sdk";
import { deferCallAll } from "owlbear-utils";
import { version } from "../../package.json";
import { METADATA_KEY } from "../constants";
import { startWatchingContextMenuEnabled } from "../contextmenu/contextmenu";
import type { ItemApi } from "../ItemApi";
import { withBothItemApis } from "../ItemApi";
import { isSequenceTarget } from "../sequence/ItemMetadata";
import { deleteSequence, itemMovedOutsideItsSequence } from "../sequence/utils";
import { startSyncing } from "../state/startSyncing";
import { installTool } from "../tool/DragTool";

async function installExtension(): Promise<VoidFunction> {
    console.log(`Dragtool version ${version}`);

    const [storeInitialized, stopSyncing] = startSyncing();
    await storeInitialized;

    const stopWatchingContextMenu = await startWatchingContextMenuEnabled();

    await installTool();

    const gmUnsubscribeFunctions: VoidFunction[] = [];
    if ((await OBR.player.getRole()) === "GM") {
        gmUnsubscribeFunctions.push(
            OBR.party.onChange(deleteSequencesFromVanishedPlayers),
        );
        await withBothItemApis((api) => {
            gmUnsubscribeFunctions.push(
                api.onChange(async (items) => {
                    await deleteInvalidatedSequences(items, api);
                }),
            );
            return Promise.resolve();
        });
    }

    return deferCallAll(
        () => console.log("Uninstalling Dragtool"),
        stopSyncing,
        stopWatchingContextMenu,
        ...gmUnsubscribeFunctions,
    );
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

let uninstall: VoidFunction = () => {
    // No uninstall by default
};
OBR.onReady(async () => {
    // console.log("onReady");

    if (await OBR.scene.isReady()) {
        // console.log("isReady");
        uninstall = await installExtension();
    }

    OBR.scene.onReadyChange(async (ready) => {
        // console.log("onReadyChange", ready);
        if (ready) {
            uninstall = await installExtension();
        } else {
            uninstall();
            uninstall = () => {
                // nothing to uninstall anymore
            };
        }
    });
});
