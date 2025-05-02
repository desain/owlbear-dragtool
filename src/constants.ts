export const PLUGIN_ID = "com.desain.dragtool";

// Storage
export const LOCAL_STORAGE_STORE_NAME = `${PLUGIN_ID}/localStorage`;

// Tool
export const ID_TOOL = `${PLUGIN_ID}/tool`;
export const ID_TOOL_MODE_DRAG = `${PLUGIN_ID}/toolModeDrag`;
export const METADATA_KEY = `${PLUGIN_ID}/metadata`;
export const ID_CONTEXTMENU_TRACK = `${PLUGIN_ID}/menu-track`;
export const ID_CONTEXTMENU_EDIT = `${PLUGIN_ID}/menu-edit`;

// UI elements
export const ZIndex = {
    RULER: 0,
    WAYPOINT: 1,
    MARKER: 2,
    LABEL: 3,
} as const;

export const MARKER_STROKE_WIDTH_DPI_SCALING = 1 / 20;

export const VECTOR2_COMPARE_EPSILON = 0.01;

export const THIN_RULER_COLOR = "#6F738F"; // OBR thin rulers color
