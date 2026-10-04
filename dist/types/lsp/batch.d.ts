import type { ToolCallContext } from "@oh-my-pi/pi-agent-core";
/** Identifies a shared edit/write batch and whether its diagnostics should flush. */
export interface LspBatchRequest {
    id: string;
    flush: boolean;
}
/** Resolve batching for edit/write calls sharing one model response. */
export declare function getLspBatchRequest(toolCall: ToolCallContext | undefined): LspBatchRequest | undefined;
