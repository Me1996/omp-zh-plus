import { type Api, type Model } from "@oh-my-pi/pi-ai";
import type { ModelRegistry } from "../config/model-registry.js";
import type { Settings } from "../config/settings.js";
/**
 * Generate a title for a session based on the first user message.
 *
 * @param firstMessage The first user message
 * @param registry Model registry
 * @param settings Settings used to resolve the smol role
 * @param sessionId Optional session id for sticky API key selection
 * @param currentModel Current model (used to derive title model)
 * @param metadataResolver Optional resolver evaluated after credential selection
 *   to produce request metadata (e.g. user_id for session attribution). Using a
 *   resolver instead of a pre-evaluated value ensures the metadata's account_uuid
 *   reflects the credential actually selected for this request.
 * @param customSystemPrompt Optional title-specific system prompt override
 * @param signal Session-lifecycle cancellation for background title requests
 * @param credentialSourceSessionId Optional foreground session whose selected
 *   OAuth credential should seed an isolated title-request session.
 */
export declare function generateSessionTitle(firstMessage: string, registry: ModelRegistry, settings: Settings, sessionId?: string, currentModel?: Model<Api>, metadataResolver?: (provider: string) => Record<string, unknown> | undefined, customSystemPrompt?: string, signal?: AbortSignal, credentialSourceSessionId?: string): Promise<string | null>;
export declare function generateTitleOnline(firstMessage: string, registry: ModelRegistry, settings: Settings, sessionId?: string, currentModel?: Model<Api>, metadataResolver?: (provider: string) => Record<string, unknown> | undefined, signal?: AbortSignal, customSystemPrompt?: string, credentialSourceSessionId?: string): Promise<string | null>;
export declare function formatSessionTerminalTitle(sessionName: string | undefined, cwd?: string): string;
/**
 * Set the terminal title through the native Win32 API or OSC 0.
 *
 * Repeating the same sanitized title is a no-op on every platform.
 */
export declare function setTerminalTitle(title: string): void;
export declare function setSessionTerminalTitle(sessionName: string | undefined, cwd?: string): void;
/**
 * Name the live session's file source. Every session title update (start, new
 * session, resume, cwd switch) and {@link reportTernSessionFile} re-read it and,
 * in Tern, report a changed file, so Tern's daemon can relaunch
 * `omp --resume <file>` after it restarts.
 */
export declare function setTerminalSessionFileSource(source: (() => string | undefined) | undefined): void;
/**
 * Tell Tern (`TERM_PROGRAM=tern`, nowhere else) the session file, if it changed,
 * as an OSC 1337 user variable holding its absolute path in base64; no file
 * removes the variable.
 */
export declare function reportTernSessionFile(): void;
/**
 * The branch's pull request number for the native tab title, which carries it
 * after the session name (a TSP terminal has no status strip to show it in).
 */
export declare function setTerminalTitlePullRequest(pr: number | undefined): void;
/**
 * Set a terminal title from an extension's `setTitle()`. Unlike the session base
 * title, this owns the terminal verbatim: periodic and run-state updates will not
 * rewrite it. Cleared when the app next sets an authoritative session title via
 * {@link setSessionTerminalTitle}, or when the extension passes an empty or blank
 * title to release its claim.
 */
export declare function setExtensionTerminalTitle(title: string): void;
export type TerminalTitleState = "idle" | "working" | "attention";
export type TerminalTitleSpinnerStyle = "braille" | "pulse" | "dots" | "line";
/**
 * Working-state spinner frames per `tui.titleSpinner` style. `braille` is the
 * historical default; `pulse` fills and empties a moon; `dots` cycles single
 * braille dots; `line` is plain ASCII (`- \ | /`) for fonts without braille
 * coverage. Every frame is a single column so the separator never reflows the
 * title.
 */
export declare const TERMINAL_TITLE_SPINNER_STYLES: Record<TerminalTitleSpinnerStyle, readonly string[]>;
/**
 * Compose the terminal title from the `π` brand, a state-carrying separator, and
 * the session label. Pure (no I/O) so the state→separator contract is testable:
 *   - `idle` (user's turn):  `π > label`;
 *   - `working`:             `π ⠋ label` (static `π : label` under WSL, or on Windows once the native title path has failed);
 *   - `attention`:           `π ! label`;
 *   - disabled:              `π: label`.
 * Without a label the separator trails the brand (`π >`) so the state stays visible.
 * The `working` separator cycles `TERMINAL_TITLE_SPINNER_STYLES[style]`; `style`
 * defaults to `braille` so existing 5-arg callers keep the historical frames.
 */
export declare function buildTerminalTitleWithState(label: string | undefined, state: TerminalTitleState, frame: number, enabled: boolean, platform?: NodeJS.Platform, style?: TerminalTitleSpinnerStyle, env?: NodeJS.ProcessEnv, nativeTitleFailed?: boolean): string;
/**
 * The tab title while a TSP terminal renders: the session name (`omp` before
 * there is one) and the branch's pull request. The terminal shows run state
 * itself, so there is no brand or state separator.
 */
export declare function buildNativeTerminalTitle(sessionName: string | undefined, pullRequest: number | undefined): string;
/**
 * Reflect the agent run state in the terminal title's separator: `working`
 * animates (static `:` under WSL), `idle` shows `>` (your turn), and
 * `attention` shows `!` (agent blocked on you). Gated off by `tui.titleState`.
 */
export declare function setTerminalTitleState(state: TerminalTitleState): void;
/** Enable/disable the run-state separator (driven by the `tui.titleState` setting). */
export declare function setTerminalTitleStateEnabled(enabled: boolean): void;
/**
 * Select the working-state spinner glyph set (driven by `tui.titleSpinner`).
 * Unknown values fall back to `braille`; switching style resets the frame so a
 * shorter set never indexes out of range, and re-arms the live interval when
 * `working` so the tick cadence stays on the new frames.
 */
export declare function setTerminalTitleSpinnerStyle(style: string | undefined): void;
/**
 * Take ownership of the terminal title: the counterpart to
 * {@link disposeTerminalTitleState}, called once when the UI claims the terminal.
 * This is the ONLY release of the teardown latch. Routine updates — session
 * rename, cwd change, focus swap, collab host state — must not release it: they
 * can arrive from an async transition that resumes after teardown already handed
 * the tab back to the shell.
 */
export declare function initTerminalTitleState(): void;
/**
 * Stop the spinner timer and latch the runtime off; call on session/UI teardown.
 * The latch is the load-bearing half: `shutdown()` disposes and restores the shell
 * title BEFORE it unsubscribes the session, so a live `#handleAgentStart` in that
 * window would otherwise re-arm the spinner and write `π ⠋ …` into the parent
 * shell's tab. Released only by {@link initTerminalTitleState}.
 */
export declare function disposeTerminalTitleState(): void;
/**
 * Save the current terminal title on terminals that support xterm window ops.
 */
export declare function pushTerminalTitle(): void;
/**
 * Restore the previously saved terminal title on terminals that support xterm window ops.
 */
export declare function popTerminalTitle(): void;
