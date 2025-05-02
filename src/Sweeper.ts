import type { PathCommand, Vector2 } from "@owlbear-rodeo/sdk";
import { Command, isCurve, isShape, Math2 } from "@owlbear-rodeo/sdk";
import type { SimpleAura } from "./integration_emanation/Aura";

// export function circ(centers: Vector2[], position: Vector2 = { x: 0, y: 0 }) {
//     let redness = 0;
//     for (const center of centers) {
//         const color = `#${redness.toString(16).padStart(2, '0')}0000`;
//         OBR.scene.items.addItems([buildShape().shapeType('CIRCLE').position(Math2.add(center, position))
//             .width(50).height(50).fillColor(color).build()]);
//         redness += Math.floor(256 / centers.length);
//     }
// }

export type Sweeper = (
    position: Vector2,
    movementVector: Vector2,
) => PathCommand[];

export function getSweeper(aura: SimpleAura): Sweeper {
    if (isCurve(aura)) {
        const convex = isConvex(aura.points);
        const sweeperFunc = convex
            ? getConvexPolygonSweep
            : getConcavePolygonSweep;
        const rotatedPoints = aura.points.map((p) =>
            Math2.rotate(p, { x: 0, y: 0 }, aura.rotation),
        );
        return (position: Vector2, movementVector: Vector2) =>
            sweeperFunc(position, rotatedPoints, movementVector);
    } else if (isShape(aura) && aura.shapeType === "CIRCLE") {
        return (position: Vector2, movementVector: Vector2) =>
            getCircleSweep(position, aura.width / 2, movementVector);
    } else {
        throw new Error(`Unknown aura type`);
    }
}

function isConvex(points: Vector2[]): boolean {
    const n = points.length;
    if (n < 3) {
        return true;
    } // A single point or two points are always convex

    let prevCrossProduct = 0;
    for (let i = 0; i < n; i++) {
        const a = points[i];
        const b = points[(i + 1) % n];
        const c = points[(i + 2) % n];
        const crossProduct =
            (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
        if (i === 0) {
            prevCrossProduct = crossProduct;
        } else if (crossProduct * prevCrossProduct < 0) {
            return false;
        }
        prevCrossProduct = crossProduct;
    }
    return true;
}

function getConcavePolygonSweep(
    position: Vector2,
    points: Vector2[],
    vector: Vector2,
): PathCommand[] {
    const commands: PathCommand[] = [
        [Command.MOVE, position.x + points[0].x, position.y + points[0].y],
        ...points
            .slice(1)
            .map(
                (point: Vector2): PathCommand => [
                    Command.LINE,
                    position.x + point.x,
                    position.y + point.y,
                ],
            ),
        [Command.CLOSE],
    ];
    for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        const line = Math2.subtract(b, a);
        const crossZ = line.x * vector.y - line.y * vector.x;
        const [start, end] = crossZ > 0 ? [a, b] : [b, a]; // ensure clockwise. Y axis is flipped so left hand rule
        commands.push([
            Command.MOVE,
            position.x + start.x,
            position.y + start.y,
        ]);
        commands.push([Command.LINE, position.x + end.x, position.y + end.y]);
        commands.push([
            Command.LINE,
            position.x + end.x + vector.x,
            position.y + end.y + vector.y,
        ]);
        commands.push([
            Command.LINE,
            position.x + start.x + vector.x,
            position.y + start.y + vector.y,
        ]);
        commands.push([
            Command.LINE,
            position.x + start.x,
            position.y + start.y,
        ]);
        commands.push([Command.CLOSE]);
    }
    return commands;
}

/**
 * Returns the shape that results from sweeping the circle along the line from start to end.
 * Outlines the Minkowski sum of the circle and the line.
 * @param radius Circle radius
 * @param vector Vector to sweep along
 */
function getCircleSweep(
    position: Vector2,
    radius: number,
    vector: Vector2,
): PathCommand[] {
    const radiusSizedVector = Math2.multiply(Math2.normalize(vector), radius);
    const leftPerpendicular = Math2.rotate(
        radiusSizedVector,
        { x: 0, y: 0 },
        -90,
    );
    const rightPerpendicular = Math2.rotate(
        radiusSizedVector,
        { x: 0, y: 0 },
        90,
    );
    return [
        [
            Command.MOVE,
            position.x + leftPerpendicular.x,
            position.y + leftPerpendicular.y,
        ], // left point
        [
            Command.LINE,
            position.x + leftPerpendicular.x + vector.x,
            position.y + leftPerpendicular.y + vector.y,
        ], // forward left
        [
            Command.CONIC,
            position.x + leftPerpendicular.x + vector.x + radiusSizedVector.x, // control point: forward front left
            position.y + leftPerpendicular.y + vector.y + radiusSizedVector.y,
            position.x + vector.x + radiusSizedVector.x, // forward front middle
            position.y + vector.y + radiusSizedVector.y,
            Math.SQRT1_2, // sin 45, or 0.7071067690849304?
        ],
        [
            Command.CONIC,
            position.x + rightPerpendicular.x + vector.x + radiusSizedVector.x, // control point: forward front right
            position.y + rightPerpendicular.y + vector.y + radiusSizedVector.y,
            position.x + rightPerpendicular.x + vector.x, // forward right
            position.y + rightPerpendicular.y + vector.y,
            Math.SQRT1_2,
        ],
        [
            Command.LINE,
            position.x + rightPerpendicular.x,
            position.y + rightPerpendicular.y,
        ], // right point
        [
            Command.CONIC,
            position.x + rightPerpendicular.x - radiusSizedVector.x, // control point: back right
            position.y + rightPerpendicular.y - radiusSizedVector.y,
            position.x - radiusSizedVector.x, // back middle
            position.y - radiusSizedVector.y,
            Math.SQRT1_2,
        ],
        [
            Command.CONIC,
            position.x + leftPerpendicular.x - radiusSizedVector.x, // control point: back left
            position.y + leftPerpendicular.y - radiusSizedVector.y,
            position.x + leftPerpendicular.x, // left point
            position.y + leftPerpendicular.y,
            Math.SQRT1_2,
        ],
        [Command.CLOSE],
    ];
}

/**
 * Returns the convex polygon that results from sweeping the polygon along the vector from start to end.
 * Outlines the Minkowski sum of the polygon and the vector.
 * @param points Convex polygon in clockwise order.
 * @param vector Vector to sweep along
 */
function getConvexPolygonSweep(
    position: Vector2,
    points: Vector2[],
    vector: Vector2,
): PathCommand[] {
    const leftPerpendicular = Math2.rotate(vector, { x: 0, y: 0 }, -90);

    const leftness = (p: Vector2) => Math2.dot(p, leftPerpendicular);
    const rightness = (p: Vector2) => -Math2.dot(p, leftPerpendicular);
    const left = maxIndexBy(points, leftness);
    const right = maxIndexBy(points, rightness);

    const sweepPoints: Vector2[] = [];
    sweepPoints.push(points[left]);
    for (let i = left; i != right; i = (i + 1) % points.length) {
        sweepPoints.push(Math2.add(points[i], vector));
    }
    sweepPoints.push(Math2.add(points[right], vector));
    for (let i = right; i != left; i = (i + 1) % points.length) {
        sweepPoints.push(points[i]);
    }

    return [
        [
            Command.MOVE,
            position.x + sweepPoints[0].x,
            position.y + sweepPoints[0].y,
        ],
        ...sweepPoints
            .slice(1)
            .map(
                (p): PathCommand => [
                    Command.LINE,
                    position.x + p.x,
                    position.y + p.y,
                ],
            ),
        [Command.CLOSE],
    ];
}

/**
 * Find the index that maximizes the given function.
 * @param a array
 */
function maxIndexBy<T>(a: T[], f: (_: T) => number): number {
    let maxIndex = 0;
    let maxValue = f(a[0]);
    for (let i = 1; i < a.length; i++) {
        const value = f(a[i]);
        if (value > maxValue) {
            maxValue = value;
            maxIndex = i;
        }
    }

    return maxIndex;
}
