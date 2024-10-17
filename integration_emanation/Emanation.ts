// TODO factor out to its own package?
import { Curve, isCurve, isShape, Item, Shape } from "@owlbear-rodeo/sdk";

export type Emanation = Curve | (Shape & { shapeType: 'CIRCLE' });

const EMANATION_PLUGIN_ID = 'com.desain.emanation';
const EMANATION_METADATA_KEY = `${EMANATION_PLUGIN_ID}/metadata`;

export function isEmanation(item: Item): item is Emanation {
    return isCurve(item) || (isShape(item) && item.shapeType === 'CIRCLE')
        && EMANATION_METADATA_KEY in item.metadata
        && typeof item.metadata[EMANATION_METADATA_KEY] === 'object';
}