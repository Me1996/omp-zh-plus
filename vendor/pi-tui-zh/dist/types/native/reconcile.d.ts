import { type TspOp } from "@oh-my-pi/pi-wire";
import { type Component } from "../tui.js";
import type { DescribeContext, NativeChild } from "./node.js";
/** The regions a frame fills. */
export interface NativeRegions {
    readonly main: readonly NativeChild[];
    readonly dock: readonly NativeChild[];
    readonly layer: readonly NativeChild[];
}
/** Where a wire id came from, for event routing. */
export interface NativeTarget {
    readonly component: Component;
    /** Keypath inside the component ("" for its root node). */
    readonly keypath: string;
}
/** Stable base-36 wire id of a component instance (its root node's id). */
export declare function nativeComponentId(component: Component): string;
/** One surface's reconciler. */
export declare class Reconciler {
    #private;
    readonly surface: string;
    constructor(surface: string);
    /** `rows` fallback nodes in the last reconciled frame. */
    get fallbackCount(): number;
    /** Diff the regions against the previous frame; the first call adds everything. */
    reconcile(regions: NativeRegions, cx: DescribeContext): TspOp[];
    /**
     * The surface was closed (`keep:true`) and is being adopted: the terminal
     * dropped `dock`, `layer` and focus but kept `main`. The next frame re-adds
     * the live regions from scratch and keeps diffing `main`.
     */
    detachLive(): void;
    /** The component and keypath that described wire node `id`. */
    target(id: string): NativeTarget | null;
    /**
     * The component that described wire node `id`, then each component whose
     * node contains it, innermost first (empty for an unknown id).
     */
    owners(id: string): Component[];
    /** The key a list item node was described with (its key, else its child index). */
    itemKey(id: string): string;
    /** Wire id of the first `editor`/`input` `component` describes (for `focus`), or null. */
    focusTarget(component: Component): string | null;
    /** Stop referencing ids the terminal dropped (`gone`). */
    forget(ids: readonly string[]): void;
}
