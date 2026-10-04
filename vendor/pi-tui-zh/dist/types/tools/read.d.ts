import type { SummaryResult } from "@oh-my-pi/pi-natives";
import type { Component } from "../tui.js";
import type { NativeToolView, RenderResultOptions, ToolActivityContext, ToolActivitySummary } from "./renderer.js";
import type { NativeNode } from "../native/node.js";
import type { Theme } from "../theme/theme.js";
import type { OutputMeta } from "./output-meta.js";
import type { TruncationResult } from "./streaming-output.js";
import { type ProcReadDetails } from "./proc-render.js";
import { type CfgReadDetails } from "./cfg-render.js";
import { type InternalUrlSchemeSpec } from "./url-scheme-host.js";
/** Read result metadata retains truncation statistics, not a second copy of the body. */
export type ReadTruncationStats = Omit<TruncationResult, "content">;
/** Display metadata for file and URL reads. */
export interface ReadToolDetails {
    kind?: "file" | "url";
    proc?: ProcReadDetails;
    cfg?: CfgReadDetails;
    /** Filesystem hyperlink target resolved by the executing tool. */
    displayTarget?: string;
    truncation?: ReadTruncationStats;
    isDirectory?: boolean;
    resolvedPath?: string;
    suffixResolution?: {
        from: string;
        to: string;
    };
    url?: string;
    finalUrl?: string;
    contentType?: string;
    method?: string;
    notes?: string[];
    meta?: OutputMeta;
    /** Full on-disk byte size recorded before applying a file range. */
    fileSize?: number;
    /** Full source line count when the read reached EOF and the count is exact. */
    totalLines?: number;
    /** Raw text + start line for user-visible TUI rendering, set when content is text-like.
     * Mirrors the same lines the model receives but without hashline/line-number prefixes,
     * so the TUI can render the file content with its own gutter without re-parsing the formatted text. */
    displayContent?: {
        text: string;
        startLine: number;
        lineNumbers?: Array<number | null>;
    };
    summary?: {
        lines: number;
        elidedSpans: number;
        elidedLines: number;
    };
    /** Number of unresolved git conflicts surfaced by this read (TUI uses for inline `⚠ N` badge). */
    conflictCount?: number;
    /** Paths recovered from a delimited read argument; used only by the TUI to render one call as multiple read rows. */
    displayReadTargets?: string[];
    /**
     * Resolved filesystem link target for each {@link displayReadTargets} entry, aligned by index; `null` when a
     * delimited part has no linkable fs path. Lets the TUI hyperlink each grouped row the same way a standalone read row is.
     */
    displayReadTargetLinks?: Array<string | null>;
}
/** Split a filesystem path from its trailing read selector. */
export declare function splitPathAndSel(rawPath: string): {
    path: string;
    sel?: string;
};
/**
 * Variant of {@link splitPathAndSel} for internal URLs (`scheme://...`).
 *
 * The filesystem-path splitter is intentionally conservative: it refuses to
 * peel a trailing `:<chunk>` unless that chunk matches the strict selector
 * grammar. That rule is right for filesystem paths (a file named `a:1-50` is
 * legal) but wrong for internal URLs, where any trailing `:<chunk>` after the
 * scheme is unambiguously a read-tool selector — even if malformed (e.g.
 * `artifact://3:raw:-100-5`).
 *
 * This function iteratively peels selector-shaped chunks (well-formed plus
 * common malformed shapes like `:-N-M`) so the rest of the read tool can pass a
 * clean URL to the protocol handler and surface selector errors via parseSel
 * instead of as misleading "host invalid" errors from the handler.
 *
 * Only schemes whose spec declares `lines` selectors peel; server-defined URIs
 * (`opaque`), selector-free schemes, and unregistered schemes pass through
 * verbatim. `specOf` defaults to the installed scheme host, so nothing peels
 * before a host is installed.
 *
 * Falls back to the input unchanged when nothing matches.
 */
export declare function splitInternalUrlSel(rawPath: string, specOf?: (scheme: string) => InternalUrlSchemeSpec | undefined): {
    path: string;
    sel?: string;
};
/** Recognize HTTP URLs and www-prefixed external read targets. */
export declare function isReadableUrlPath(value: string): boolean;
/** Return the first selected line when every range has valid one-based bounds. */
export declare function readSelectorRangeStart(selector: string): number | undefined;
export interface ReadRenderArgs {
    path?: unknown;
    file_path?: unknown;
    offset?: number;
    limit?: number;
    raw?: boolean;
}
/** Local file a pending read/write input points at, before the tool resolves it:
 * expands `~` and drops archive-member / SQLite-row selectors so the link opens
 * the containing file. */
export declare function pendingFileLinkPath(inputPath: string): string;
/** Absolute fs path the read result actually resolved to, used as the OSC 8 link
 * target when the structured `resolvedPath` isn't set (the common plain-file and
 * image reads only record the path in `meta.source`). URL/internal sources are
 * not fs paths, so only `type: "path"` qualifies. */
export declare function readSourceFsPath(details: ReadToolDetails | undefined): string | undefined;
/**
 * Read content as numbered `code` (no path header: the head names the file).
 * Numbers come from `lineNumbers` (`displayContent`'s per-line numbers,
 * `null` for an elided block; runs split with `…` between) when they cover
 * every line, else count up from `start`.
 */
export declare function readContentCode(content: string, start: number, numbers: readonly (number | null)[] | undefined, lang: string | undefined): NativeNode[];
/** Render file, image, and URL reads in the transcript. */
export declare const readToolRenderer: {
    activitySummary(args: unknown, _context: ToolActivityContext): ToolActivitySummary;
    renderCall(args: ReadRenderArgs, _options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: ReadToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions, uiTheme: Theme, args?: ReadRenderArgs): Component;
    describeCall(args: ReadRenderArgs): NativeToolView;
    /**
     * Inline (§7.3 read): the head names the file and range; the content
     * (numbered from the range start, no path header) is the disclosed body.
     * An error shows its message in the head, never behind the disclosure.
     */
    describeResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: ReadToolDetails;
        isError?: boolean;
    }, _options: RenderResultOptions, args?: ReadRenderArgs): NativeToolView;
    mergeCallAndResult: true;
};
/** Inclusive line range describing one elided span in a structural summary. */
export interface ElidedRange {
    start: number;
    end: number;
}
/**
 * Decide whether the kept lines surrounding an elided range collapse to a
 * single brace-pair line in the rendered summary. Returns true when the head
 * line ends with `{` / `(` / `[` and the tail line is the matching closer
 * (optionally followed by terminating punctuation like `;`, `,`, or further
 * closers — e.g. `};`, `})`, `]);`).
 */
export declare function canMergeBracePair(headLine: string, tailLine: string): boolean;
/** Format one summary line with the selected line-prefix mode. */
export declare function formatSingleLine(line: number, text: string, shouldAddHashLines: boolean, shouldAddLineNumbers: boolean): string;
/** Format the boundary lines around an elided brace-pair body. */
export declare function formatMergedBraceLine(startLine: number, endLine: number, headText: string, tailText: string, shouldAddHashLines: boolean, shouldAddLineNumbers: boolean): {
    model: string;
    display: string;
};
/** Format a structural summary using the supplied file-display preferences. */
export declare function formatReadSummary(displayMode: {
    hashLines: boolean;
    lineNumbers: boolean;
}, summary: SummaryResult): {
    text: string;
    displayText: string;
    elidedRanges: ElidedRange[];
    elidedLines: number;
};
