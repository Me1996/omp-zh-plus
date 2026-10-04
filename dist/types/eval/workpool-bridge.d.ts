import { type WorkPoolPeekResult, type WorkPoolStatus } from "../task/workpool.js";
import type { ToolSession } from "../tools/index.js";
import type { JsStatusEvent } from "./js/shared/types.js";
/** Synthetic bridge name reserved for eval work pools. */
export declare const EVAL_WORKPOOL_BRIDGE_NAME = "__workpool__";
interface EvalWorkpoolBridgeOptions {
    session: ToolSession;
    signal?: AbortSignal;
    emitStatus?: (event: JsStatusEvent) => void;
}
export type EvalWorkpoolResult = {
    name: string;
    agent: string;
    limit: number;
} | {
    ids: string[];
} | WorkPoolStatus | WorkPoolPeekResult | {
    dropped: string[];
};
/** Create or operate a process-local pool of keep-alive subagents. */
export declare function runEvalWorkpool(args: unknown, options: EvalWorkpoolBridgeOptions): Promise<EvalWorkpoolResult>;
export {};
