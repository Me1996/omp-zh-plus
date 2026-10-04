import { type ElidedRange } from "@oh-my-pi/pi-tui-zh/tools/read";
import type { AgentToolResult } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "../sdk.js";
import { type TruncationResult } from "@oh-my-pi/pi-tui-zh/tools/streaming-output";
import { type LineEntry } from "../utils/block-context.js";
import { type LineRange } from "@oh-my-pi/pi-tui-zh/tools/line-ranges";
import type { ReadToolDetails, ReadTruncationStats } from "@oh-my-pi/pi-tui-zh/tools/read";
import { type ParsedSelector } from "./read-selector.js";
export declare function toReadTruncationStats(result: TruncationResult): ReadTruncationStats;
export interface HashlineHeaderContext {
    header: string;
    tag: string;
    fullText?: string;
}
export declare function formatReadHashlineHeader(displayPath: string, tag: string): string;
export declare function readHashlineHeaderContext(session: ToolSession, absolutePath: string, cwd: string, displayPath?: string): Promise<HashlineHeaderContext>;
/**
 * {@link readHashlineHeaderContext} for a caller that already holds the file's
 * full text, so the file is not reopened just to hash it. Line endings are
 * normalized here, exactly as the reading variant does.
 */
export declare function hashlineHeaderContextForText(session: ToolSession, absolutePath: string, cwd: string, fullText: string, displayPath?: string): HashlineHeaderContext;
export declare function hashlineHeaderContext(displayPath: string, tag: string): HashlineHeaderContext;
export declare function prependHashlineHeader(text: string, context: HashlineHeaderContext | undefined): string;
export declare function formatTextWithMode(text: string, startNum: number, shouldAddHashLines: boolean, shouldAddLineNumbers: boolean): string;
export declare const BRACKET_CONTEXT_ELLIPSIS = "\u2026";
export declare function formatLineEntriesWithMode(entries: readonly LineEntry[], shouldAddHashLines: boolean, shouldAddLineNumbers: boolean): string;
/** Line count of file content: 0 for empty text, otherwise N newlines ⇒ N+1 lines. */
export declare function countTextLines(text: string): number;
export declare function contiguousLineNumbers(startLine: number, count: number): number[];
export declare function lineNumbersFromSpans(spans: readonly {
    startLine: number;
    endLine: number;
}[]): number[];
/**
 * Footer appended to summarized reads telling the model how to recover the
 * elided body. Without this hint, agents either ignore the `…`/`{ … }`
 * markers or burn a turn guessing the right selector (see issue #1046). The
 * footer demonstrates the multi-range selector syntax with concrete sample
 * ranges drawn from the actual elision so the model re-reads only what it
 * needs instead of falling back to `:raw` or whole-file reads.
 */
export declare function formatSummaryElisionFooter(readPath: string, elidedRanges: ReadonlyArray<ElidedRange>, elidedLines: number): string;
export declare const READ_CHUNK_SIZE: number;
/**
 * Context lines added around an explicit range read. Anchor-stale failures
 * cluster on edits whose anchors land just outside the most recent read
 * window, but the data (`scripts/session-stats/analyze_selector_reads.py`)
 * shows most follow-up reads are disjoint hops, not adjacent extensions —
 * so symmetric padding rarely pays for itself.
 *
 * Leading=1 catches accidental single-line reads where the anchor is the
 * line immediately above the requested start. Trailing=3 buffers the
 * common case where the agent asks for a narrow range and then needs the
 * next few lines to disambiguate an anchor.
 */
export declare const RANGE_LEADING_CONTEXT_LINES = 1;
export declare const RANGE_TRAILING_CONTEXT_LINES = 3;
/** Options shared by the in-memory text builders; `raw` flips the line split to verbatim `\n` segments. */
export interface InMemoryTextOptions {
    details?: ReadToolDetails;
    sourcePath?: string;
    sourceUrl?: string;
    sourceInternal?: string;
    entityLabel: string;
    ignoreResultLimits?: boolean;
    raw?: boolean;
    immutable?: boolean;
}
/**
 * Render any read selector against in-memory text. Pins `:-N` tails to the
 * text's own line count (raw mode addresses `\n` segments verbatim; otherwise
 * the hashline-addressable split), then dispatches multi-range selectors to
 * {@link buildInMemoryMultiRangeResult} and everything else to
 * {@link buildInMemoryTextResult}. Raw mode is derived from the selector.
 */
export declare function buildInMemorySelectorResult(session: ToolSession, text: string, parsed: ParsedSelector, options: Omit<InMemoryTextOptions, "raw">): AgentToolResult<ReadToolDetails>;
export declare function buildInMemoryTextResult(session: ToolSession, text: string, offset: number | undefined, limit: number | undefined, options: InMemoryTextOptions): AgentToolResult<ReadToolDetails>;
/**
 * Render a multi-range read against in-memory text. Each range emits a
 * formatted block with its own anchors / line numbers, blocks are joined
 * with an elision separator, and ranges past EOF surface as `[…]` notices
 * so the model can correct the next call. No leading/trailing context is
 * added — multi-range callers always specify exact bounds.
 */
export declare function buildInMemoryMultiRangeResult(session: ToolSession, text: string, ranges: readonly LineRange[], options: Omit<InMemoryTextOptions, "ignoreResultLimits">): AgentToolResult<ReadToolDetails>;
export declare function decodeUtf8Text(bytes: Uint8Array): string | null;
export declare function prependSuffixResolutionNotice(text: string, suffixResolution?: {
    from: string;
    to: string;
}): string;
/**
 * Tag Markdown reads for the TUI's formatted preview, gated on the opt-in
 * `read.renderMarkdown` setting. Off by default; when disabled, no local
 * read is tagged `text/markdown`, so the renderer output is identical to
 * the pre-setting behavior. Internal-URL reads keep their protocol-supplied
 * `contentType` and render as Markdown regardless of the setting.
 */
export declare function markMarkdownContentType(session: ToolSession, details: ReadToolDetails, filePath: string): ReadToolDetails;
