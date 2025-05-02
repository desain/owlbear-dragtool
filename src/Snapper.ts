import type {
    GridMeasurement,
    GridType,
    Item,
    Vector2,
} from "@owlbear-rodeo/sdk";
import OBR, { isImage } from "@owlbear-rodeo/sdk";

/**
 * Snapper is responsible for snapping the position of an item to the grid. It keeps track of the last snapped position, and
 * can report when the snapped position changes.
 */
export default class Snapper {
    readonly #snappingSensitivity: number;
    readonly #snapToCorners: boolean;
    readonly #snapToCenter: boolean;
    #lastPosition: Vector2;

    /**
     * Create snapper.
     * @param item An item if this snapper is for snapping the position of an item as it moves. Used to
     *             determine whether to snap to corners or center based on item size.
     * @param measurement Grid measurement.
     * @param gridType Grid type.
     */
    constructor(
        item: Item | null,
        measurement: GridMeasurement,
        gridType: GridType,
    ) {
        this.#lastPosition = item?.position ?? { x: 0, y: 0 };
        this.#snappingSensitivity = measurement === "EUCLIDEAN" ? 0 : 1;
        if (item && isImage(item) && gridType === "SQUARE") {
            const itemSizeInGridUnits =
                Math.max(
                    item.image.width * item.scale.x,
                    item.image.height * item.scale.y,
                ) / item.grid.dpi;
            const sizeIsOdd = (Math.round(itemSizeInGridUnits) & 1) === 1;
            this.#snapToCenter = sizeIsOdd;
            this.#snapToCorners = !sizeIsOdd;
        } else {
            this.#snapToCorners = false;
            this.#snapToCenter = true;
        }
    }

    async snap(
        position: Vector2,
    ): Promise<[position: Vector2, didChange: boolean]> {
        const newPosition = await OBR.scene.grid.snapPosition(
            position,
            this.#snappingSensitivity,
            this.#snapToCorners,
            this.#snapToCenter,
        );
        const changed =
            newPosition.x !== this.#lastPosition.x ||
            newPosition.y !== this.#lastPosition.y;
        this.#lastPosition = newPosition;
        return [newPosition, changed];
    }
}
