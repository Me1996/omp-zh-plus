/**
 * Reference document applier: applies TSP frames to a node tree the way the
 * spec says the terminal does (§5.1). Ops are validated and applied one by
 * one; a rejected op is reported and skipped without affecting the rest of
 * the frame. `settle` is recorded as a hint and never restricts later ops.
 *
 * Used by tests, the debug server's `doc` op, and the TSP test harness.
 */
import { type TspFrame, type TspNode } from "@oh-my-pi/pi-wire";
/** One rejected op. */
export interface TspApplyError {
    /** Frame sequence number. */
    s: number;
    /** Op index inside the frame. */
    op: number;
    msg: string;
}
/** A surface document: the root (id = surface id) plus an id index. */
export declare class TspDocument {
    #private;
    readonly surface: string;
    constructor(surface: string);
    /** Currently focused node id. */
    get focus(): string | null;
    get suspended(): boolean;
    /** Ids that received a `settle` hint and no later op. */
    get settled(): ReadonlySet<string>;
    /** Number of nodes, including the root. */
    get size(): number;
    has(id: string): boolean;
    /** `x keep:true`: drop the live-only regions (`dock`, `layer`) and focus; `main` stays. */
    close(): void;
    /** Apply a frame op by op; returns the rejected ops. */
    applyFrame(frame: TspFrame): TspApplyError[];
    /** Snapshot of the whole document (root included) as wire nodes. */
    snapshot(): TspNode;
    /** Snapshot of one subtree, or undefined for an unknown id. */
    get(id: string): TspNode | undefined;
}
