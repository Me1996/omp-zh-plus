import type { NativeNode } from "../../native/node.js";
export declare const SETUP_OUTRO_MS = 1200;
/**
 * Native outro: the shimmering mark, the saved confirmation, and an
 * indeterminate progress bar standing in for the timed sweep. A click sends
 * the `continue` action.
 */
export declare function describeSetupOutro(): NativeNode;
export declare function renderSetupOutro(width: number, height: number, elapsedMs: number): string[];
