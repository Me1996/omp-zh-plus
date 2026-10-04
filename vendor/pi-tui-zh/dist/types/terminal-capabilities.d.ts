import type { HangulCompatibilityJamoWidth } from "./utils.js";
export * from "./terminal-multiplexer.js";
export { isInsideTmux, wrapTmuxPassthrough } from "./tmux.js";
export declare enum ImageProtocol {
    Kitty = "\u001B_G",
    Iterm2 = "\u001B]1337;File=",
    Sixel = "\u001BPq"
}
export declare enum NotifyProtocol {
    Bell = "\u0007",
    Osc99 = "\u001B]99;;",
    Osc9 = "\u001B]9;"
}
export type TerminalId = "kitty" | "ghostty" | "wezterm" | "iterm2" | "vscode" | "alacritty" | "warp" | "orca" | "otty" | "rio" | "tern" | "monstar" | "base" | "trueColor";
/** Terminal capability details used for rendering and protocol selection. */
export declare class TerminalInfo {
    readonly id: TerminalId;
    readonly imageProtocol: ImageProtocol | null;
    readonly trueColor: boolean;
    readonly hyperlinks: boolean;
    readonly notifyProtocol: NotifyProtocol;
    readonly deccara: boolean;
    readonly supportsScreenToScrollback: boolean;
    /** Renders the Kitty OSC 66 text-sizing protocol (scaled spans). Kitty only. */
    readonly supportsTextSizing: boolean;
    /**
     * Hangul Compatibility Jamo (U+3131..=U+318E) cell width. Ghostty and Orca follow
     * UAX#11 (2 cells); Warp paints 1; "platform" keeps the OS default
     * (macOS narrow, otherwise UAX#11).
     */
    readonly hangulJamoWidth: HangulCompatibilityJamoWidth;
    constructor(id: TerminalId, imageProtocol: ImageProtocol | null, trueColor: boolean, hyperlinks: boolean, notifyProtocol?: NotifyProtocol, deccara?: boolean, supportsScreenToScrollback?: boolean, 
    /** Renders the Kitty OSC 66 text-sizing protocol (scaled spans). Kitty only. */
    supportsTextSizing?: boolean, 
    /**
     * Hangul Compatibility Jamo (U+3131..=U+318E) cell width. Ghostty and Orca follow
     * UAX#11 (2 cells); Warp paints 1; "platform" keeps the OS default
     * (macOS narrow, otherwise UAX#11).
     */
    hangulJamoWidth?: HangulCompatibilityJamoWidth);
    /**
     * Mutable clone for the {@link TERMINAL} singleton: copies every field and
     * keeps the prototype methods, so the builder and runtime setters flip
     * runtime-resolved {@link RuntimeTerminal} capabilities in place instead of
     * reconstructing positional constructor args.
     */
    clone(): RuntimeTerminal;
    /**
     * Whether an image marker begins at `start`. Kept as the shared primitive
     * for both standalone image checks and the renderer's combined ANSI/width
     * scan, so their protocol windows and sixel grammar cannot drift.
     */
    hasImageMarkerAt(line: string, start: number): boolean;
    isImageLine(line: string): boolean;
    formatNotification(message: string | TerminalNotification): string;
    sendNotification(message: string | TerminalNotification): void;
}
/**
 * Whether the agent process is running inside a Zellij session. Read fresh on
 * each call (like {@link isInsideTmux}) so a session attached/detached mid-run
 * is observed and tests can toggle `Bun.env.ZELLIJ` per case.
 */
export declare function isInsideZellij(env?: NodeJS.ProcessEnv): boolean;
/**
 * Whether the agent process runs in an SSH session, so the terminal emulator
 * is remote and host-local input/keyboard modes cannot be assumed.
 */
export declare function isSshSession(env?: NodeJS.ProcessEnv): boolean;
export declare function isNotificationSuppressed(): boolean;
/**
 * Whether `PI_FORCE_IMAGE_PROTOCOL` pins the image protocol, including its
 * `off`/`none` kill switch. A runtime capability probe must not override an
 * explicit user choice: a forced protocol is already applied to {@link TERMINAL},
 * and a forced "off" leaves `imageProtocol` null on purpose.
 */
export declare function isImageProtocolForced(): boolean;
/**
 * Returns true when running in Windows Terminal with known SIXEL support.
 *
 * Windows Terminal introduced SIXEL support in preview 1.22.
 */
export declare function isWindowsTerminalPreviewSixelSupported(env?: NodeJS.ProcessEnv, platform?: NodeJS.Platform): boolean;
/**
 * Resolve an explicit user override for DEC 2026 synchronized output. Returns
 * `false` for an opt-out, `true` for a force-on, or `null` when the user has
 * expressed no preference. Shared by the static default and the runtime DECRQM
 * probe so both honor the same precedence — an opt-out beats a force-on.
 */
export declare function synchronizedOutputUserOverride(env?: NodeJS.ProcessEnv): boolean | null;
/**
 * Whether DEC 2026 synchronized-output wrappers should be enabled by default.
 *
 * Policy (highest precedence first):
 *   1. Explicit user override (`PI_NO_SYNC_OUTPUT`/`PI_TUI_SYNC_OUTPUT=0` off,
 *      `PI_FORCE_SYNC_OUTPUT=1`/`PI_TUI_SYNC_OUTPUT=1` on).
 *   2. Positive `TERM_FEATURES` advertisement (`Sy`) — survives SSH/mux wrapping.
 *   3. Windows Terminal (1.24+) via `WT_SESSION`, on native win32 and the
 *      WSL/SSH-fronted host alike.
 *   4. Herdr panes. Herdr is otherwise treated as a multiplexer so leaked
 *      kitty/ghostty identities cannot enable placeholder graphics, but its
 *      pane VTE is libghostty and already suppresses compositing while DEC 2026
 *      is set. Leaving sync off lets CUP-diff paints and split write(2) chunks
 *      composite as dirty-row patches — the live viewport tears, with the top
 *      frozen while only the bottom refreshes.
 *   5. Known direct terminals with confirmed support. SSH does *not* disable —
 *      DEC 2026 passes through SSH when the outer terminal honors it.
 *   6. Everything else starts off, including risky multiplexers; the runtime
 *      DECRQM probe upgrades any of them when the terminal actually reports
 *      `?2026` supported (current zellij, tmux master, foot, contour, mintty…).
 */
export declare function shouldEnableSynchronizedOutputByDefault(env?: NodeJS.ProcessEnv, terminalId?: TerminalId): boolean;
/**
 * Whether the terminal applies Kitty-style DECCARA rectangular SGR changes
 * (`CSI Pt ; Pl ; Pb ; Pr ; <sgr> $ r`) extended to background color, so large
 * filled regions can be painted as rectangles instead of background-padded
 * strings on every row.
 *
 * Verified against terminal sources rather than terminfo, because a bare
 * `Cara`/DECCARA terminfo capability does not imply the Kitty SGR-background
 * extension:
 * - Kitty implements it for *all* SGR attributes including background (see
 *   kitty `docs/deccara.rst` and the `test_deccara` parser test).
 * - Ghostty does NOT: its `CSI $ r` dispatch falls through to an "unknown CSI"
 *   warning and DECCARA/DECSACE are tracked as unsupported
 *   (ghostty-org/ghostty#632). Enabling it there would silently drop panel
 *   backgrounds, so ghostty stays on the padded-string fallback.
 *
 * Disabled under tmux/screen/zellij multiplexers — screen-coordinate rectangle
 * protocols are not safe to assume through a multiplexer — and via the
 * `PI_NO_DECCARA` kill switch. Pure helper for tests and `TERMINAL` construction.
 */
export declare function detectRectangularSgrSupport(terminalId: TerminalId, env?: NodeJS.ProcessEnv): boolean;
/**
 * Whether the terminal implements colon-subparameter SGR styled underlines —
 * `CSI 4 : 3 m` (curly) plus `CSI 58` / `CSI 59` underline color — as opposed to
 * only the legacy `CSI 4 m` / `CSI 24 m` on/off underline.
 *
 * This is an underline-style capability, not a color depth, so it is keyed on
 * the detected terminal, never on `TERM`/`COLORTERM`. kitty, Ghostty, WezTerm,
 * and iTerm2 (>= 3.5) implement the full pair. Apple Terminal does NOT: it
 * renders `CSI 4 : 0 m` (the reset half) as a solid black background that
 * persists to end of line, and ignores SGR 58/59 — so it, along with every
 * other unproven terminal, gets the flat underline instead. Disabled under any
 * multiplexer: GNU screen and older tmux drop colon-form SGR, and the outer
 * terminal's id leaks into the session env, so a proven id is not proof the
 * bytes survive — the same reason DECCARA and synchronized output gate on it.
 */
export declare function detectStyledUnderlineSupport(terminalId: TerminalId, env?: NodeJS.ProcessEnv): boolean;
/**
 * Resolve an explicit user override for OSC 8 hyperlinks. Returns `false` for
 * an opt-out, `true` for a force-on, or `null` when the user has expressed no
 * preference. Opt-out beats force-on so a kill switch is unambiguous, mirroring
 * {@link synchronizedOutputUserOverride}.
 */
export declare function hyperlinksUserOverride(env?: NodeJS.ProcessEnv): boolean | null;
/**
 * Whether OSC 8 hyperlinks should be enabled by default.
 *
 * Policy (highest precedence first):
 *   1. Explicit user override (`PI_NO_HYPERLINKS=1` off, `PI_FORCE_HYPERLINKS=1`
 *      on). Opt-out wins ties.
 *   2. Herdr pane with no nested screen/tmux: on. Herdr hides the outer
 *      terminal (`TERM=xterm-256color`, no `TERM_PROGRAM`), but it renders
 *      OSC 8 in its own grid and opens links itself on Ctrl+click, so the
 *      outer terminal's support does not matter.
 *   3. Static terminal capability — terminals whose {@link TerminalInfo} marks
 *      `hyperlinks: false` (e.g. `base`) stay off unless the user forced on.
 *   4. GNU screen's explicit session marker (`STY`) always off, even if tmux is
 *      also present: a screen layer anywhere in the path cannot forward OSC 8.
 *   5. tmux session (`TMUX` set): enabled when tmux self-reports >= 3.4 via
 *      `TERM_PROGRAM_VERSION` (tmux 3.4 stores OSC 8 as a cell attribute and
 *      forwards it to outer terminals whose `terminal-features` include
 *      `hyperlinks`). Older or unknown versions stay off; on outer terminals
 *      without the feature configured, tmux silently drops the sequence —
 *      identical to today. Checked before the screen-family TERM heuristic
 *      because tmux's historical `default-terminal` is `screen-256color`, so
 *      `TERM=screen*` inside a tmux session must NOT short-circuit to off.
 *   6. screen-family TERM without `TMUX` always off: screen never gained OSC 8
 *      support.
 *   7. tmux-family TERM without `TMUX` env — unusual (e.g. inspection scripts);
 *      no version available, so off.
 *   8. Otherwise honor the static terminal capability.
 */
export declare function shouldEnableHyperlinksByDefault(env?: NodeJS.ProcessEnv, terminalId?: TerminalId): boolean;
/**
 * Warp implements the Kitty graphics protocol only on macOS/Linux; its Windows
 * build (including Warp-hosted WSL shells) renders the same APC sequences as
 * visible garbage. Keep platform/env injectable so the carve-out is testable
 * without mutating `process.platform`.
 */
export declare function resolveWarpImageProtocol(platform?: NodeJS.Platform, env?: NodeJS.ProcessEnv): ImageProtocol | null;
/**
 * Paseo (getpaseo/paseo) hardcodes `TERM_PROGRAM=kitty` into every PTY
 * (`buildTerminalEnvironment`) while its xterm.js renderer implements neither
 * Kitty graphics nor Unicode placeholders — trusting the advertisement turns
 * image previews into literal PUA garbage (getpaseo/paseo#3850). Paseo
 * injects `PASEO_TERMINAL_ID` into every terminal it hosts, which makes a
 * reliable embedder signal.
 */
export declare function isPaseoEmbedder(env?: NodeJS.ProcessEnv): boolean;
/**
 * Resolve the image protocol for a non-forced runtime: static per-terminal
 * support (with Warp's platform carve-out), then the multiplexer fallback,
 * then host carve-outs. `isTTY` is injectable because the fallback only fires
 * on a real TTY — a piped subprocess cannot exercise that path, so regression
 * tests call this directly.
 */
export declare function resolveImageProtocol(terminalId: TerminalId, env?: NodeJS.ProcessEnv, isTTY?: boolean): ImageProtocol | null;
/** Resolve terminal identity from environment markers used by common emulators. */
export declare function detectTerminalId(env?: NodeJS.ProcessEnv): TerminalId;
export declare const TERMINAL_ID: TerminalId;
/**
 * The process-wide {@link TERMINAL} singleton: a {@link TerminalInfo} whose
 * post-construction capabilities — the image protocol and the probe-driven
 * flags — are writable, so the runtime setters and tests mutate them directly
 * instead of through an unsound cast. Every other field stays readonly.
 */
export interface RuntimeTerminal extends TerminalInfo {
    imageProtocol: ImageProtocol | null;
    hyperlinks: boolean;
    deccara: boolean;
    supportsScreenToScrollback: boolean;
    /** Whether OSC 66 text sizing is currently enabled. */
    textSizing: boolean;
    /** Whether the terminal implements colon-subparameter styled underlines (curly + colored). */
    styledUnderlines: boolean;
    /**
     * Whether the terminal answered the Glyph Protocol support query with a
     * `glyf`-capable reply and the bundled icons have been registered. Probe-
     * driven: false until {@link ProcessTerminal} resolves it.
     */
    glyphProtocol: boolean;
}
export declare const TERMINAL: RuntimeTerminal;
/**
 * Override terminal image protocol at runtime after capability probes complete.
 */
export declare function setTerminalImageProtocol(imageProtocol: ImageProtocol | null): void;
/**
 * Override DECCARA rectangular-SGR capability at runtime. Used by tests to
 * exercise the optimizer and fallback paths deterministically — the default is
 * resolved once at import and force-disabled under the test runtime.
 */
export declare function setTerminalDeccara(enabled: boolean): void;
/** Record the Glyph Protocol probe result (called by ProcessTerminal). */
export declare function setTerminalGlyphProtocol(supported: boolean): void;
/** Override screen-to-scrollback clear support for targeted renderer tests. */
export declare function setTerminalScreenToScrollback(enabled: boolean): void;
/**
 * Enable/disable OSC 66 text-sizing at runtime. The coding-agent calls this from
 * the `tui.textSizing` setting (gated on the terminal's static `supportsTextSizing`
 * capability); tests flip it directly to exercise the scaled-heading path.
 */
export declare function setTerminalTextSizing(enabled: boolean): void;
/**
 * Override OSC 8 hyperlink capability at runtime. The coding-agent calls this
 * from the `tui.hyperlinks` setting so its resolved policy (`off`/`auto`/`always`)
 * drives every renderer that gates on {@link TERMINAL}`.hyperlinks` — notably the
 * Markdown component's `[text](url)`/bare-URL links — consistently with the
 * path/resource links that already consult the setting directly. Tests flip it
 * to exercise the OSC 8 and plain-text paths deterministically.
 */
export declare function setTerminalHyperlinks(enabled: boolean): void;
export declare function getTerminalInfo(terminalId: TerminalId, platform?: NodeJS.Platform, env?: NodeJS.ProcessEnv): TerminalInfo;
export interface CellDimensions {
    widthPx: number;
    heightPx: number;
}
export interface ImageDimensions {
    widthPx: number;
    heightPx: number;
}
export interface ImageRenderOptions {
    maxWidthCells?: number;
    maxHeightCells?: number;
    preserveAspectRatio?: boolean;
    /**
     * Stable Kitty image id (`i=`). When set, the image is displayed via a
     * transmit-once + placement scheme keyed off this id instead of re-sending the
     * base64 each frame.
     */
    imageId?: number;
    /** Stable Kitty placement id (`p=`); defaults to {@link imageId}. */
    placementId?: number;
    /** When true (Kitty + {@link imageId}), also return the one-time transmit sequence. */
    includeTransmit?: boolean;
}
export declare function getCellDimensions(): CellDimensions;
export declare function setCellDimensions(dims: CellDimensions): void;
/** Transmit-and-display (`a=T`) — the self-contained form used when no stable id is available. */
export declare function encodeKitty(base64Data: string, options?: {
    columns?: number;
    rows?: number;
    imageId?: number;
}): string;
/**
 * Transmit image data only (`a=t`), keyed by `imageId`, without displaying it.
 * Sent once per image; the data then persists in the terminal's store (it
 * survives scroll-off and text clears for images with a non-zero id), so
 * subsequent frames display it with the tiny {@link encodeKittyPlacement}
 * sequence instead of re-sending the base64.
 */
export declare function encodeKittyTransmit(base64Data: string, imageId: number): string;
/**
 * Display a previously transmitted image (`a=p`) at the cursor. `C=1` keeps
 * the terminal cursor anchored at the placement origin so the renderer's
 * explicit cursor movement remains the only row accounting. Carrying a stable
 * `placementId` (`p=`) means re-emitting the sequence on a repaint *replaces*
 * the existing placement (moving/resizing it without flicker) rather than
 * stacking a duplicate.
 */
export declare function encodeKittyPlacement(options: {
    imageId: number;
    placementId?: number;
    columns?: number;
    rows?: number;
}): string;
export interface ParsedKittyPlacementLine {
    imageId: number;
    placementId: number | undefined;
    columns: number;
    rows: number;
}
/**
 * Parse a frame line that consists solely of a Kitty direct placement (the
 * last line of an {@link Image} block). Returns null for anything else —
 * placeholder grids, tmux-wrapped placements, sixel/iTerm2 payloads — so
 * callers fall back to writing the line verbatim.
 */
export declare function parseKittyDirectPlacementLine(line: string): ParsedKittyPlacementLine | null;
/**
 * Rebuild an {@link Image} direct-placement line for the viewport row it is
 * written at. The component-rendered line encodes `CUU(rows-1)`, which clamps
 * at the viewport top once the block's leading rows have scrolled out — the
 * placement then re-anchors the full image shifted down over foreign rows.
 * Anchor at the block's first *visible* row instead, clipping the source
 * rectangle (`y=`/`h=`, image pixels) to the visible bottom slice.
 */
export declare function encodeKittyPlacementLine(options: {
    imageId: number;
    placementId: number;
    columns: number;
    /** Total cell rows of the image block. */
    rows: number;
    /** Viewport row the block's last line is being written at. */
    screenRow: number;
    /** Source image height in pixels, for the clipped source rectangle. */
    imageHeightPx: number;
}): string;
/**
 * Kitty graphics delete command for a single image id. Uses `d=I` (capital)
 * which removes the image and every one of its placements — on screen *and* in
 * scrollback — and frees the backing data. `q=2` suppresses the terminal reply.
 * Text-clearing escapes (`CSI 2 J` / `CSI 3 J`) do not remove Kitty graphics, so
 * this is the only way to actually purge a placed image.
 */
export declare function encodeKittyDeleteImage(imageId: number): string;
/**
 * Delete every Kitty image and placement in the terminal. Used only by an
 * explicit destructive display reset: text erases leave untracked placements
 * painted, so per-image bookkeeping cannot guarantee a clean viewport.
 */
export declare function encodeKittyDeleteAllImages(): string;
/**
 * Delete a single placement of an image (`d=i`, lowercase): removes its cells
 * and registry entry but keeps the transmitted data, so a later `a=p` under a
 * fresh placement id needs no retransmit. Used to clear stale placement-epoch
 * entries after a destructive history clear.
 */
export declare function encodeKittyDeletePlacement(imageId: number, placementId: number): string;
export declare function encodeITerm2(base64Data: string, options?: {
    width?: number | string;
    height?: number | string;
    name?: string;
    preserveAspectRatio?: boolean;
    inline?: boolean;
}): string;
export declare function calculateImageRows(imageDimensions: ImageDimensions, targetWidthCells: number, cellDimensions?: CellDimensions): number;
export declare function getPngDimensions(base64Data: string): ImageDimensions | null;
export declare function getJpegDimensions(base64Data: string): ImageDimensions | null;
export declare function getGifDimensions(base64Data: string): ImageDimensions | null;
export declare function getWebpDimensions(base64Data: string): ImageDimensions | null;
export declare function getImageDimensions(base64Data: string, mimeType: string): ImageDimensions | null;
export declare function renderImage(base64Data: string, imageDimensions: ImageDimensions, options?: ImageRenderOptions): {
    sequence?: string;
    lines?: string[];
    rows: number;
    transmit?: string;
} | null;
export declare function imageFallback(mimeType: string, dimensions?: ImageDimensions, filename?: string): string;
/**
 * Structured terminal notification. Rich fields are honored only by OSC 99
 * (Kitty) once support is confirmed; other protocols and the unconfirmed Kitty
 * path collapse to a single `title: body` line.
 */
export interface TerminalNotification {
    title?: string;
    body?: string;
    id?: string;
    type?: string | string[];
    urgency?: "low" | "normal" | "critical";
    iconName?: string;
    sound?: "silent" | "system" | "info" | "warning" | "error" | "question";
    actions?: "focus" | "report" | "focus-report" | "none";
    expiresMs?: number;
}
/** Record the OSC 99 capability-probe result (called by ProcessTerminal). */
export declare function setOsc99Supported(supported: boolean): void;
/** True when OSC 99 structured notifications have been confirmed available. */
export declare function isOsc99Supported(): boolean;
