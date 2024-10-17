// TODO factor out to its own package?
import { Curve, isCurve, isShape, Item, Shape } from "@owlbear-rodeo/sdk";

export type Emanation = Curve | (Shape & { shapeType: 'CIRCLE' });

export function isEmanation(item: Item): item is Emanation {
    return isCurve(item) || (isShape(item) && item.shapeType === 'CIRCLE');
}
