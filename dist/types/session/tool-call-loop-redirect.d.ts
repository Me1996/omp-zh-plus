import type { RepeatedToolCallDetection } from "@oh-my-pi/pi-ai/utils/tool-call-loop-guard";
export declare const TOOL_CALL_LOOP_REDIRECT_TYPE = "tool-call-loop-redirect";
/** Structured record of the loop a redirect was issued for. */
export interface ToolCallLoopRedirectDetails {
    toolName: string;
    count: number;
    argumentsSummary: string;
    resultSummary: string;
}
/**
 * Renders the corrective a repeated tool call earns. Shared by the primary
 * session's `LoopGuards` and the advisor's own loop guard: both bounds speak
 * with one wording, while each wraps it in the message shape its own agent
 * converts to LLM context (the primary maps custom messages, the advisor runs
 * the default converter that keeps only LLM-native roles).
 */
export declare function renderToolCallLoopRedirect(detection: RepeatedToolCallDetection): string;
export declare function toolCallLoopRedirectDetails(detection: RepeatedToolCallDetection): ToolCallLoopRedirectDetails;
