import OBR from "@owlbear-rodeo/sdk";
import { deferCallAll } from "owlbear-utils";
import { usePlayerStorage } from "./usePlayerStorage";

/**
 * @returns [Promise that resolves once store has initialized, function to stop syncing]
 */
export function startSyncing(): [
    initialized: Promise<void>,
    unsubscribe: VoidFunction,
] {
    // console.log("startSyncing");
    const store = usePlayerStorage.getState();

    const sceneReadyInitialized = OBR.scene.isReady().then(store.setSceneReady);
    const unsubscribeSceneReady = OBR.scene.onReadyChange((ready) => {
        store.setSceneReady(ready);
    });

    const playerColorInitialized = OBR.player
        .getColor()
        .then(store.setPlayerColor);
    const unsubscribePlayer = OBR.player.onChange((player) => {
        store.setPlayerColor(player.color);
    });

    const gridInitialized = Promise.all([
        OBR.scene.grid.getDpi(),
        OBR.scene.grid.getMeasurement(),
        OBR.scene.grid.getType(),
    ]).then(([dpi, measurement, type]) =>
        store.setGrid({ dpi, measurement, type }),
    );
    const unsubscribeGrid = OBR.scene.grid.onChange(store.setGrid);

    return [
        Promise.all([
            sceneReadyInitialized,
            playerColorInitialized,
            gridInitialized,
        ]).then(() => void 0),
        deferCallAll(unsubscribeSceneReady, unsubscribePlayer, unsubscribeGrid),
    ];
}
