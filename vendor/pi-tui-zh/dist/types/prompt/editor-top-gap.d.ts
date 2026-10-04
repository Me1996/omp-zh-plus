import type { Component } from "../index.js";
import type { NativeNode } from "../native/node.js";
/** Set the process-wide editor gap layout. */
export declare function setEditorGapComposerShape(shape: string): void;
/**
 * One-line top margin between the working/status HUD row and the editor.
 * The band composer's status band is designed to sit flush under the working
 * row, so the gap collapses there — but only while that row actually rendered
 * content (the loader and idle title bring their own leading blank). An empty
 * status row keeps the gap so the band never sits flush against the
 * transcript. Shape and row state are read at render time, so runtime changes
 * apply immediately.
 */
export declare class EditorTopGap implements Component {
    readonly statusRowOccupied: () => boolean;
    /** @param statusRowOccupied Whether the status/working row directly above rendered lines this frame. */
    constructor(statusRowOccupied: () => boolean);
    render(_width: number): readonly string[];
    describe(): NativeNode;
}
