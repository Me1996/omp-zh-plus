/**
 * Host-side handler for the eval `judge()` helper.
 *
 * Cell code awaits `judge(state, questions)`; the prelude forwards
 * `{ state, questions }` through {@link EVAL_JUDGMENT_BRIDGE_NAME} and this
 * module answers every question with the session's resolved {@link Judge}
 * role chain (see `../judgment`), returning the typed answers directly. Bulk
 * classification goes through `judge_batch()` (`./judgment-batch-bridge`),
 * which reuses the parsers and answer shaping exported here.
 *
 * Cell code sees the yes/no kind as `bool` (`{ type: "bool", bool: P(yes) }`);
 * the library's `noul` name stays internal.
 */
import type { Answer, JudgmentResult, JudgmentState, Question, Questions } from "@oh-my-pi/pi-ai";
import { type ChainJudge, type JudgmentUsage } from "../judgment/index.js";
import { type EvalCompletionBridgeOptions } from "./completion-bridge.js";
/** Synthetic bridge name reserved for the `judge()` helper across both runtimes. */
export declare const EVAL_JUDGMENT_BRIDGE_NAME = "__judge__";
/** Answer as the cell sees it: library `noul` answers surface as `bool`. */
export type CellAnswer = Answer | {
    type: "bool";
    bool: number;
};
/** Typed answers plus the backend that produced them, returned to the cell. */
export interface EvalJudgmentResult {
    answers: Record<string, CellAnswer>;
    model: string;
}
/** Validate a cell-supplied judgment state (non-empty string or JSON value). */
export declare function parseState(value: unknown): JudgmentState;
/** Validate cell-supplied questions keyed by id; `bool` maps to the library's `noul`. */
export declare function parseQuestions(value: unknown): Record<string, Question>;
/** Shape a library judgment result into the cell-facing answers and backend label. */
export declare function toEvalJudgmentResult(result: JudgmentResult<Questions>): EvalJudgmentResult;
/**
 * Resolve the judge role chain for a bridge call's session; `purpose` labels its
 * cost on the session ledger. `onUsage` additionally observes every attempt
 * (retries and failures included) alongside the ledger.
 */
export declare function sessionJudge(options: Pick<EvalCompletionBridgeOptions, "session">, purpose: string, onUsage?: (usage: JudgmentUsage) => void): ChainJudge;
/** Answer one typed judgment; the cell awaits the answers directly. */
export declare function runEvalJudgment(args: unknown, options: EvalCompletionBridgeOptions): Promise<EvalJudgmentResult>;
