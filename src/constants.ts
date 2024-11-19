export const PLUGIN_ID = "com.desain.dragtool";
export const TOOL_ID = `${PLUGIN_ID}/tool`;
export const DRAG_MODE_ID = `${PLUGIN_ID}/mode-drag-item`;
export const METADATA_KEY = `${PLUGIN_ID}/metadata`;
export const TRACK_MOVEMENT_ID = `${PLUGIN_ID}/menu-track`;
export const EDIT_MOVEMENT_ID = `${PLUGIN_ID}/menu-edit`;

export enum ZIndex {
    RULER = 0,
    WAYPOINT = 1,
    MARKER = 2,
    LABEL = 3,
}

export const MARKER_STROKE_WIDTH_DPI_SCALING = 1 / 20;

export const VECTOR2_COMPARE_EPSILON = 0.01;
