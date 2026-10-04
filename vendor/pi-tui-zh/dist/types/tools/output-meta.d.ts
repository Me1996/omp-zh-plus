import type { Theme } from "../theme/theme.js";
import type { OutputArtifactError } from "./streaming-output.js";
/**
 * Truncation metadata for the output notice.
 */
export interface TruncationMeta {
    direction: "head" | "tail" | "middle";
    truncatedBy: "lines" | "bytes" | "middle";
    totalLines: number;
    totalBytes: number;
    outputLines: number;
    outputBytes: number;
    maxBytes?: number;
    /** Line range shown (1-indexed, inclusive). Omitted for middle elision. */
    shownRange?: {
        start: number;
        end: number;
    };
    /** Head/tail line ranges shown when direction === "middle". */
    headRange?: {
        start: number;
        end: number;
    };
    tailRange?: {
        start: number;
        end: number;
    };
    /** Bytes elided from the middle. */
    elidedBytes?: number;
    /** Lines elided from the middle. */
    elidedLines?: number;
    /** Artifact ID if full output was saved */
    artifactId?: string;
    /** Bytes the artifact cap dropped from the saved file's middle; the artifact is then a head/tail sample. */
    artifactElidedBytes?: number;
    /** Next offset for pagination (head truncation only) */
    nextOffset?: number;
    /**
     * The single shown line is a byte-capped preview of one oversized line, not
     * a complete line. `outputBytes`/`totalBytes` are the preview vs full line
     * size; renders a distinct "partial" notice instead of a line range.
     */
    partialLine?: boolean;
}
/**
 * Source resolution info for the output.
 */
export type SourceMeta = {
    type: "path";
    value: string;
} | {
    type: "url";
    value: string;
} | {
    type: "internal";
    value: string;
}
/** A complete aggregate report, whose entries may contain incomplete source captures. */
 | {
    type: "report";
    value: string;
};
/**
 * LSP diagnostic info (for edit/write tools).
 */
export interface DiagnosticMeta {
    summary: string;
    messages: string[];
}
/**
 * Limit-specific notices.
 */
export interface LimitsMeta {
    matchLimit?: {
        reached: number;
        suggestion: number;
    };
    /** `suggestion` is omitted when the tool is already at its hard cap, so no larger usable limit exists to advise. */
    resultLimit?: {
        reached: number;
        suggestion?: number;
    };
    headLimit?: {
        reached: number;
        suggestion: number;
    };
    /** `unit` may be absent in sessions persisted before it was recorded. */
    columnTruncated?: {
        maxColumn: number;
        unit?: "bytes" | "chars";
        artifactId?: string;
        artifactElidedBytes?: number;
    };
}
/**
 * Structured metadata for tool outputs.
 */
export interface OutputMeta {
    truncation?: TruncationMeta;
    /** Capture failure of this output itself; aggregate reports keep source failures on their entries. */
    artifactError?: OutputArtifactError;
    source?: SourceMeta;
    /** The output is a bounded page of session artifact storage its `source` re-reads with line selectors; spill-to-artifact skips it. */
    pagedSource?: true;
    diagnostics?: DiagnosticMeta;
    limits?: LimitsMeta;
}
/**
 * Reformat pre-formatted diagnostic messages into a multi-level, prefix-folded
 * directory/file grouping (see `formatGroupedFiles`).
 * Input:  ["path:line:col [sev] msg", ...]
 * Output: "# pkg/src/\n## file.ts\n  line:col [sev] msg"
 *
 * Messages that don't match the expected format are appended ungrouped at the end.
 */
export declare function formatGroupedDiagnosticMessages(messages: string[]): string;
/**
 * Format a recoverable output artifact link. An artifact the size cap cut
 * (`artifactElidedBytes > 0`) is labeled as the head/tail sample it holds.
 */
export declare function formatFullOutputReference(artifactId: string, artifactElidedBytes?: number): string;
/** Strip the last literal notice or a matching final line; optionally preserve surrounding whitespace. */
export declare function stripTrailingNotice(text: string, notice: string | ((line: string) => boolean), trimResult?: boolean): string;
/** Remove the trailing bash raw-output artifact footer while preserving its artifact id. */
export declare function stripRawOutputArtifactNotice(text: string): {
    text: string;
    artifactId?: string;
};
/** Remove a trailing generated output notice when metadata is unavailable. */
export declare function stripGeneratedOutputNotice(text: string): string;
/** Format truncation ranges and recovery hints. */
export declare function formatTruncationMetaNotice(truncation: TruncationMeta, source?: SourceMeta): string;
/**
 * Format styled artifact reference with warning color and brackets.
 * For TUI rendering of truncation warnings.
 */
export declare function formatStyledArtifactReference(artifactId: string, theme: Theme): string;
/** Describe an incomplete artifact capture. */
export declare function formatArtifactErrorNotice(error: OutputArtifactError): string;
/**
 * Format notices from OutputMeta for LLM consumption.
 * Returns empty string if no notices needed.
 */
export declare function formatOutputNotice(meta: OutputMeta | undefined): string;
/**
 * Format styled truncation and artifact capture warnings.
 * Returns null if neither warning is present.
 */
export declare function formatStyledTruncationWarning(meta: OutputMeta | undefined, theme: Theme): string | null;
/**
 * Strip the trailing notice that {@link appendOutputNotice} bakes into the
 * LLM-facing content body. Renderers should call this before printing
 * `result.content` text in the TUI, because they emit a styled warning line of
 * their own; without this, users see the same `[Showing lines …]` string twice
 * (once verbatim from the body, once as the styled `⟨…⟩` warning).
 *
 * Safe to call eagerly: returns the input unchanged when no notice is present
 * (e.g. during streaming, before {@link wrappedExecute} runs).
 */
export declare function stripOutputNotice(text: string, meta: OutputMeta | undefined): string;
