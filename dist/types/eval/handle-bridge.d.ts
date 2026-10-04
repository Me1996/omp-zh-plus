import type { ToolSession } from "../tools/index.js";
import type { JsStatusEvent } from "./js/shared/types.js";
/** Synthetic bridge name reserved for waiting on eval handles. */
export declare const EVAL_WAIT_BRIDGE_NAME = "__wait__";
/** Synthetic bridge name reserved for inspecting an eval handle. */
export declare const EVAL_STATUS_BRIDGE_NAME = "__status__";
/** Synthetic bridge name reserved for cancelling an eval handle. */
export declare const EVAL_CANCEL_BRIDGE_NAME = "__cancel__";
export type EvalHandleKind = "agent" | "completion";
export type EvalHandleState = "running" | "completed" | "failed" | "cancelled";
/** Stable process-local reference sent by eval runtimes. */
export interface EvalHandleRef {
    kind: EvalHandleKind;
    id: string;
}
/** Current or terminal state returned to an eval handle. */
export interface EvalHandleSnapshot extends EvalHandleRef {
    status: EvalHandleState;
    text?: string;
    data?: unknown;
    error?: string;
}
interface EvalHandleBridgeOptions {
    session: ToolSession;
    signal?: AbortSignal;
    emitStatus?: (event: JsStatusEvent) => void;
}
/** Wait for agent/completion handles and consume settled agent job deliveries. */
export declare function runEvalWait(args: unknown, options: EvalHandleBridgeOptions): Promise<{
    items: EvalHandleSnapshot[];
}>;
/** Return one handle's current state without waiting or consuming it. */
export declare function runEvalStatus(args: unknown, options: EvalHandleBridgeOptions): EvalHandleSnapshot;
/** Cancel one running eval handle owned by this session. */
export declare function runEvalCancel(args: unknown, options: EvalHandleBridgeOptions): {
    cancelled: boolean;
};
export {};
