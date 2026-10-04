import { type TspHello } from "./native/encode.js";
export { writeTerminalSequence, writeThroughActiveTerminal } from "./active-terminal.js";
/**
 * Split `data` into chunks whose encoded UTF-8 byte length is no greater than
 * `maxChunkBytes`, preferring a line boundary (`\n`) as the cut point so
 * escape sequences (which never contain `\n`) stay intact. The TUI's
 * full-paint buffers are line-structured (`buffer += "\r\n"` between rows),
 * so a newline almost always exists within the window. The fallback for a
 * buffer with no newline in range is a hard cut at the last UTF-8 code-point
 * boundary that still fits — the ConPTY viewport bug from a single oversized
 * write is strictly worse than a one-frame escape-sequence glitch on a
 * buffer the renderer effectively never produces.
 *
 * UTF-16 code units are walked manually rather than measuring with
 * `Buffer.byteLength` per slice candidate: each code unit's UTF-8 width is
 * known from its value (BMP `<0x80` → 1, `<0x800` → 2, surrogate pair → 4
 * bytes across two units, other BMP → 3), and surrogate pairs are kept
 * together so the chunker never splits a non-BMP character.
 *
 * Exported for unit testing of the chunking contract; `#safeWrite` is the
 * sole production caller.
 */
export declare function chunkForConPTY(data: string, maxChunkBytes?: number): string[];
/**
 * Backlog at or below which stdout is healthy again: the pump has kept up, the
 * TUI resumes composing frames, and a {@link StdoutStallWatchdog} episode ends.
 * The TUI render gate (`TUI.#MAX_PENDING_OUTPUT_BYTES`) is this same value, so
 * the watchdog stays armed across the entire range where frames are deferred —
 * otherwise a consumer that wedges between this level and the arm cap is never
 * re-sampled and the session freezes instead of disconnecting (#10434 review).
 */
export declare const STDOUT_BACKLOG_CLEAR_BYTES: number;
/**
 * Bounds a never-draining stdout backlog without killing a single large but
 * actively-draining frame.
 *
 * `process.stdout.write()` returns `false` once its buffer exceeds the stream
 * high-water mark, and the off-thread pump's `pending()` climbs the same way;
 * a stalled-but-alive PTY reader never throws, so the byte count is the only
 * signal that output is going nowhere. Tripping on the instantaneous count
 * alone is wrong: a legitimate oversized frame (a resume repaint of dozens of
 * inline screenshots, #10430) briefly exceeds the cap and then drains.
 *
 * An episode starts when the backlog first exceeds `armBytes` and lasts until
 * it drains back to `clearBytes` (healthy). The backlog can fall below
 * `armBytes` while still unhealthy, so the episode must outlive that dip
 * (#10434): during it the watchdog declares the terminal disconnected only when
 * the backlog makes no drain progress (no new low-water mark) for `stallMs` —
 * a draining terminal keeps lowering the mark and never trips, while a wedged
 * one (#6854) still tears down within the window.
 *
 * Exported for unit testing; `ProcessTerminal` is the sole production user.
 */
export declare class StdoutStallWatchdog {
    #private;
    private readonly armBytes;
    private readonly clearBytes;
    private readonly stallMs;
    constructor(armBytes?: number, clearBytes?: number, stallMs?: number);
    /** True while an episode is active and the backlog must be polled to completion. */
    get armed(): boolean;
    /**
     * Feed the current pending-byte count and clock reading. Returns true once an
     * armed episode has gone `stallMs` with no drain progress, at which point the
     * caller treats the terminal as disconnected.
     */
    sample(pending: number, nowMs: number): boolean;
    /** Episode ended (drained) or terminal torn down: stop watching. */
    reset(): void;
}
/** Record alternate-screen state (called by the TUI on `?1049h`/`?1049l` writes). */
export declare function setAltScreenActive(active: boolean): void;
/**
 * Emergency terminal restore - call this from signal/crash handlers
 * Resets terminal state without requiring access to the ProcessTerminal instance
 */
export declare function emergencyTerminalRestore(): void;
/** Terminal-reported appearance (dark/light mode). */
export type TerminalAppearance = "dark" | "light";
/** Options for {@link Terminal.start}. */
export interface TerminalStartOptions {
    /**
     * Paint-only start: skip raw mode, stdin ownership, and every probe that
     * elicits a response on stdin. The host tty keeps cooked-mode line editing
     * (kernel echo lands at the hardware cursor), and typed bytes stay queued
     * in the kernel until {@link Terminal.enableInput} takes ownership and
     * replays them through `onInput`. Used for the startup prepaint so typing
     * echoes even while module loading blocks the event loop.
     */
    deferInput?: boolean;
    /**
     * Reports whether the event loop is stalled or just recovered from a
     * stall. Once the terminal confirms bracketed paste, an unmarked multiline
     * burst is an input-method commit (IME, dictation) delivered as one paste
     * on a responsive loop, but keystrokes a stall batched into one read —
     * replayed as keys so Enter submits — while this returns true. Without a
     * probe every such burst is treated as an input-method commit.
     */
    isLoopStalled?: () => boolean;
}
/** Identity of an accepted explicit terminal appearance refresh request. */
export type TerminalAppearanceRequestToken = number;
/**
 * Fired once per DEC private mode when DECRQM support resolves.
 * `confirmed` is false when only the DA1 sentinel arrived.
 * `status` is the DECRPM value (0 unrecognized, 1/2 set/reset, 3 permanently
 * set, 4 permanently reset) when the terminal answered DECRQM.
 */
export type PrivateModeReportHandler = (mode: number, supported: boolean, confirmed?: boolean, status?: number) => void;
/**
 * Fired once when the Glyph Protocol handshake resolves. `supported` is true
 * only after the bundled icons were written and the terminal confirmed (via a
 * `q` coverage query) that a registered codepoint is served from its
 * glossary, so a host can safely repaint — or switch to the nerd preset.
 */
export type GlyphProtocolReportHandler = (supported: boolean) => void;
/**
 * Outcome of the Tern Surface Protocol `hello` probe: the terminal's reply,
 * or null when it answered the DA1 sentinel first (no TSP) or the probe was
 * skipped (`PI_TUI_NATIVE=0`, multiplexers).
 */
export type TspHelloHandler = (hello: TspHello | null) => void;
/**
 * Cursor shapes addressable via DECSCUSR (`CSI <n> SP q`). `"default"` (0) hands the shape back to
 * the terminal's own configuration, which is what teardown restores rather than guessing a shape
 * the user never chose.
 */
export type CursorShape = "default" | "block" | "underline" | "bar";
export declare const CURSOR_SHAPE_CODES: Record<CursorShape, number>;
export interface Terminal {
    start(onInput: (data: string) => void, onResize: () => void, onDisconnect?: () => void, options?: TerminalStartOptions): void;
    /**
     * Take ownership of stdin after a `deferInput` start: enable raw mode,
     * attach input handlers, and run the capability probes start() skipped.
     * Bytes the user typed in cooked mode meanwhile are replayed through
     * `onInput`. No-op when input was never deferred. Optional so custom
     * Terminals built against older pi-tui versions keep working.
     */
    enableInput?(): void;
    stop(): void;
    /**
     * Drain stdin before exiting to prevent Kitty key release events from
     * leaking to the parent shell over slow SSH connections.
     * @param maxMs - Maximum time to drain (default: 1000ms)
     * @param idleMs - Exit early if no input arrives within this time (default: 50ms)
     */
    drainInput(maxMs?: number, idleMs?: number): Promise<void>;
    write(data: string): void;
    get columns(): number;
    get rows(): number;
    /**
     * Output bytes accepted but not yet delivered to the terminal, when the
     * implementation can report it. The renderer skips composing new frames
     * while this backlog is deep, so a slow terminal receives only fresh
     * frames instead of a queue of stale ones. Optional so custom Terminals
     * built against older pi-tui versions keep working.
     */
    readonly pendingOutputBytes?: number;
    /**
     * Whether a pseudoconsole host owns the grid this terminal writes to, so
     * neither the cursor nor the painted rows survive a resize under the
     * application's own model. Measured on Windows conhost: resizing the
     * pseudoconsole makes it re-emit its whole viewport from `CSI H` with
     * absolute addressing while the application writes nothing, and it re-homes
     * the cursor, so a DSR reply after a resize reports column 1 instead of the
     * column the application parked. The renderer's resize anchor recovery needs
     * both properties, so it takes the rebuild path instead when this is set.
     * Optional so custom Terminals built against older pi-tui versions keep
     * working; absent means the terminal itself owns the grid.
     */
    readonly hostOwnsGridOnResize?: boolean;
    get kittyProtocolActive(): boolean;
    get kittyEnableSequence(): string | null;
    readonly keyboardEnhancementEnterSequence?: string | null;
    readonly keyboardEnhancementExitSequence?: string | null;
    moveBy(lines: number): void;
    hideCursor(force?: boolean): void;
    showCursor(force?: boolean): void;
    setCursorShape?(shape: CursorShape): void;
    clearLine(): void;
    clearFromCursor(): void;
    clearScreen(): void;
    setTitle(title: string): void;
    setProgress(active: boolean): void;
    /**
     * Register a callback for terminal appearance (dark/light) changes.
     * Detection uses OSC 11 background color query with Mode 2031 as a change trigger.
     * Fires when the detected appearance changes, including the initial detection.
     * Subscribers registered after detection are invoked immediately with the
     * already-detected appearance so late subscribers never miss it.
     */
    onAppearanceChange(callback: (appearance: TerminalAppearance, requestToken?: TerminalAppearanceRequestToken) => void): void;
    /**
     * Register a callback fired for every valid OSC 11 appearance report,
     * including reports whose classification matches the current appearance.
     * Unlike onAppearanceChange, this does not replay an earlier report.
     * Optional so custom Terminals built against older pi-tui versions keep working.
     */
    onAppearanceReport?(callback: (appearance: TerminalAppearance, requestToken?: TerminalAppearanceRequestToken) => void): (() => void) | void;
    /**
     * Start a bounded OSC 11 background-color refresh cycle, driving appearance
     * callbacks through the same parse/dedup pipeline used at startup and on Mode
     * 2031 notifications. Direct terminals need one query; tmux needs a
     * passthrough query to update its cache followed by one delayed direct cache
     * read. Invoked on the user's explicit display-reset gesture so terminals
     * without end-to-end Mode 2031 notifications pick up a light/dark switch
     * without a restart. No periodic probes are armed.
     *
     * A caller-provided token must be propagated unchanged to callbacks and
     * returned when the request is accepted. This lets callers establish ownership
     * before implementations synchronously dispatch a cached response. Optional so
     * custom Terminals built against older pi-tui versions keep working.
     */
    refreshAppearance?(requestToken?: TerminalAppearanceRequestToken): TerminalAppearanceRequestToken | void;
    /** The last detected terminal appearance, or undefined if not yet known. */
    get appearance(): TerminalAppearance | undefined;
    /**
     * Register a callback fired once per DEC private mode when its DECRQM support
     * status resolves. `confirmed` is false when the terminal answered the DA1
     * sentinel without answering DECRQM, which proves only that querying support
     * is unavailable — not that the private mode itself is unsupported.
     * `status` is the DECRPM value when the terminal answered DECRQM.
     */
    onPrivateModeReport?(callback: PrivateModeReportHandler): void;
    /**
     * Register a callback fired once the startup Glyph Protocol handshake
     * resolves (see {@link GlyphProtocolReportHandler}). A subscriber that
     * arrives after the handshake already resolved is called immediately with
     * the stored outcome. Optional so custom Terminals built against older
     * pi-tui versions keep working.
     */
    onGlyphProtocolReport?(callback: GlyphProtocolReportHandler): void;
    /**
     * Register a callback fired once the Tern Surface Protocol `hello` probe
     * resolves (see {@link TspHelloHandler}); a resolved outcome is replayed to
     * late subscribers. TSP events arriving afterwards are delivered through
     * `onInput` as complete `ESC _ tsp;e;… ESC \` strings. Optional so custom
     * Terminals built against older pi-tui versions keep working.
     */
    onTspHello?(callback: TspHelloHandler): void;
    /** True while the `hello` probe awaits its reply or DA1 sentinel. */
    readonly tspProbePending?: boolean;
    /**
     * The environment names a Tern Surface Protocol terminal
     * (`TERM_PROGRAM=tern`) and the `hello` probe will run: the TUI takes input
     * at start and opens its surface before the reply, which then confirms or
     * revokes it.
     */
    readonly tspExpected?: boolean;
}
/**
 * True when stdout flows through a ConPTY pseudo-console (native win32, or
 * Linux running under WSL where stdout still crosses into ConPTY at the
 * `wslhost` boundary). ConPTY hosts share the per-WriteFile viewport-tracking
 * quirks documented above and on {@link MAX_CONPTY_WRITE_CHUNK_BYTES}, so both
 * `#safeWrite` and the renderer's post-big-paint settle gate hang off this
 * single predicate.
 */
export declare function isConPTYHosted(): boolean;
/** Construction-time overrides for {@link ProcessTerminal}. */
export interface ProcessTerminalOptions {
    /**
     * Force ConPTY-hosted behavior on or off. Defaults to live detection via
     * {@link isConPTYHosted}. Tests set this so the kitty-flag, write-chunking
     * and resize-routing ({@link Terminal.hostOwnsGridOnResize}) paths stay
     * hermetic regardless of the ambient WSL env (`WSL_DISTRO_NAME` /
     * `WSL_INTEROP`) — the suite must behave identically on WSL and on CI.
     */
    conpty?: boolean;
    /**
     * Whether stdin is a native Windows console handle (win32, not WSL), whose
     * console host answers `CSI ? 9001 h` with win32-input-mode key records.
     * Defaults to `process.platform === "win32"`; only consulted when `conpty`
     * is also true.
     */
    nativeWindowsConsole?: boolean;
}
/**
 * Real terminal using process.stdin/stdout
 */
export declare class ProcessTerminal implements Terminal {
    #private;
    constructor(options?: ProcessTerminalOptions);
    get kittyProtocolActive(): boolean;
    get kittyEnableSequence(): string | null;
    get keyboardEnhancementEnterSequence(): string | null;
    get keyboardEnhancementExitSequence(): string | null;
    get appearance(): TerminalAppearance | undefined;
    onAppearanceChange(callback: (appearance: TerminalAppearance, requestToken?: TerminalAppearanceRequestToken) => void): void;
    onAppearanceReport(callback: (appearance: TerminalAppearance, requestToken?: TerminalAppearanceRequestToken) => void): () => void;
    /**
     * Re-query the terminal background through the startup DA1-sentinel FIFO,
     * pending/queued gating, parsing, dedup, and appearance callbacks. Inside
     * tmux, only this explicit path first passes an OSC 11 query to the outer
     * terminal, waits briefly for tmux to consume the response into its cache,
     * then reads that cache with a direct query. The outer query deliberately has
     * no DA1 sentinel: multiplexers can decode a fragmented DA1 response as a key
     * sequence and leak the remaining bytes into the editor. Startup and Mode 2031
     * probes remain direct. Suppressed while inactive, headless, or after teardown.
     */
    refreshAppearance(requestToken?: TerminalAppearanceRequestToken): TerminalAppearanceRequestToken | void;
    onPrivateModeReport(callback: PrivateModeReportHandler): void;
    onGlyphProtocolReport(callback: GlyphProtocolReportHandler): void;
    onTspHello(callback: TspHelloHandler): void;
    get tspProbePending(): boolean;
    get tspExpected(): boolean;
    start(onInput: (data: string) => void, onResize: () => void, onDisconnect?: () => void, options?: TerminalStartOptions): void;
    enableInput(): void;
    drainInput(maxMs?: number, idleMs?: number): Promise<void>;
    stop(): void;
    write(data: string): void;
    get columns(): number;
    /**
     * With the output pump, a backlog bound at or below
     * {@link STDOUT_BACKLOG_CLEAR_BYTES} is reported as-is instead of re-read:
     * both consumers (the render gate and the stall watchdog) act only on a
     * backlog above that level, so the bound already decides them and spares a
     * native read on every frame.
     */
    get pendingOutputBytes(): number;
    get hostOwnsGridOnResize(): boolean;
    get rows(): number;
    moveBy(lines: number): void;
    hideCursor(force?: boolean): void;
    showCursor(force?: boolean): void;
    /**
     * Set the hardware cursor shape (DECSCUSR). Deduped against the last shape written so a
     * per-keystroke mode indicator does not add a sequence to every frame; {@link stop} restores
     * `"default"` so the user's own cursor configuration survives exit.
     */
    setCursorShape(shape: CursorShape): void;
    clearLine(): void;
    clearFromCursor(): void;
    clearScreen(): void;
    setTitle(title: string): void;
    setProgress(active: boolean): void;
}
