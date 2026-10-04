import { type SummaryResult } from "@oh-my-pi/pi-natives";
import type { ClientBridge } from "../session/client-bridge.js";
import type { ToolSession } from "../sdk.js";
/**
 * Prose files (Markdown flavors and plain text) skip code-block summarization
 * unless `read.summarize.prose` opts them in.
 */
export declare function isProseSummaryPath(filePath: string): boolean;
export declare function getReadTextFileBridge(session: ToolSession): ClientBridge | undefined;
export declare function routeReadThroughBridge(session: ToolSession, absolutePath: string, options?: {
    line?: number;
    limit?: number;
}): Promise<string> | undefined;
/**
 * Structural summary of `absolutePath`, or `null` when the file is too large,
 * too short, or unparseable. `diskText` lets a caller that already read the file
 * hand those bytes over instead of forcing a second read; an ACP bridge still
 * wins, since the editor's buffer is the source of truth. `languagePath`
 * overrides only parser-language inference (speculative reads pass the
 * requested lexical path while reading the resolved target); bytes and cache
 * identity stay on `absolutePath`.
 */
export declare function trySummarize(session: ToolSession, absolutePath: string, fileSize: number, signal?: AbortSignal, diskText?: string, languagePath?: string): Promise<SummaryResult | null>;
/** Read session display preferences and format a structural summary. */
export declare function renderSummary(session: ToolSession, summary: SummaryResult): {
    text: string;
    displayText: string;
    elidedRanges: import("@oh-my-pi/pi-tui-zh/tools/read").ElidedRange[];
    elidedLines: number;
};
