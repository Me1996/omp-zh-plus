import { type Component, Container, type HistoryBatch } from "../tui.js";
import type { NativeNode } from "../native/node.js";
/** Shared animation time supplied by the constrained transcript root. */
export interface AnimationFrame {
    readonly tick: number;
    readonly now: number;
}
/** Lets an active block adapt its presentation to its allocated viewport rows. */
export interface TranscriptPresentationTarget {
    setTranscriptAllocation?(rows: number, frame: AnimationFrame): void;
}
/** Presentation declaration captured permanently when a block is added. */
export type TranscriptBlockMode = "mutable" | "appendOnly";
/** Immutable width-independent identity for one stable semantic row. */
export interface TranscriptStableRow {
    readonly key: string;
}
/**
 * Explicit semantic-row contract for a block whose stable head may enter native
 * history before finalization. Every later array must extend the prior keys
 * exactly; each row renderer is deterministic for its width.
 * A publication that breaks these invariants (e.g. a mid-stream theme change
 * re-coloring already-emitted bytes) freezes further stable-row emission for
 * that block instead of failing the render — see {@link TranscriptContainer}.
 */
export interface AppendOnlyTranscriptBlock {
    readonly transcriptBlockMode: "appendOnly";
    getTranscriptStableRows(): readonly TranscriptStableRow[];
    /**
     * Render the first `count` semantic rows at the requested current width.
     * Counts are monotonic identities, not physical row counts; this output must
     * prefix the block's full render at the same width.
     */
    renderTranscriptStableRows(count: number, width: number): readonly string[];
    /**
     * Discard every published stable row so the block re-renders its head from
     * scratch. Called only alongside a destructive display reset (e.g. a
     * thinking-visibility toggle) that clears the native scrollback those rows
     * occupied — the sole context in which the append-only "published bytes never
     * change" contract may be retracted. Optional: blocks whose stable-row
     * presentation never changes may omit it.
     */
    resetTranscriptStableRows?(): void;
}
/**
 * Block lifecycle:
 * - `active`: still mutating; renders live and counts against tool admission.
 * - `settled`: finalized but retained in the mutable viewport until pressure.
 * - `committed`: logically retired; replay never rewinds this state.
 */
type BlockState = "active" | "settled" | "committed";
/** Whether `prefix` matches `rows` byte-for-byte from the top. */
export declare function isRowPrefix(prefix: readonly string[], rows: readonly string[]): boolean;
/** Strip leading/trailing all-blank rows; the viewport allocator measures blocks by this trimmed height. */
export declare function trimBlankEdges(rows: readonly string[]): readonly string[];
/** One live block's row span in the last `renderViewport` output (half-open `[start, end)`). */
export interface TranscriptViewportSpan {
    component: Component;
    start: number;
    end: number;
}
/** Owns transcript order, live capacity, and ordered immutable retirement. */
export declare class TranscriptContainer extends Container {
    #private;
    addChild(component: Component): void;
    removeChild(component: Component): void;
    clear(): void;
    setToolActivityVisible(visible: boolean): void;
    /**
     * Forget the append-only emission ledger — emitted counts, published stable
     * rows, per-width render cache, and freeze state — for every block, and ask
     * each append-only block to drop its own published rows. The next replay then
     * re-renders each block from its current {@link Component.render}, applying a
     * changed presentation (e.g. a thinking-visibility toggle) to rows that were
     * already emitted as stable heads while streaming (#10177).
     *
     * Callers MUST pair this with a scrollback-clearing {@link resetDisplay}: the
     * emitted rows it forgets still sit in native history until that clear
     * rewrites them, so unpaired use would duplicate them on the next retirement.
     */
    resetStableEmission(): void;
    /** Whether a transient block may be discarded without leaving tape history. */
    canRemoveBlock(component: Component): boolean;
    /**
     * Whether a superseded snapshot block (a repeated `wait` poll) may be
     * replaced by its successor. Beyond {@link canRemoveBlock}, a block directly
     * above a usage row stays: that row describes the turn the block belongs to,
     * and removing the block would leave a usage-only turn (#12248).
     */
    canDisplaceBlock(component: Component): boolean;
    /** Lifecycle state per block in transcript order (diagnostics and tests). */
    blockStates(): readonly BlockState[];
    /** Permanently captured presentation mode per block (diagnostics and tests). */
    blockModes(): readonly TranscriptBlockMode[];
    /** Emitted stable semantic-row counts in transcript order. */
    emittedStableRows(): readonly number[];
    /** Whether visible active capacity and live-block memory permit another admission. */
    canAdmit(rows: number): boolean;
    /** Prepares one atomic replay of the committed ledger and an emitted active-head prefix. */
    beginReplay(): void;
    /**
     * Drop a not-yet-offered replay so a shutdown flush emits only un-retired
     * rows. The terminal already holds the committed ledger; re-streaming it at
     * quit is pure write volume. An already offered replay batch stays valid.
     */
    cancelReplay(): void;
    /**
     * Open one composed frame: every live-block measurement until this frame's
     * {@link renderViewport} returns renders against `frame` and is taken once,
     * so the retirement peek and the viewport share each block's render.
     *
     * Callers MUST call {@link renderViewport} with the same `frame` in the same
     * synchronous composition, without mutating any transcript block in
     * between: the shared rows are only as fresh as that first measurement.
     */
    beginFrame(frame: AnimationFrame): void;
    /**
     * Total rows the live, un-emitted tail occupies at `width`.
     *
     * `limit` stops the walk once the total passes it: measuring a resumed
     * session's whole ledger costs one full render per block, and callers only
     * compare the height against a viewport budget. Past `limit` the result is
     * a lower bound, guaranteed only to be greater than `limit`.
     */
    liveRowCount(width: number, limit?: number): number;
    /** Block spans of the last `renderViewport` output, in output coordinates. Empty when the tail is empty. */
    getLastViewportSpans(): readonly TranscriptViewportSpan[];
    /**
     * Render the live tail, constrained to the supplied transcript height.
     * Closes the frame {@link beginFrame} opened; a different `frame` discards
     * its measurements first.
     */
    renderViewport(width: number, rows: number, frame: AnimationFrame): readonly string[];
    /** Offers stable-head emission or the shortest finalized prefix needed under pressure. */
    peekFinalizedBatch(width: number, capacity: number): HistoryBatch | undefined;
    /** Returns only a prepared complete replay, never a normal retirement offer. */
    peekReplayBatch(width: number): HistoryBatch | undefined;
    /** Offers the complete currently eligible prefix for graceful shutdown. */
    peekFlushBatch(width: number): HistoryBatch | undefined;
    /** Recompose the unacknowledged batch so a discarded TUI frame can be rendered again. */
    rerenderOfferedBatch(width: number): HistoryBatch | undefined;
    /** Acknowledges exactly the most recently offered append, commit, or replay transaction. */
    acknowledgeFinalizedBatch(id: number): void;
    /**
     * Render only the trailing `maxRows` semantic rows, walking blocks bottom-up.
     * Used by the transient resize-buffer repaint, which needs one viewport of
     * tail rows per resize event — never the full committed ledger.
     */
    renderTail(width: number, maxRows: number): readonly string[];
    /**
     * The transcript's blocks for a native (TSP) surface, one component per
     * `main` child in transcript order; ids follow component identity, so
     * inserts, removals (rewind, displacement) and reorders become targeted ops.
     * Finalized blocks are settled as a hint; they stay editable, so a later
     * expansion, late result or reaction still reaches them wherever they sit.
     * No retirement happens on this path: the whole transcript is one document.
     * Returns the same array while the block list is unchanged.
     */
    nativeBlocks(): readonly Component[];
    /** Embedded as a child (transcript viewers): a stack of the {@link nativeBlocks}. */
    describe(): NativeNode;
    /** Full semantic render used by exports and non-terminal commands. */
    render(width: number): readonly string[];
    /** Rendered row where a child's block begins in the last full render() (transcript deep-links). */
    getChildStartRow(child: Component): number | undefined;
}
/** Groups sibling rows into one conservative mutable semantic transcript block. */
export declare class TranscriptBlock extends Container {
}
export {};
