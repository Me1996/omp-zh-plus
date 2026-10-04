import { type TspFrame, type TspNode } from "@oh-my-pi/pi-wire";
import type { Terminal } from "../terminal.js";
import type { Component, OverlayOptions, RenderScheduler } from "../tui.js";
import { type TspHello } from "./encode.js";
import type { DescribeContext, NativeSurface } from "./node.js";
/** A visible TUI overlay, bottom to top. */
export interface NativeOverlay {
    readonly component: Component;
    readonly options: OverlayOptions | undefined;
    /** Keyboard focus is inside this overlay. */
    readonly focused: boolean;
}
/** What the backend needs from the TUI. */
export interface NativeHost {
    readonly terminal: Terminal;
    /** `main`/`dock` content: the frame provider's surface, or the TUI children. */
    describeSurface(cx: DescribeContext): NativeSurface;
    /** Visible overlays, bottom to top. */
    overlays(): readonly NativeOverlay[];
    /** Component receiving keyboard input. */
    focused(): Component | null;
    /**
     * The user clicked into a node described by `owners[0]` (then the
     * components containing it, innermost first): move keyboard focus there.
     * `field` is the outermost owner that takes keys and whose focus target is
     * the clicked `editor`/`input`, if any; `sheet` tells the overlays that
     * don't hold the keys while the user works beside them.
     */
    focusFromPointer(owners: readonly Component[], field: Component | null, sheet: (overlay: Component) => boolean): void;
    requestRender(): void;
    /** The terminal switched appearance. */
    appearanceChanged(dark: boolean): void;
    /** Reduce Motion toggled. */
    motionChanged(reduce: boolean): void;
    /** Theme-derived output changed (symbol preset): drop render and describe caches. */
    invalidate(): void;
}
export interface NativeBackendOptions {
    /** Keep the reference document and recent frames for debugging. */
    readonly mirror?: boolean;
    /** Append every TSP message to this JSONL file. Defaults to `PI_TUI_TSP_RECORD`. */
    readonly recordPath?: string;
    /** Log the `rows` fallback count per frame. Defaults to `PI_TUI_NATIVE_STATS=1`. */
    readonly stats?: boolean;
    /** Clock and timers (stall wake-up); defaults to `Date.now` and unref'd `setTimeout`. */
    readonly scheduler?: RenderScheduler;
}
/**
 * The reply a v1 terminal is assumed to give before its real `hello` arrives
 * (the `TERM_PROGRAM=tern` optimistic start): the whole vocabulary, the
 * default APC limit and credits, the terminal's width, the appearance omp
 * already detected, and full motion.
 */
export declare function assumedTspHello(terminal: Terminal): TspHello;
export declare class NativeBackend {
    #private;
    constructor(host: NativeHost, hello: TspHello, options?: NativeBackendOptions);
    /** The terminal's hello reply. */
    get hello(): TspHello;
    /** Describe context shared by every surface. */
    get context(): DescribeContext;
    /** `rows` fallback nodes in the last frame. */
    get fallbackCount(): number;
    /**
     * Open the inline surface and send the first frame. Native rendering is
     * announced only once the surface is open: Tern drops the shell's title
     * when a command's first surface opens, so the tab title set on the change
     * has to follow the `o`.
     */
    start(): void;
    /**
     * Close every surface. The inline transcript stays in scrollback unless
     * `keep` is false (a revoked optimistic start: rows repaint from scratch).
     */
    stop(keep?: boolean): void;
    /**
     * After a stop/start cycle (external editor, suspend): adopt the closed
     * inline surface so the transcript continues in place instead of being
     * printed again. A `gone` reply for it opens a fresh surface.
     */
    resume(hello: TspHello): void;
    /**
     * The terminal's real `hello` reply after an optimistic start: adopt its
     * APC limit, credits, cell size, kinds, appearance and motion preference.
     * A width the terminal already reported in a `resize` event wins over the
     * reply's. A different vocabulary or motion preference re-describes every
     * component, so kinds the terminal lacks fall back.
     */
    confirm(hello: TspHello): void;
    /** SIGWINCH: refresh the width used for `rows` fallback until the terminal reports one. */
    noteTerminalColumns(columns: number): void;
    /** Reconcile and send a frame, unless the target surface is out of credits. */
    render(): void;
    /**
     * Handle one complete `ESC _ tsp;…` input string (events and late replies).
     * Returns false when `sequence` isn't TSP.
     */
    handleInput(sequence: string): boolean;
    /** Reference document of the live surface (mirror mode only). */
    document(): TspNode | undefined;
    /** Last sent frames, oldest first (mirror mode only). */
    recentFrames(count?: number): readonly TspFrame[];
}
