/**
 * Shared utilities and constants for tool renderers.
 *
 * Provides consistent formatting, truncation, and display patterns across all
 * tool renderers to ensure a unified TUI experience.
 */
import { ThinkingLevel } from "@oh-my-pi/pi-agent-core";
import type { Ellipsis } from "@oh-my-pi/pi-natives";
import type { Theme } from "../theme/theme.js";
import type { Component } from "../tui.js";
export { Ellipsis } from "@oh-my-pi/pi-natives";
export { replaceTabs, truncateToWidth, wrapTextWithAnsi } from "../utils.js";
/** A thinking selector configured as a concrete level or automatic selection. */
export type ConfiguredThinkingLevel = ThinkingLevel | "auto";
/**
 * Normalize stray carriage returns in model-authored display text. Some models
 * (observed with GLM via OpenRouter) degenerate into injecting `\r` runs between
 * words inside JSON string values; CommonMark treats a lone `\r` as a line
 * ending, which splatters the text one word per row. CRLF becomes LF, CR runs
 * collapse to a single space — word separators in prose, one indent unit in
 * mangled code previews.
 */
export declare function sanitizeCarriageReturns(text: string): string;
/**
 * Sanitize raw ask option labels into unique, action-safe display copies.
 * Degenerate input can sanitize alike (`Retry\rnow`/`Retry now`) or match a
 * runtime action row (`Other (type your own)`); both would answer the wrong
 * row, so colliding entries take a numeric suffix. Order and length are
 * preserved, so indices still align with the original labels for mapping
 * answers and dialog state back. Every ask race participant (local dialog,
 * guest selector) must call this with the same `reservedLabels` so a
 * question renders identically wherever it is answered.
 */
export declare function disambiguateDisplayLabels(rawLabels: string[], reservedLabels: readonly string[]): string[];
/** Set the maximum inline image width in terminal columns; zero leaves it uncapped. */
export declare function setInlineImageMaxColumns(maxColumns: number): void;
/** Set the maximum inline image height in terminal rows; zero uses the viewport limit. */
export declare function setInlineImageMaxRows(maxRows: number): void;
/** Resolve inline image dimension caps from the configured limits and viewport. */
export declare function resolveImageOptions(): {
    maxWidthCells: number;
    maxHeightCells?: number;
};
/** Preview limits for collapsed/expanded views */
export declare const PREVIEW_LIMITS: {
    /** Lines shown in collapsed view */
    readonly COLLAPSED_LINES: 3;
    /** Lines shown in expanded view */
    readonly EXPANDED_LINES: 12;
    /** Items (files, results) shown in collapsed view */
    readonly COLLAPSED_ITEMS: 8;
    /** Output preview lines in collapsed view */
    readonly OUTPUT_COLLAPSED: 3;
    /** Output preview lines in expanded view */
    readonly OUTPUT_EXPANDED: 10;
    /** Computer script lines shown in collapsed view */
    readonly COMPUTER_CODE_COLLAPSED: 10;
    /** Max hunks shown when collapsed (edit tool) */
    readonly DIFF_COLLAPSED_HUNKS: 8;
    /** Max diff lines shown when collapsed (edit tool) */
    readonly DIFF_COLLAPSED_LINES: 40;
};
/** Default number of terminal output rows shown before expansion. */
export declare const DEFAULT_TERMINAL_PREVIEW_LINES = 10;
/** Match a Markdown fenced-code opener and capture its indentation and marker. */
export declare const FENCE_RE: RegExp;
/** Shared empty link-target lookup for renderers without interactive links. */
export declare const EMPTY_LINK_TARGETS: ReadonlyMap<string, string>;
/** Default display width reserved for a resolved model badge. */
export declare const FEED_MODEL_BADGE_WIDTH = 30;
/** Set whether feed rows display their resolved model badge. */
export declare function setFeedModelBadgeEnabled(enabled: boolean): void;
/** Return whether resolved model badges are enabled. */
export declare function isFeedModelBadgeEnabled(): boolean;
/** Compact glyph for a configured thinking level; empty for `inherit` (nothing to show). */
export declare function thinkingLevelGlyph(level: ConfiguredThinkingLevel, uiTheme: Theme): string;
/**
 * Compact feed-row prefix: explicit thinking glyph, sanitized model identity,
 * then advisor eye. Keep fitting icons if no model fits; preserve literal identity suffixes.
 */
export declare function formatFeedModelBadge(modelIdentity: string | undefined, thinkingLevel: ConfiguredThinkingLevel | undefined, advisor: boolean | undefined, uiTheme: Theme, maxWidth?: number): string;
/** Truncation lengths for different content types */
export declare const TRUNCATE_LENGTHS: {
    /** Short titles, labels */
    readonly TITLE: 60;
    /** Medium-length content (messages, previews) */
    readonly CONTENT: 80;
    /** Longer content (code, explanations) */
    readonly LONG: 100;
    /** Full line content */
    readonly LINE: 110;
    /** Very short (task previews, badges) */
    readonly SHORT: 40;
    /** Idle recap status line (~40-word LLM reply) */
    readonly RECAP: 280;
};
/** Human-readable primary key bound to tool-output expansion, e.g. `Ctrl+O`. */
export declare function expandKeyHint(): string;
/** Keep both ends of a single-line label without splitting wide characters. */
export declare function truncateMiddleToWidth(text: string, maxWidth: number): string;
/** Select a leading line window and count the lines hidden after it. */
export declare function cappedHeadLines(lines: readonly string[], max: number): {
    lines: readonly string[];
    hidden: number;
};
/** Get the first nonblank preview lines, trimmed and width-capped. */
export declare function getPreviewLines(text: string, maxLines: number, maxLineLen: number, ellipsis?: Ellipsis): string[];
/**
 * Collapse a possibly multi-line string into a single line, then truncate it to
 * `maxWidth` display cells. {@link truncateToWidth} alone caps width but
 * newlines are zero-width, so multi-line content (markdown briefs, tool args,
 * provider errors) would otherwise spill a single status row across several
 * visual lines. Whitespace runs collapse to one space, so tabs are handled too.
 */
export declare function previewLine(text: string, maxWidth: number, ellipsis?: Ellipsis): string;
/**
 * Extract domain from URL, stripping www. prefix.
 */
export declare function getDomain(url: string): string;
export { formatAge, formatBytes, formatCount, formatDuration, formatNumber, pluralize } from "@oh-my-pi/pi-utils";
/**
 * Get the appropriate status icon with color for a given state.
 * Standardizes status icon usage across all renderers.
 */
export declare function formatStatusIcon(status: ToolUIStatus, theme: Theme, spinnerFrame?: number): string;
/**
 * Format the expand hint with proper theming.
 * Returns empty string if already expanded or there is nothing more to show.
 */
export declare function formatExpandHint(theme: Theme, expanded?: boolean, hasMore?: boolean): string;
/**
 * Format a badge like [done] or [failed] with brackets and color.
 */
export declare function formatBadge(label: string, color: ToolUIColor, theme: Theme): string;
/**
 * Build a "more items" suffix line for truncated lists.
 * Uses consistent wording pattern.
 */
export declare function formatMoreItems(remaining: number, itemType: string): string;
/** Tail-window height for collapsed command/code previews. */
export declare function previewWindowRows(): number;
/**
 * Cap a pre-rendered command preview to a viewport-sized tail window: the end
 * of the command stays visible (it is the live edge while args stream) behind
 * an "… N earlier lines" marker on top. The same window applies while
 * streaming and after completion so the block never jumps; only `expanded`
 * (ctrl+o) uncaps it.
 *
 * `prefix` (raw, e.g. a dim tree gutter) is prepended to the marker line so
 * nested previews stay aligned. `expandHint: false` drops the "ctrl+o: Expand"
 * suffix for callers that cap even inside the expanded view (task recent
 * output), where the hint would point the wrong way.
 */
export declare function capPreviewLines(lines: string[], theme: Theme, options?: {
    max?: number;
    expanded?: boolean;
    prefix?: string;
    expandHint?: boolean;
}): string[];
/** Join metadata with the theme separator and muted styling. */
export declare function formatMeta(meta: string[], theme: Theme): string;
/**
 * Split multi-line tool text into TUI-safe display lines.
 * Splits CRLF/LF, collapses stray `\r` progress overwrites to the final
 * segment (mirroring terminal rendering), and expands tabs — so raw
 * subprocess or fetched output (e.g. Windows ssh emitting CRLF, tab-indented
 * web content) can't corrupt the framed block layout with cursor-moving
 * control characters or tab-stop width mismatches.
 */
export declare function sanitizeDisplayLines(text: string): string[];
/** Render a sanitized error message with its status icon. */
export declare function formatErrorMessage(message: string | undefined, theme: Theme): string;
/**
 * Error message rendered as a subordinate detail line beneath a status header
 * that already carries the error icon (e.g. `✘ Write: <path>`). The header's
 * icon already signals failure, so this omits the redundant error symbol and
 * "Error:" prefix that `formatErrorMessage` adds for standalone single-line
 * errors, indenting two columns to sit under the header title instead.
 */
export declare function formatErrorDetail(message: string | undefined, theme: Theme): string;
/** Render a muted empty-state message with a warning icon. */
export declare function formatEmptyMessage(message: string, theme: Theme): string;
/** Marker displayed in the gutter of a code frame. */
export type CodeFrameMarker = "" | " " | "*" | "+" | "-" | ">";
/** Format a code-frame row with a padded line-number gutter. */
export declare function formatCodeFrameLine(marker: CodeFrameMarker, lineNumber: string | number, content: string, lineNumberWidth: number): string;
/** Status states supported by shared tool renderer icons. */
export type ToolUIStatus = "success" | "done" | "error" | "warning" | "info" | "pending" | "running" | "aborted";
/** Semantic foreground colors used by tool renderer labels. */
export type ToolUIColor = "success" | "error" | "warning" | "accent" | "muted";
/** Presentation options for a tool title. */
export interface ToolUITitleOptions {
    bold?: boolean;
}
/** Render a themed tool title with optional bold emphasis. */
export declare function formatTitle(label: string, theme: Theme, options?: ToolUITitleOptions): string;
/** Parsed diagnostic location, severity, and optional source and code metadata. */
export interface ParsedDiagnostic {
    filePath: string;
    line: number;
    col: number;
    severity: "error" | "warning" | "info" | "hint";
    source?: string;
    message: string;
    code?: string;
}
/** Expand tabs in diagnostic text for terminal display. */
export declare function sanitizeDiagnosticDisplayText(text: string): string;
/** Parse a diagnostic location and message, including optional source and code. */
export declare function parseDiagnosticMessage(msg: string): ParsedDiagnostic | null;
/** Render diagnostic summaries and optionally expanded messages. */
export declare function formatDiagnostics(diag: {
    errored: boolean;
    summary: string;
    messages: string[];
}, expanded: boolean, theme: Theme, getLangIcon: (filePath: string) => string, options?: {
    title?: string;
}): string;
/** Added and removed line counts and hunk metadata for a diff. */
export interface DiffStats {
    added: number;
    removed: number;
    hunks: number;
    lines: number;
}
/** Count added lines, removed lines, and hunks in a unified diff. */
export declare function getDiffStats(diffText: string): DiffStats;
/** Render a compact themed summary of diff counts. */
export declare function formatDiffStats(added: number, removed: number, hunks: number, theme: Theme): string;
/** Truncate a unified diff at hunk boundaries within the supplied preview limits. */
export declare function truncateDiffByHunk(diffText: string, maxHunks: number, maxLines: number, options?: {
    fromTail?: boolean;
}): {
    text: string;
    hiddenHunks: number;
    hiddenLines: number;
};
/** Replace a leading home directory with a portable tilde prefix. */
export declare function shortenPath(filePath: unknown, homeDir?: string): string;
/** Shorten embedded home paths; normalize Windows separators unless the caller preserves native error text. */
export declare function shortenEmbeddedPaths(text: string, homeDir?: string, preserveSeparators?: boolean): string;
/**
 * Shorten filesystem and command arguments without rewriting literal search patterns. A producer that
 * names no argument key gets the general embedded-path shortening.
 */
export declare function shortenToolArgumentPaths(text: string, key: string | undefined, homeDir?: string): string;
/** Sanitize warning text before showing it in TUI, including embedded home paths. */
export declare function sanitizeDisplayWarning(text: string): string;
/** Sanitize and bound warning text before showing it in TUI. */
export declare function sanitizeDisplayWarnings(warnings: readonly string[]): string[];
/** Format a tool working directory when it differs from the project directory. */
export declare function formatToolWorkingDirectory(workdir: string | undefined, projectDir: string): string | undefined;
/** Wrap text in the theme-specific bracket pair. */
export declare function wrapBrackets(text: string, theme: Theme): string;
/** Maximum number of parse errors displayed in expanded details. */
export declare const PARSE_ERRORS_LIMIT = 20;
/** Deduplicate parse errors while preserving their original order. */
export declare function dedupeParseErrors(errors: string[] | undefined): string[];
/** Format deduplicated parse errors with a bounded detail list. */
export declare function formatParseErrors(errors: string[], total?: number): string[];
/**
 * Cap an upstream parse-error list to {@link PARSE_ERRORS_LIMIT} unique entries,
 * preserving the original deduplicated total. Use this at the source so tool
 * details never carry thousands of per-file parse errors into traces or
 * renderers.
 */
export declare function capParseErrors(errors: string[] | undefined, limit?: number): {
    errors: string[];
    total: number;
};
/**
 * Standard width+expand keyed render cache used by every search-style tool
 * renderer. `compute` re-runs only when the cache key changes; the returned
 * Component is the canonical `{ render, invalidate }` pair.
 */
export declare function createCachedComponent(getExpanded: () => boolean, compute: (width: number, expanded: boolean) => string[], options?: {
    paddingX?: number;
}): Component;
/**
 * Single-slot memo for an expensive rendered string (syntax highlighting, diff
 * coloring) keyed by the exact inputs that shape the bytes: theme instance,
 * expanded state, a caller-chosen salt (path/language), and the source content.
 * Field-wise comparison instead of a concatenated key string: a cache hit costs
 * one string value-compare (engines short-circuit on length) and a miss never
 * allocates a key. Comparing the {@link Theme} by reference is sound because
 * theme switches replace the instance wholesale (`setTheme`/`previewTheme`/
 * `setSymbolPreset` in pi-tui theme/theme.ts) — themes are never mutated in
 * place.
 */
export interface RenderedStringCache {
    theme: Theme | null;
    expanded: boolean;
    salt: string;
    content: string;
    value: string;
}
/** Create an empty memo for rendered tool strings. */
export declare function createRenderedStringCache(): RenderedStringCache;
/** Drop the memo so the next lookup re-renders (e.g. the render function identity changed). */
export declare function invalidateRenderedStringCache(cache: RenderedStringCache): void;
/** Reuse a rendered string while its theme, expansion, content, and salt match. */
export declare function cachedRenderedString(cache: RenderedStringCache | undefined, theme: Theme, expanded: boolean, salt: string, content: string, render: () => string): string;
/**
 * Append the indented bullet list of parse errors (capped at
 * {@link PARSE_ERRORS_LIMIT}) to `lines`, with an overflow summary line if the
 * total exceeds the cap. No-op when `parseErrors` is empty.
 */
export declare function appendParseErrorsBulletList(lines: string[], parseErrors: readonly string[] | undefined, theme: Theme, total?: number): void;
/**
 * Human-readable summary string for the parse-issues count, capped by
 * {@link PARSE_ERRORS_LIMIT}.
 */
export declare function formatParseErrorsCountLabel(parseErrors: readonly string[], total?: number): string;
/**
 * Normalize a path argument that may arrive as a single string, a JSON-encoded
 * string array (`'["a.ts"]'`), or an actual array into a flat `string[]`.
 * Delimited single strings (`"a.ts b.ts"`) remain literal.
 */
export declare function toPathList(input: string | string[] | undefined): string[];
