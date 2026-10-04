import { type ImageDimensions } from "../terminal-capabilities.js";
import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
export interface ImageTheme {
    fallbackColor: (str: string) => string;
}
export interface ImageOptions {
    maxWidthCells?: number;
    maxHeightCells?: number;
    filename?: string;
    /** Shared budget that caps how many inline images render as live graphics. */
    budget?: ImageBudget;
    /**
     * Stable identity for the underlying image (e.g. `toolCallId:index`). Lets the
     * budget hand back the same graphics id across component re-creations so a
     * repaint replaces the placement instead of stacking a duplicate.
     */
    imageKey?: string;
}
/** Default count of inline images kept as live graphics before older ones fall back to text. */
export declare const DEFAULT_MAX_INLINE_IMAGES = 8;
/**
 * Bounds how many inline images render as live terminal graphics at once.
 *
 * Terminal graphics protocols — Kitty especially — keep every transmitted image
 * in a per-screen store and re-draw placements as content scrolls; placements
 * that left the viewport survive text-clear escapes (`CSI 2 J`). Unbounded, a
 * session that shows many images piles up placements plus store memory and
 * leaves ghosts in scrollback.
 *
 * The budget keeps the most recent `cap` images live and demotes older ones to
 * their text fallback. Demotion needs a full redraw (so off-screen rows are
 * rewritten) plus an explicit graphics purge of the demoted ids. {@link Image}
 * reports display order via {@link observe}; when that reveals a stricter split,
 * the TUI repeats the pass before emitting its terminal frame.
 * Retired frames no longer observe their images, so the resident store is also
 * bounded across passes. Evicting retired graphics removes their scrollback
 * placements; a later replay can render or demote those images again.
 *
 * `cap` bounds one surface's live images, not the terminal's whole store. A
 * fullscreen overlay's frame and the normal screen standing behind it are both
 * on the terminal, and neither may delete the other's graphics — see
 * {@link limitResidentImages} — so while a modal is up the store legitimately
 * holds up to `cap` per surface. Read `cap` as "how many images one frame shows
 * as graphics", not as a hard residency ceiling.
 *
 * `cap <= 0` disables budgeting: every image stays a live graphic.
 */
export declare class ImageBudget {
    #private;
    constructor(cap?: number, requestRender?: () => void);
    get cap(): number;
    get enabled(): boolean;
    setRequestRender(requestRender: () => void): void;
    setCap(cap: number): void;
    /**
     * Stable graphics id for a logical image. A non-empty `key` maps to the same
     * id across re-creations (so repaints replace the placement); a missing key
     * gets a fresh id every call.
     */
    acquireId(key?: string): number;
    /**
     * Start an alternate-buffer lifecycle. Call once per `?1049h`, before the
     * first pass of the fullscreen overlay or resize borrow that owns the buffer.
     *
     * The alt split is a claim about the frame standing on that surface, and
     * `?1049h` hands over a cleared one: the previous occupant's threshold would
     * suppress this buffer's leading images against a frame that no longer
     * exists, painting them as text until a corrective render lands. Passes
     * *within* one lifecycle must keep sharing the split — that is what lets an
     * over-cap discovery pass converge before the frame is emitted.
     */
    beginAltScreenLifecycle(): void;
    /**
     * Begin a render pass. Called by the renderer before composing the frame.
     * Pass `stable: true` for a partial/throwaway pass that does not walk the
     * whole tree in display order (the resize viewport fast path): {@link observe}
     * then replays the last committed per-id decision instead of one derived from
     * call order, and the pass must NOT be closed with {@link endPass}.
     *
     * Pass `altScreen: true` when the frame is painted on the alternate buffer
     * (fullscreen overlay, resize borrow). The pass then reads and writes that
     * surface's own {@link SurfaceSplit} and its live set adds to the recorded
     * normal-screen one instead of replacing it, so a modal's threshold never
     * reaches the transcript standing behind it.
     */
    beginPass(stable?: boolean, altScreen?: boolean): void;
    /**
     * Record an image in display order and report whether it must render its text
     * fallback this frame. Called by every {@link Image} during render — including
     * on a cache hit, so the image keeps its display-order slot.
     *
     * During a `stable` pass ({@link beginPass}) the call order and visible subset
     * are not authoritative, so the decision is the surface's committed
     * on-terminal split, keyed by id — order- and partiality-independent.
     */
    observe(imageId: number): boolean;
    /**
     * End a render pass. Returns true when the pass discovered a stricter budget
     * and must be repeated before its terminal frame is emitted.
     */
    endPass(): boolean;
    /**
     * Bound the terminal's image store to `cap`. Demotion ({@link endPass}) already
     * retires the graphics this frame replaced with text; this sweeps the ones no
     * frame shows any more — images the pass simply stopped observing.
     *
     * Also records what this frame leaves standing on its surface, which is how
     * the next pass on the *other* surface knows what it may not destroy.
     */
    limitResidentImages(): void;
    /**
     * Image ids a destructive reset must delete explicitly, alongside its `d=A`.
     * Emit only from that reset's repaint; clears the queue.
     */
    takeResetPurgeIds(): readonly number[];
    /** Image ids to delete from the terminal this frame; clears the pending set. */
    takePurgeIds(): readonly number[];
    /** All image ids believed to be loaded in any screen's store; clears tracking. */
    takeAllTransmittedIds(): readonly number[];
    /** Whether `imageId`'s data still needs to be transmitted to the surface the in-flight pass paints. */
    shouldTransmit(imageId: number): boolean;
    /**
     * Record a direct-placement image's source pixel geometry so the renderer
     * can clip its placement to the visible slice at write time; cleared when
     * the image is purged from the terminal store.
     */
    registerPlacementGeometry(imageId: number, widthPx: number, heightPx: number): void;
    /**
     * Record this frame's native-scrollback commit target (the frame-row count
     * that is committed once the frame's writes land). Called once per rendered
     * frame — including frames that emit no placements — so an epoch whose rows
     * commit while its line is never rewritten is still flagged before the next
     * re-emission.
     */
    observeCommitWatermark(committedTo: number): void;
    /**
     * End the physical-row coordinate epoch after observing its final commit
     * watermark. Placement ids and latched archive state survive, but attachment
     * rows do not: the next placement emit records them in the new-width frame.
     */
    beginPlacementCoordinateEpoch(): void;
    /**
     * Resolve the placement id and geometry for a direct-placement emit whose
     * topmost attached cell sits at `attachTopFrameRow` — the first frame row
     * the placement covers, i.e. the block's first *visible* row, not its
     * origin (-1 when the writer has no frame-space position: alt-screen,
     * resize, ConPTY-truncated replays). `committedTo` is this frame's commit
     * target in the same frame-row space (-1 when unknown).
     *
     * Invariant: a placement id may be re-used (Kitty replace strips that id's
     * cells everywhere, scrollback included) only while none of the cells it
     * attached have entered native scrollback. The epoch — the `p=` id —
     * advances exactly when the archived flag says otherwise; rewrites with no
     * commit progression keep replacing the same id in place.
     */
    resolvePlacementEmit(imageId: number, attachTopFrameRow: number, committedTo: number): {
        placementId: number;
        widthPx: number;
        heightPx: number;
    } | null;
    /**
     * Restart every placement epoch after a destructive history clear (`CSI 3 J`
     * full paint). The clear destroys all placement cells — scrollback rows are
     * gone and the replay rewrites the viewport — so no archive remains to
     * protect. Reverting to epoch 1 lets the replay recreate every visible
     * placement after the terminal-wide cleanup.
     */
    resetPlacementEpochs(): ReadonlyArray<{
        imageId: number;
        lastEpoch: number;
    }>;
    /**
     * Queue a one-time transmit for `imageId` on the surface the in-flight pass
     * paints. No-op if that surface already holds the data, so a repeated call
     * (e.g. a width-change re-render) never re-sends it.
     */
    enqueueTransmit(imageId: number, sequence: string): void;
    /** Whether the in-flight pass's surface has image data queued but not yet written. */
    hasPendingTransmits(): boolean;
    /**
     * True when the budget has nothing in flight on either surface: no live images
     * observed on the last pass, no queued transmits, no pending purges, and no
     * stricter threshold left to apply. A component-scoped frame may skip the
     * observe pass only then — a partial tree walk would under-count display order.
     */
    get quiescent(): boolean;
    /** Transmit sequences to write before this frame's placements on its surface; clears that queue. */
    takeTransmits(): readonly string[];
    /**
     * Drop the normal screen's transmit tracking so every still-live image
     * re-enqueues its data (`a=t`) on the next render. Recovers when the terminal
     * dropped the original transmit — e.g. Ghostty discarding graphics sent during
     * its post-startup window — where a placement-only replay can never bind a
     * Unicode placeholder. Pair with a component invalidate + forced repaint so
     * the data and placement re-emit together; keeps no base64 in budget state
     * (the transmit-once design).
     */
    forgetTransmitted(): void;
}
export declare class Image implements Component {
    #private;
    constructor(base64Data: string, mimeType: string, theme: ImageTheme, options?: ImageOptions, dimensions?: ImageDimensions);
    /** Return source metadata without exposing the encoded image buffer. */
    debugState(): Record<string, unknown>;
    invalidate(): void;
    /**
     * A native `image` backed by a content-addressed blob; the terminal fits
     * it. Cell caps become `ch`/`lines` bounds. The inline-image budget and
     * graphics protocols do not apply.
     */
    describe(_cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
}
