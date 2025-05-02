import type { GridType, Vector2 } from "@owlbear-rodeo/sdk";

const PI_6 = Math.PI / 6;
function degToRad(deg: number): number {
    return deg * (Math.PI / 180);
}

const ANGLE_DIMETRIC = 26.5;
const SCALE_ISOMETRIC: Vector2 = {
    x: Math.SQRT1_2 / Math.tan(PI_6),
    y: Math.SQRT1_2,
};
const SCALE_DIMETRIC: Vector2 = {
    x: Math.SQRT1_2 / Math.tan(degToRad(ANGLE_DIMETRIC)),
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
