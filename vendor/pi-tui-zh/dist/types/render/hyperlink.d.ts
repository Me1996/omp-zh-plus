import type { TspSpan } from "@oh-my-pi/pi-wire";
import { type TerminalId } from "../terminal-capabilities.js";
/**
 * Build the OSC 8 target for a file path on `terminalId`.
 *
 * A `file:` URI handed to an editor has to be a plain path. `Paths.get(URI)`
 * rejects one carrying a query or a fragment outright — `IllegalArgumentException:
 * URI has a query component` / `URI has a fragment component` — so appending
 * `?line=` made every JVM-based language server (Kotlin LSP, Eclipse JDT LS)
 * fail *every* request for the resulting document, and VS Code reads the query
 * as part of the resource identity rather than as a cursor position: a blank
 * editor tab that navigates nowhere and persists across window reloads (#12109).
 *
 * The VS Code family instead navigates the documented
 * `vscode://file/<path>:<line>:<col>` form. Everywhere else the plain `file:`
 * URI is right, with the location left in the visible text — terminals that
 * parse a `path:line:col` suffix resolve that on their own.
 */
export declare function fileUriForTerminal(filePath: string, opts: {
    line?: number;
    col?: number;
} | undefined, terminalId: TerminalId): string;
/**
 * Returns true when OSC 8 hyperlinks should be emitted.
 *
 * Respects `tui.hyperlinks` setting:
 * - `"off"`: never
 * - `"auto"`: when `process.stdout.isTTY`, `NO_COLOR` is unset, and the detected terminal reports hyperlink support
 * - `"always"`: unconditionally (useful for viewers that support OSC 8 without advertising it)
 * Uses the last policy pushed by the host, defaulting to `"auto"`.
 */
export declare function isHyperlinkEnabled(): boolean;
/**
 * Push the resolved `tui.hyperlinks` policy into {@link TERMINAL}.hyperlinks, the
 * effective flag that pi-tui renderers gating on it directly — the Markdown
 * component's `[text](url)`/bare-URL links and the status-line PR link — consult.
 *
 * Detection stays immutable in {@link DETECTED_TERMINAL_HYPERLINKS}, so this only
 * ever writes the effective decision; `auto` transitions restore real detection
 * via {@link isHyperlinkEnabled}. Called at TUI startup and whenever the setting
 * changes at runtime.
 * Accepts the raw (unvalidated) setting value; anything but a known mode falls
 * back to the last policy pushed by the host.
 */
export declare function applyHyperlinkSetting(mode?: unknown): void;
/**
 * Wrap `displayText` in an OSC 8 hyperlink pointing at `uri`.
 *
 * Returns `displayText` unchanged when hyperlinks are disabled, `uri` contains
 * terminal control bytes, or `displayText` already contains an OSC 8 sequence.
 */
export declare function uriHyperlink(uri: string, displayText: string): string;
/**
 * Wrap `displayText` in an OSC 8 hyperlink pointing at an HTTP(S) URL.
 * `www.example.com` inputs are linked as `https://www.example.com`.
 */
export declare function urlHyperlink(url: string, displayText: string): string;
/**
 * Wrap `displayText` in an OSC 8 hyperlink pointing at an HTTP(S) URL,
 * bypassing terminal capability auto-detection. Used for auth prompts where
 * an inert "click" label blocks login on terminals whose capabilities are
 * not advertised. Still returns plain text when the host has explicitly opted
 * out by pushing the `"off"` policy.
 */
export declare function urlHyperlinkAlways(url: string, displayText: string): string;
/**
 * A native link span to an HTTP(S) URL (`www.` inputs become `https://`).
 * Unlike the OSC 8 wrappers this ignores terminal capability detection — a
 * TSP terminal always handles `href` — but honours an explicit `off` policy.
 * Non-HTTP(S) or unparsable URLs yield a plain span.
 */
export declare function urlLinkSpan(target: string, displayText: string, s?: string): TspSpan;
/**
 * A native link span to a filesystem path as a plain `file://` URI (the
 * terminal opens it through the system; the location stays in the visible
 * text). Honours an explicit `off` policy.
 */
export declare function fileLinkSpan(filePath: string, displayText: string, s?: string): TspSpan;
/**
 * Wrap `displayText` in an OSC 8 hyperlink pointing at a filesystem path.
 *
 * Returns `displayText` unchanged when hyperlinks are disabled or when
 * the text already contains an OSC 8 sequence (prevents double-wrapping).
 * Relative paths resolve against the current working directory before URI
 * encoding so the OSC 8 target is always a valid `file://` URL.
 *
 * @param filePath - Filesystem path
 * @param displayText - Text to render as the hyperlink anchor (may contain ANSI codes)
 * @param opts - Optional line/col position appended as `?line=N&col=M` query params
 */
export declare function fileHyperlink(filePath: string, displayText: string, opts?: {
    line?: number;
    col?: number;
}): string;
