import type { AgentToolResult } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "../../tools/index.js";
import { type EvalAgentHandleResult } from "../agent-bridge.js";
import { type EvalBudgetResult } from "../budget-bridge.js";
import { type EvalCompletionHandleResult } from "../completion-bridge.js";
import { type EvalJudgmentBatchResult } from "../judgment-batch-bridge.js";
import { type EvalJudgmentResult } from "../judgment-bridge.js";
import { type EvalHandleSnapshot } from "../handle-bridge.js";
import type { EvalShadowCellSession } from "../speculation/cell-session.js";
import { type EvalWorkpoolResult } from "../workpool-bridge.js";
import type { RuntimeCallIdentity } from "./shared/runtime.js";
import type { JsStatusEvent } from "./shared/types.js";
export type { JsStatusEvent } from "./shared/types.js";
export interface ToolBridgeOptions {
    session: ToolSession;
    signal?: AbortSignal;
    emitStatus?: (event: JsStatusEvent) => void;
    identity?: RuntimeCallIdentity;
    shadowCell?: EvalShadowCellSession;
}
type ToolValue = string | EvalBudgetResult | EvalAgentHandleResult | EvalCompletionHandleResult | EvalJudgmentResult | EvalJudgmentBatchResult | EvalHandleSnapshot | EvalWorkpoolResult | {
    items: EvalHandleSnapshot[];
} | {
    cancelled: boolean;
} | {
    text: string;
    details?: unknown;
    images?: Array<{
        mimeType: string;
        data: string;
    }>;
    hasError?: boolean;
};
/** Builds the status event recorded for one bridged host call; `undefined` records nothing. */
type StatusSummarizer = (name: string, args: unknown, result: AgentToolResult, text: string, hasError: boolean) => JsStatusEvent | undefined;
export declare function bridgeValueFromToolResult(name: string, args: unknown, result: AgentToolResult, emitStatus?: (event: JsStatusEvent) => void, summarize?: StatusSummarizer): ToolValue;
export declare function callSessionTool(name: string, args: unknown, options: ToolBridgeOptions): Promise<ToolValue>;
