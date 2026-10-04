/**
 * Settling: the frame provider marks finalized transcript blocks so the
 * native reconciler stops keeping their description (spec §12 "Settling and
 * program memory"). A settled block stays editable: a later change is sent as
 * targeted ops by id, followed by a fresh `settle` hint.
 */
import type { Component } from "../tui.js";
/** Mark `component` (and everything it describes) as finalized. Idempotent; a no-op outside a TSP terminal. */
export declare function settleNative(component: Component): void;
/** Whether {@link settleNative} was called for `component`. */
export declare function isNativeSettled(component: Component): boolean;
