import type { GridType, Vector2 } from "@owlbear-rodeo/sdk";
import { ANGLE_DIMETRIC_RADIANS, PI_6 } from "owlbear-utils";

const SCALE_ISOMETRIC: Vector2 = {
    x: Math.SQRT1_2 / Math.tan(PI_6),
    y: Math.SQRT1_2,
};
const SCALE_DIMETRIC: Vector2 = {
    x: Math.SQRT1_2 / Math.tan(ANGLE_DIMETRIC_RADIANS),
    y: Math.SQRT1_2,
};

export function getScale(gridType: GridType): Vector2 {
    if (gridType === "ISOMETRIC") {
        return SCALE_ISOMETRIC;
    } else if (gridType === "DIMETRIC") {
        return SCALE_DIMETRIC;
    } else {
        return { x: 1, y: 1 };
    }
}
