import type { StatusLineComponent } from "../status-line/component.js";
import type { StatusLineSession } from "../status-line/host.js";
import { type StatusLineStartupData } from "../status-line/startup.js";
import { type Terminal } from "../terminal.js";
import { type Component, type ResizeScrollbackMode, type TerminalFramePlan, type TerminalFrameProvider, TUI, type TUIOptions, type ViewportSize } from "../tui.js";
import type { NativeSurface, NativeSurfaceProvider } from "../native/node.js";
import { CustomEditor } from "./custom-editor.js";
import type { WordCompletionMethod } from "./word-completion.js";
import { WelcomeComponent } from "./welcome.js";
/** Live settings that affect the composer before and after session adoption. */
export interface ComposerPreferences {
    readonly quiet: boolean;
    readonly composerShape: string;
    readonly showHardwareCursor: boolean;
    readonly maxInlineImages: number;
    readonly resizeScrollback: ResizeScrollbackMode;
    readonly imeSafeCursor: boolean;
    readonly autocompleteMaxVisible: number;
    readonly spellingTypoDetection: boolean;
    readonly spellingAutocomplete: WordCompletionMethod;
    readonly spellingAutocorrect: boolean;
}
/** Settings-schema-compatible defaults used when constructing a dependency-free composer. */
export declare const COMPOSER_DEFAULTS: ComposerPreferences;
/** Welcome data that can be supplied initially or patched as startup resolves it. */
export interface ComposerWelcomeUpdate {
    readonly version?: string;
}
/**
 * Status-bar inputs persisted by the last session. The first frame renders
 * them through a startup {@link StatusLineComponent} at the live width until
 * the session-aware status line attaches.
 */
export interface ComposerStatusCache {
    /** ANSI wrapper of the editor border when persisted (session accent or thinking color). */
    readonly borderColor?: {
        readonly prefix: string;
        readonly suffix: string;
    };
    readonly statusLine: StatusLineStartupData;
}
/** Optional dependencies and initial state for a standalone composer. */
export interface ComposerOptions {
    readonly terminal?: Terminal;
    /** Extra TUI construction options (render scheduler injection for tests and `omp render`). */
    readonly tuiOptions?: TUIOptions;
    readonly preferences?: Partial<ComposerPreferences>;
    readonly welcome?: ComposerWelcomeUpdate;
    readonly status?: ComposerStatusCache;
    readonly exit?: (code: number) => void;
    readonly now?: () => number;
}
/** How {@link Composer.setRuntimeChildren} bills below-transcript roots against transcript retirement. */
export interface RuntimeChildrenOptions {
    /**
     * Below-transcript roots whose growth is momentary (inline dialogs, a tall
     * multi-line editor). They are billed at their smallest height so expansion
     * clips the live tail instead of retiring rows a later shrink could not
     * reclaim (#11007). Every other root is billed at its current height, so
     * settled rows it displaces retire to native scrollback. Decision panels
     * declaring `retireDisplacedTranscript` opt out of this floor even when
     * mounted as a child of a transient editor container.
     */
    readonly transient?: readonly Component[];
    /**
     * Dock order on a TSP terminal (no status strip; the composer carries its
     * facts): the native dock stacks HUD pills, the working row and queued messages over
     * the composer in its own order, and may add describe-only roots. Defaults
     * to the roots below the transcript in render order.
     */
    readonly nativeDock?: readonly Component[];
}
/** Controls the first terminal paint for a composer that does not already own the terminal. */
export interface ComposerStartOptions {
    readonly clearScrollback?: boolean;
    readonly playWelcomeIntro?: boolean;
    /**
     * Paint without owning stdin: the tty keeps cooked-mode echo/editing so
     * typing stays visible while startup module loading blocks the event loop.
     * {@link Composer.enableInput} later switches to raw input and replays the
     * kernel-buffered keystrokes into the editor.
     */
    readonly deferInput?: boolean;
}
/** One click target's row span within the mutable viewport (half-open `[start, end)`). */
export interface ViewportClickSpan {
    start: number;
    end: number;
    /** Candidate subagent ids for a span-local row. */
    candidates: (local: number) => string[];
}
/**
 * Row-level click target: maps rendered rows to subagent ids. Implemented by
 * the subagent HUD, whose rows are fixed 1:1 with visible sessions.
 */
export interface ViewportClickRowTarget {
    getClickAgentAtRow(row: number): string | undefined;
}
/**
 * Candidates under a mutable-viewport line: the first span containing it.
 * Pure seam for tests; the caller intersects with the live registry, which
 * decides focusability and recency.
 */
export declare function routeViewportClick(spans: readonly ViewportClickSpan[], index: number): string[];
/**
 * Reserved click-candidate id for the pinned HUD expander row. Checked before
 * any registry lookup: its `@…:…` charset cannot collide with generated agent
 * ids (word names, numeric and `-N` suffixes, dotted nesting).
 */
export declare const PINNED_HUD_TOGGLE_ID = "@omp:toggle-pinned-hud";
/**
 * Canonical interactive composer, usable before session/settings exist and updatable in place.
 * It owns the terminal, welcome header, and editor; InteractiveMode later supplies authoritative
 * data and mounts the session-aware runtime children without replacing the visible header.
 */
export declare class Composer implements TerminalFrameProvider, NativeSurfaceProvider {
    #private;
    readonly ui: TUI;
    constructor(options?: ComposerOptions);
    /**
     * Rows the below-transcript chrome under `root` (editor, status line, …)
     * took in the last frame, so a root that grows upward can cap itself to
     * the screen rows left above them; `undefined` before `root` was laid out.
     */
    rowsBelow(root: Component): number | undefined;
    /**
     * Keep the input on the bottom row while the live rows cannot fill the
     * screen, as after an inline decision panel closes. A tall block that just
     * left the chrome above the editor (a command report) may have scrolled
     * rows into native history that cannot be pulled back; without the pin the
     * editor would jump up to where the shorter frame now ends. The pin lifts
     * once live rows fill the screen again.
     */
    pinInputToBottom(): void;
    /** Compose the bounded mutable viewport and the next ordered history append. */
    renderFrame(viewport: ViewportSize): TerminalFramePlan;
    /**
     * Describe the whole surface for a TSP terminal. `main` is the flowing
     * document: the header (welcome, extras) and every transcript block as its
     * own component child. `dock` is the live chrome below the transcript in
     * render order: pending messages, HUDs, the working row, the editor and the
     * status line. There is no history/viewport split: retirement, resize
     * replay and hover bands are ANSI concerns.
     */
    describeSurface(): NativeSurface;
    /**
     * Candidate subagent ids under a mutable-viewport line, for click-to-focus.
     * Empty when the line has no click target (chrome, separators, retired rows
     * are never in the viewport). Callers intersect with the live registry.
     */
    viewportClickCandidates(index: number): string[];
    /**
     * Point the hover band at a click-candidate id (or clear it). Takes effect
     * on the next frame; callers repaint only when the target actually changes.
     */
    setHoveredClickId(id: string | undefined): void;
    /** Acknowledges one accepted header, replay, or transcript batch. */
    acknowledgeHistory(id: number): void;
    /** Render the semantic transcript tail while the terminal borrows its resize buffer. */
    renderResizeFrame(viewport: ViewportSize): readonly string[];
    /** Replays committed presentation without changing logical retirement state. */
    beginHistoryReplay(): void;
    /** Forces every currently eligible finalized prefix to retire before stop. */
    beginHistoryFlush(): void;
    /** Live editor whose draft survives startup and session adoption. */
    get editor(): CustomEditor;
    /** The welcome component currently mounted in the header, if quiet mode is off. */
    get welcome(): WelcomeComponent | undefined;
    /** Whether this composer already owns the terminal render/input loop. */
    get started(): boolean;
    /** Start terminal ownership and optionally begin the welcome intro. */
    start(options?: ComposerStartOptions): void;
    /** Take raw-input ownership after a deferred-input start. Idempotent. */
    enableInput(): void;
    /** Apply settings changes without replacing the editor or welcome component. */
    setPreferences(update: Partial<ComposerPreferences>): void;
    /** Patch welcome data in place as version, session, and project discovery complete. */
    updateWelcome(update: ComposerWelcomeUpdate): void;
    /** Replace optional header content around the stable welcome scene. */
    setHeaderExtras(before: readonly Component[], after: readonly Component[]): void;
    /** Update the canonical editor reference after InteractiveMode remounts a custom editor. */
    setEditor(editor: CustomEditor): void;
    /**
     * Mount the session-aware status component into the slot below the editor,
     * retiring the startup status line; the caller installs the real top-border
     * provider through its composer-shape sync.
     */
    setStatusComponent<TSession extends StatusLineSession>(component: StatusLineComponent<TSession>): void;
    /** Mount or replace session-aware root children while preserving the header and status hosts. */
    setRuntimeChildren(children: readonly Component[], options?: RuntimeChildrenOptions): void;
    /** Play or replay the welcome intro against the stable header render target. */
    playWelcomeIntro(): void;
    /** Transfer terminal ownership to InteractiveMode without stopping the composer. */
    transfer(): void;
    /** Stop a composer that has not transferred terminal ownership. */
    stop(): void;
}
