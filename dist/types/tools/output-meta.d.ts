/**
 * Structured metadata for tool outputs.
 *
 * Tools populate details.meta using the fluent OutputMetaBuilder.
 * The tool wrapper automatically formats and appends notices at message boundary.
 */
import type { AgentTool, AgentToolContext, AgentToolResult } from "@oh-my-pi/pi-agent-core";
import type { Settings } from "../config/settings.js";
import { type OutputSummary, type TruncationResult } from "@oh-my-pi/pi-tui-zh/tools/streaming-output";
import { type OutputMeta } from "@oh-my-pi/pi-tui-zh/tools/output-meta";
/** Input for {@link OutputMetaBuilder.limits}. `columnUnit` defaults to `chars`. */
export interface LimitsInput {
    matchLimit?: number;
    /** A bare number doubles as its suggestion; an object may pass `suggestion: null` to suppress the advice when the tool is already at its hard cap (#13263). */
    resultLimit?: number | {
        reached: number;
        suggestion?: number | null;
    };
    headLimit?: number;
    columnMax?: number;
    columnUnit?: "bytes" | "chars";
}
/** Metadata supplied when recording a truncated tool result. */
export interface TruncationMetaInput {
    direction: "head" | "tail" | "middle";
    startLine?: number;
    totalFileLines?: number;
    artifactId?: string;
    /** Byte budget that stopped the read, when truncation is byte-limited. */
    maxBytes?: number;
    /** Override the derived continuation line; `null` suppresses an unsafe continuation hint. */
    nextOffset?: number | null;
}
export interface TruncationSummaryOptions {
    direction: "head" | "tail" | "middle";
    startLine?: number;
    totalFileLines?: number;
}
export interface TruncationTextOptions {
    direction: "head" | "tail" | "middle";
    totalLines?: number;
    totalBytes?: number;
    maxBytes?: number;
}
/**
 * Fluent builder for OutputMeta.
 *
 * @example
 * ```ts
 * details.meta = outputMeta()
 *   .truncation(truncation, { direction: "head" })
 *   .matchLimit(limitReached ? effectiveLimit : 0)
 *   .columnTruncated(linesTruncated ? DEFAULT_MAX_COLUMN : 0)
 *   .get();
 * ```
 */
export declare class OutputMetaBuilder {
    #private;
    /** Add truncation info from TruncationResult. No-op if not truncated. */
    truncation(result: TruncationResult, options: TruncationMetaInput): this;
    /** Add truncation, column limits, and capture failures from OutputSummary. */
    truncationFromSummary(summary: OutputSummary, options: TruncationSummaryOptions): this;
    /** Add truncation info from truncated output text. No-op if truncation not detected. */
    truncationFromText(text: string, options: TruncationTextOptions): this;
    /** Add match limit notice. No-op if reached <= 0. */
    matchLimit(reached: number, suggestion?: number): this;
    /** Add limit notices in one call. */
    limits(limits: LimitsInput): this;
    /** Add result limit notice. No-op if reached <= 0. `suggestion: null` omits the "Use limit=" advice (hard cap reached); omitted suggestion defaults to doubling. */
    resultLimit(reached: number, suggestion?: number | null): this;
    /** Add limit notice for head truncation. No-op if reached <= 0. */
    headLimit(reached: number, suggestion?: number): this;
    /**
     * Add column truncation notice. No-op if maxColumn <= 0. `unit` names the
     * unit the producer enforced the cap in — `"bytes"` for the streaming sink
     * and grep's UTF-8 caps, `"chars"` (UTF-16 code units) for the read path.
     *
     * When `artifactId` is supplied the sink mirrored the raw, uncapped stream
     * into that artifact; the rendered notice then advertises it as a recovery
     * pointer (see {@link formatOutputNotice}), matching the tail-truncation notice.
     * `artifactElidedBytes` marks an artifact the size cap cut to a head/tail sample.
     */
    columnTruncated(maxColumn: number, unit?: "bytes" | "chars", artifactId?: string, artifactElidedBytes?: number): this;
    /** Add source path info. */
    sourcePath(value: string): this;
    /** Add source URL info. */
    sourceUrl(value: string): this;
    /** Add internal URL source info (skill://, agent://, artifact://). */
    sourceInternal(value: string): this;
    /** Mark the output as a bounded page of session artifact storage its source re-reads with line selectors ({@link OutputMeta.pagedSource}). */
    pagedSource(): this;
    /** Add LSP diagnostics. No-op if no messages. */
    diagnostics(summary: string, messages: string[]): this;
    /** Get the built OutputMeta, or undefined if empty. */
    get(): OutputMeta | undefined;
}
/** Create a new OutputMetaBuilder. */
export declare function outputMeta(): OutputMetaBuilder;
/**
 * Resolve the OutputSink `headBytes` budget from session settings.
 * Exposed so streaming executors (bash/python/ssh/eval) can opt into
 * middle elision with the same per-user configuration.
 */
export declare function resolveOutputSinkHeadBytes(s: Settings | undefined): number;
/**
 * Resolve the `enforceInlineByteCap` budget for streaming tools (bash/ssh)
 * from session settings: the user's spill threshold plus notice slack.
 */
export declare function resolveInlineByteCapBudget(s: Settings | undefined): number;
/**
 * Resolve the per-line column cap from session settings. Shared by streaming
 * executors (bash/python/ssh/eval via OutputSink) and the `read` tool's
 * line-buffer post-processing, so one setting controls both surfaces.
 */
export declare function resolveOutputMaxColumns(s: Settings | undefined): number;
/**
 * Resolve the OutputSink `artifactMaxBytes` cap (bytes) from session settings
 * (`tools.artifactMaxBytes`, in MB). `0` keeps artifact files unbounded.
 */
export declare function resolveOutputSinkArtifactMaxBytes(s: Settings | undefined): number;
export declare function postProcessToolResult(result: AgentToolResult, toolName: string, context?: AgentToolContext): Promise<AgentToolResult>;
/**
 * Wrap a tool to:
 * 1. Automatically append output notices based on details.meta
 * 2. Handle ToolError rendering
 */
export declare function wrapToolWithMetaNotice<T extends AgentTool<any, any, any>>(tool: T): T;
