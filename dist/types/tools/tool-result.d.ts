import type { AgentToolResult } from "@oh-my-pi/pi-agent-core";
import type { ImageContent, TextContent } from "@oh-my-pi/pi-ai";
import type { OutputSummary, TruncationResult } from "@oh-my-pi/pi-tui-zh/tools/streaming-output";
import type { OutputMeta } from "@oh-my-pi/pi-tui-zh/tools/output-meta";
import type { LimitsInput, TruncationMetaInput, TruncationSummaryOptions, TruncationTextOptions } from "./output-meta.js";
type ToolContent = Array<TextContent | ImageContent>;
type DetailsWithMeta = {
    meta?: OutputMeta;
};
export declare class ToolResultBuilder<TDetails extends DetailsWithMeta> {
    #private;
    constructor(details?: TDetails);
    text(text: string): this;
    content(content: ToolContent): this;
    truncation(result: TruncationResult, options: TruncationMetaInput): this;
    truncationFromSummary(summary: OutputSummary, options: TruncationSummaryOptions): this;
    truncationFromText(text: string, options: TruncationTextOptions): this;
    limits(limits: LimitsInput): this;
    sourceUrl(value: string): this;
    sourcePath(value: string): this;
    sourceInternal(value: string): this;
    /** Mark the result as a bounded page of a file its source re-reads with line selectors. */
    pagedSource(): this;
    diagnostics(summary: string, messages: string[]): this;
    /** Flag the result as a non-throwing failure (agent-loop surfaces it as a tool error). */
    error(value?: boolean): this;
    /** Marks the result contextually useless — compaction may elide it once consumed. */
    useless(value?: boolean): this;
    done(): AgentToolResult<TDetails>;
}
export declare function toolResult<TDetails extends DetailsWithMeta>(details?: TDetails): ToolResultBuilder<TDetails>;
export {};
