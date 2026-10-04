import type { TspFrame, TspNode, TspText } from "@oh-my-pi/pi-wire";
import { ImageBudget } from "./components/image.js";
import type { DescribeContext, NativeNode, NativeScreen, NativeUiEvent } from "./native/node.js";
import { type Terminal } from "./terminal.js";
import { visibleWidth } from "./utils.js";
/** Full-attribute reset terminating each rendered content row. */
export declare const SEGMENT_RESET = "\u001B[0m";
type InputListenerResult = {
    consume?: boolean;
    data?: string;
} | undefined;
type InputListener = (data: string) => InputListenerResult;
type StartListener = () => void;
export interface RenderTimer {
    cancel(): void;
}
export interface RenderScheduler {
    now(): number;
    scheduleImmediate(callback: () => void): void;
    scheduleRender(callback: () => void, delayMs: number): RenderTimer;
}
/** Rows painted by one TUI frame, observed through `TUIOptions.onPaint`. */
export interface TuiPaint {
    /** Rows committed above the viewport by this paint (native scrollback). Empty on diff paints and alt-screen paints. */
    readonly history: readonly string[];
    /** Complete live viewport after this paint: one prepared (normalized, width-truncated, SGR-coalesced) ANSI string per row. */
    readonly viewport: readonly string[];
    /** True when this paint erased scrollback and repainted from row zero (destructive reset or history replay): consumers drop their history copy before applying `history`. */
    readonly reset: boolean;
    /** True when `viewport` is an alternate-screen overlay; history is untouched. */
    readonly alt: boolean;
    readonly columns: number;
    readonly rows: number;
}
/** Observer of completed terminal paints; see {@link TUI.addPaintListener}. */
export type PaintListener = (paint: TuiPaint) => void;
export interface TUIOptions {
    renderScheduler?: RenderScheduler;
    onPaint?: PaintListener;
}
/** Physical terminal dimensions supplied to a frame provider. */
export interface ViewportSize {
    readonly columns: number;
    readonly rows: number;
}
/** Immutable append or complete replay offered until the terminal accepts this identifier. */
export interface HistoryBatch {
    readonly id: number;
    readonly rows: readonly string[];
    /**
     * `append` (the default) adds finalized or naturally emitted rows. `replay`
     * is the complete logical ledger; the writer bottom-splits it against the
     * leading blank viewport and serializes the remainder plus final viewport in
     * one synchronous terminal write.
     */
    readonly kind?: "append" | "replay";
}
/** One history append or complete replay plus the mutable viewport for a terminal frame. */
export interface TerminalFramePlan {
    readonly history?: HistoryBatch;
    readonly viewport: readonly string[];
}
/** Produces bounded terminal frames and retires acknowledged history batches. */
export interface TerminalFrameProvider {
    renderFrame(viewport: ViewportSize): TerminalFramePlan;
    acknowledgeHistory(id: number): void;
    /** Full semantic viewport used only on the transient resize buffer. */
    renderResizeFrame?(viewport: ViewportSize): readonly string[];
    /** Re-offer finalized history after a display reset or resize replay. */
    beginHistoryReplay?(): void;
    /** Force every currently eligible finalized prefix to retire before stop. */
    beginHistoryFlush?(): void;
}
export interface TUIStartOptions {
    /** Clear saved native scrollback before the first paint. */
    clearScrollback?: boolean;
    /**
     * Paint without owning stdin: the terminal stays in cooked mode (kernel
     * echo + line editing at the hardware cursor) until {@link TUI.enableInput}
     * switches to raw input and replays the kernel-buffered keystrokes.
     */
    deferInput?: boolean;
}
/**
 * Component interface - all components must implement this
 *
 * Render contract: the returned array (and its rows) belongs to the component.
 * Callers MUST NOT mutate it — components are allowed to return a cached array
 * and will return the exact same reference for as long as their rendered
 * content is unchanged. Conversely, a component MUST return a fresh array
 * reference whenever its content changed; reference equality across two
 * render() calls is the engine's proof that the rows are byte-identical
 * (containers memoize their concatenation on it, and the TUI derives the
 * frame's stable prefix from it). A component that mutates a previously
 * returned array in place must implement {@link RenderStablePrefix} to declare
 * which leading rows survived.
 */
export interface Component {
    /** Stable identifier surfaced in the debug tree as kind#id. */
    debugId?: string;
    /** Override for the tree node kind (default: constructor.name). */
    debugKind?: string;
    /** Widget state for the debug `values`/`tree` ops. JSON-serializable. */
    debugState?(): Record<string, unknown>;
    /** Children for the debug tree when not already exposed as a public `children` array. */
    debugChildren?: readonly Component[];
    /**
     * Render the component to an array of physical rows at the given width.
     * The result is component-owned and `readonly` to the caller; an unchanged
     * component may (and should) return the same array reference it returned
     * last time.
     */
    render(width: number): readonly string[];
    /** Inline decision panels must keep displaced settled transcript rows in
     * native scrollback even when mounted inside a transient editor container. */
    readonly retireDisplacedTranscript?: boolean;
    /**
     * Describe the component semantically for a Tern Surface Protocol
     * terminal (see `native/node.ts`). Called instead of `render()` when the
     * native backend is active. Return the same node object while nothing
     * changed; return null to fall back to `render()` rows.
     */
    describe?(cx: DescribeContext): NativeNode | null;
    /**
     * Props for the native `overlay` wrapper when this component is shown as
     * an overlay: the sheet's `role` (Tern styles `omp.overlay.*` roles as
     * glass sheets, so the component's own root must not draw a second frame),
     * `head` spans for the sheet's title row, and `size`/`anchor` overriding
     * the ones derived from the overlay options.
     */
    nativeOverlay?: {
        role?: string;
        head?: TspText;
        size?: "sm" | "md" | "lg" | "full";
        anchor?: "center" | "top" | "bottom";
    };
    /**
     * True when this component, shown as an overlay, describes a data-first
     * sheet (`picker`, `prefs`) that is its own frame: the backend puts it
     * directly in `layer` with no `overlay` wrapper. Usually
     * `cx.supports("picker")`, so older terminals keep the wrapped fallback.
     */
    nativeSheet?(cx: DescribeContext): boolean;
    /**
     * A fullscreen overlay that is a page of its own rather than one block:
     * the regions (and role) of the screen surface it fills, instead of the
     * default lone `main` child. Put the component itself in `dock` to keep
     * its focus target and events.
     */
    describeScreen?(cx: DescribeContext): NativeScreen;
    /** User actions on nodes this component described (toggle, select, activate, custom). */
    handleNativeEvent?(event: NativeUiEvent): void;
    /**
     * Optional handler for keyboard input when component has focus
     */
    handleInput?(data: string): void;
    /**
     * If true, component receives key release events (Kitty protocol).
     * Default is false - release events are filtered out.
     */
    wantsKeyRelease?: boolean;
    /**
     * Optional hook to invalidate any cached rendering state.
     * Called when theme changes or when component needs to re-render from scratch.
     */
    invalidate?(): void;
    /**
     * Optional hook to set whether this component ignores tight layout mode.
     */
    setIgnoreTight?(ignore: boolean): any;
    /**
     * Optional teardown. Called when the component is permanently removed from
     * the live tree (e.g. a transcript reset). Release timers, intervals, and
     * subscriptions here. Must be idempotent. Containers propagate dispose to
     * their children; leaf components without resources may omit it.
     */
    dispose?(): void;
}
/** Lets an overlay root delegate keyboard focus to components it owns. */
export interface OverlayFocusOwner {
    /** Returns true when `component` is a focus target inside this overlay. */
    ownsOverlayFocusTarget(component: Component): boolean;
}
/**
 * Interface for components that can receive focus and display a cursor.
 * When focused, the component should emit CURSOR_MARKER at the cursor position
 * in its render output. TUI will find this marker and position the hardware
 * cursor there for proper IME candidate window positioning.
 *
 * Components that can switch between terminal-cursor and software-cursor
 * rendering expose `setUseTerminalCursor`; TUI keeps that mode in sync with
 * its resolved hardware-cursor preference whenever focus or the preference
 * changes.
 */
export interface Focusable {
    /** Set by TUI when focus changes. Component should emit CURSOR_MARKER when true. */
    focused: boolean;
    /** Set by TUI when hardware cursor rendering is enabled or disabled. */
    setUseTerminalCursor?(useTerminalCursor: boolean): void;
}
/** Options for scheduling a TUI render. */
export interface RenderRequestOptions {
    /** Clear terminal scrollback for intentional transcript replacement. */
    clearScrollback?: boolean;
}
/**
 * Controls how a settled terminal resize refreshes native history.
 *
 * `append` replays the current transcript below retained history, `rebuild`
 * clears history before replaying it, and `preserve` repaints only the viewport.
 */
export type ResizeScrollbackMode = "append" | "rebuild" | "preserve";
/** Type guard to check if a component implements Focusable */
export declare function isFocusable(component: Component | null): component is Component & Focusable;
/**
 * Cursor position marker - APC (Application Program Command) sequence.
 * This is a zero-width escape sequence that terminals ignore.
 * Components emit this at the cursor position when focused.
 * TUI finds and strips this marker, then positions the hardware cursor there.
 */
export declare const CURSOR_MARKER = "\u001B_pi:c\u0007";
export { visibleWidth };
/**
 * Anchor position for overlays
 */
export type OverlayAnchor = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center" | "left-center" | "right-center";
/**
 * Margin configuration for overlays
 */
export interface OverlayMargin {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}
/** Value that can be absolute (number) or percentage (string like "50%") */
export type SizeValue = number | `${number}%`;
/**
 * Options for overlay positioning and sizing.
 * Values can be absolute numbers or percentage strings (e.g., "50%").
 */
export interface OverlayOptions {
    /** Width in columns, or percentage of terminal width (e.g., "50%") */
    width?: SizeValue;
    /** Minimum width in columns */
    minWidth?: number;
    /** Maximum height in rows, or percentage of terminal height (e.g., "50%") */
    maxHeight?: SizeValue;
    /** Anchor point for positioning (default: 'center') */
    anchor?: OverlayAnchor;
    /** Horizontal offset from anchor position (positive = right) */
    offsetX?: number;
    /** Vertical offset from anchor position (positive = down) */
    offsetY?: number;
    /** Row position: absolute number, or percentage (e.g., "25%" = 25% from top) */
    row?: SizeValue;
    /** Column position: absolute number, or percentage (e.g., "50%" = centered horizontally) */
    col?: SizeValue;
    /** Margin from terminal edges. Number applies to all sides. */
    margin?: OverlayMargin | number;
    /**
     * Control overlay visibility based on terminal dimensions.
     * If provided, overlay is only rendered when this returns true.
     * Called each render cycle with current terminal dimensions.
     */
    visible?: (termWidth: number, termHeight: number) => boolean;
    /**
     * Borrow the terminal's alternate screen buffer for this overlay's lifetime
     * (vim/less idiom). While the topmost visible overlay sets this, the engine
     * paints only the modal on the alt screen and emits no ED3 / scrollback
     * bytes, so the transcript on the normal screen stays untouched and is not
     * scrollable behind the modal. Defaults off — all other overlays are
     * unchanged and still draw over the transcript on the normal screen.
     */
    fullscreen?: boolean;
    /**
     * Enable terminal mouse reporting while fullscreen. Defaults on; disable it
     * when native terminal text selection takes precedence over pointer events.
     */
    mouseTracking?: boolean;
}
/**
 * Handle returned by showOverlay for controlling the overlay
 */
export interface OverlayHandle {
    /** Permanently remove the overlay (cannot be shown again) */
    hide(): void;
    /** Temporarily hide or show the overlay */
    setHidden(hidden: boolean): void;
    /** Check if overlay is temporarily hidden */
    isHidden(): boolean;
}
/**
 * Container - a component that contains other components
 */
export declare class Container implements Component {
    #private;
    children: Component[];
    setIgnoreTight(ignore: boolean): this;
    addChild(component: Component): void;
    removeChild(component: Component): void;
    clear(): void;
    /** Dispose every child, then detach it from this container. */
    disposeChildren(): void;
    invalidate(): void;
    /**
     * Propagate teardown to children. Call when the container's children are
     * being permanently discarded (not when they are detached for reuse — use
     * {@link clear} for that). Idempotent per child via each child's own dispose.
     */
    dispose(): void;
    render(width: number): readonly string[];
    describe(_cx: DescribeContext): NativeNode | null;
}
/**
 * Merge runs of byte-adjacent SGR sequences (`CSI [0-9;:]* m`) into one. Only
 * CSI-SGR sequences are touched; text, cursor moves, OSC, hyperlinks and image
 * payloads pass through verbatim. Isolated sequences require no parameter
 * slices or arrays; output is built only at merged boundaries or empty resets
 * that need normalization within an adjacent run.
 */
export declare function coalesceAdjacentSgr(line: string): string;
/**
 * TUI - Main class for managing terminal UI with differential rendering
 */
export declare class TUI extends Container {
    #private;
    terminal: Terminal;
    /** Global callback for debug key (Shift+Ctrl+D). Called before input is forwarded to focused component. */
    onDebug?: () => void;
    overlayStack: {
        component: Component;
        options?: OverlayOptions;
        preFocus: Component | null;
        hidden: boolean;
        /**
         * A sheet the user clicked away from (see {@link TUI.#focusFromPointer}):
         * it stays up but no longer holds the keys, until focus moves back into it.
         */
        released: boolean;
    }[];
    constructor(terminal: Terminal, showHardwareCursor?: boolean, options?: TUIOptions);
    /**
     * Observe completed terminal paints; returns the unsubscribe. Independent
     * observers (live stream publisher, session recorder) coexist.
     */
    addPaintListener(listener: PaintListener): () => void;
    /** Install the product-owned bounded frame provider. */
    setFrameProvider(provider: TerminalFrameProvider | undefined): void;
    get fullRedraws(): number;
    /** Shared budget that caps how many inline images render as live graphics. */
    get imageBudget(): ImageBudget;
    /**
     * Set how many inline images stay live graphics before older ones fall back
     * to text (`0` disables the cap). Older images are hidden via a graphics purge
     * plus a full redraw on the frame after a new image exceeds the cap.
     */
    setMaxInlineImages(cap: number): void;
    /** Return how settled resizes refresh native scrollback. */
    getResizeScrollback(): ResizeScrollbackMode;
    /** Set how settled resizes refresh native scrollback. */
    setResizeScrollback(mode: ResizeScrollbackMode): void;
    /** Delete every tracked Kitty image from the terminal graphics store. */
    clearInlineImages(): void;
    getShowHardwareCursor(): boolean;
    setShowHardwareCursor(enabled: boolean): void;
    /**
     * Whether DEC 2026 synchronized-output wrappers are currently emitted around
     * paints. Starts from conservative terminal/env detection and is reconciled at
     * runtime against the terminal's DECRQM mode-2026 report — enabled on a
     * positive report, disabled on a negative one.
     */
    get synchronizedOutput(): boolean;
    /**
     * Cost in milliseconds of the most recently completed frame.
     *
     * Animation components use this to apply proportional backpressure after
     * their render request is asynchronously composed and written.
     */
    get lastFrameCostMs(): number;
    setFocus(component: Component | null): void;
    /** Component currently receiving keyboard input, if any. */
    getFocused(): Component | null;
    /** Last viewport successfully written by the renderer, for debug inspection. */
    getDebugPaint(): {
        lines: readonly string[];
        windowTop: number;
        altScreen: boolean;
        cursor?: {
            x: number;
            y: number;
            visible?: boolean;
        };
    } | undefined;
    /** Render the current root document at the live terminal width for debug inspection. */
    getDebugDocument(): readonly string[];
    /** Feed debug and test input through the same pipeline as terminal stdin. */
    injectDebugInput(data: string): void;
    /**
     * Show an overlay component with configurable positioning and sizing.
     * Returns a handle to control the overlay's visibility.
     */
    showOverlay(component: Component, options?: OverlayOptions): OverlayHandle;
    /** Hide the topmost overlay and restore previous focus. */
    hideOverlay(): void;
    /** Check if there are any visible overlays */
    hasOverlay(): boolean;
    /**
     * Mutable normal-buffer viewport from the last provider frame: screen row
     * where it begins plus its row count. Inline click targets are indexed
     * into this window (`screenRow - top`). Empty while the alt screen owns
     * the display, while a resize transaction is settling, and while a Ghostty
     * image paint is deferred — the painted rows predate the latest spans in
     * all three cases, so hits would map to unrelated old rows.
     * The origin is in composer rows: a replay paint replaces leading composer
     * blanks with history rows and prepends blanks for a short viewport, so
     * the painted top is backed out by that net pad.
     */
    getMutableViewport(): {
        top: number;
        length: number;
    };
    /**
     * Probe for opt-in normal-buffer click capture. The provider is read every
     * frame; while it returns true (and no fullscreen overlay owns the
     * display) the terminal reports button clicks as SGR events for inline
     * click targets. Native text selection becomes Shift+drag while on.
     */
    setInlineMouseTrackingProvider(provider: (() => boolean) | undefined): void;
    invalidate(): void;
    start(options?: TUIStartOptions): void;
    /** Whether frames go to a Tern Surface Protocol surface instead of the row renderer. */
    get nativeRendering(): boolean;
    /**
     * Close the TSP surfaces ahead of {@link stop}, before the exit drains
     * input: the terminal answers nothing once they are closed, and whatever it
     * already sent (acks, events) is read and dropped here instead of reaching
     * the shell as typed text. A render already requested (the exit's status
     * line) goes out first; none is forced, and nothing renders from now until
     * `stop()`.
     */
    closeNative(): void;
    /** Reference document the TSP terminal should hold (debug mirror only). */
    getNativeDocument(): TspNode | undefined;
    /** Most recent TSP frames sent (debug mirror only). */
    getNativeFrames(count?: number): readonly TspFrame[];
    /** `rows` fallback nodes in the last native frame. */
    get nativeFallbackCount(): number;
    /**
     * Take ownership of stdin after a `deferInput` start: raw mode, input
     * handlers, and the response-eliciting capability probes start() skipped.
     * Keystrokes typed in cooked mode meanwhile arrive through the normal input
     * path. Idempotent; no-op when input was never deferred.
     */
    enableInput(): void;
    addStartListener(listener: StartListener): () => void;
    addInputListener(listener: InputListener): () => void;
    removeInputListener(listener: InputListener): void;
    stop(): void;
    /**
     * Destructive user-gesture reset: invalidate every component, erase native
     * history, then repaint from row zero. Reachable only from explicit gestures (session
     * replace, /tree, an explicit clear) — never from ordinary rendering,
     * animation, resize, or finalization.
     */
    resetDisplay(): void;
    requestRender(force?: boolean, options?: RenderRequestOptions): void;
    /**
     * Paint a forced frame synchronously when startup must hand off an already
     * visible component tree before further async initialization. Same as
     * {@link requestRender} minus the `setImmediate` hop.
     */
    renderNow(options?: RenderRequestOptions): void;
    /**
     * Schedule a render on behalf of `component` after a self-contained change
     * (spinner frame, blink). Frames always compose the bounded viewport from
     * scratch — retired blocks no longer render — so a scoped request is simply
     * an ordinary render.
     */
    requestComponentRender(_component: Component): void;
}
