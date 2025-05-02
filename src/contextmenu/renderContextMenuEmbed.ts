import OBR from "@owlbear-rodeo/sdk";
import "../../assets/style.css";
import { METADATA_KEY } from "../constants";
import type { DraggableItem } from "../sequence/ItemMetadata";

OBR.onReady(renderContextMenu);

async function renderContextMenu() {
    const [selection, scale, theme] = await Promise.all([
        OBR.player.getSelection(),
        OBR.scene.grid.getScale(),
        OBR.theme.getTheme(),
    ]);
    const items: DraggableItem[] = await OBR.scene.items.getItems(selection);

    if (items.length !== 1) {
        return;
    }
    const app = document.getElementById("app")!;
    app.style.setProperty("color", theme.text.primary);
    app.innerHTML = `
        <input type="number" id="movement" value="${
            items[0].metadata[METADATA_KEY].movementSpeed ?? 0
        }" min="0" step="${scale.parsed.multiplier}"/>
        <span class="unit">${scale.parsed.unit}.</span>
        <button id="forget">Stop tracking</button>
    `;
    document
        .getElementById("movement")!
        .addEventListener("change", async (event) => {
            const value = parseInt((event.target as HTMLInputElement).value);
            return await OBR.scene.items.updateItems(items, (items) =>
                items.forEach((item: DraggableItem) => {
                    console.log("change movement to", value);
                    item.metadata[METADATA_KEY].movementSpeed = value;
                }),
            );
        });

    document.getElementById("forget")!.addEventListener(
        "click",
        async () =>
            await OBR.scene.items.updateItems(items, (items) =>
                items.forEach((item: DraggableItem) => {
                    item.metadata[METADATA_KEY].movementSpeed = undefined;
                }),
            ),
    );
}
