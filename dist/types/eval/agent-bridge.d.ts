import type { StructuredSubagentSchemaMode } from "@oh-my-pi/pi-tui-zh/tools/task";
import type { NestedRepoPatch } from "@oh-my-pi/pi-tui-zh/tools/task";
import type { ToolSession } from "../tools/index.js";
import type { JsStatusEvent } from "./js/shared/types.js";
/** Synthetic bridge name reserved for the `agent()` helper across both runtimes. */
export declare const EVAL_AGENT_BRIDGE_NAME = "__agent__";
export interface EvalAgentBridgeOptions {
    session: ToolSession;
    signal?: AbortSignal;
    emitStatus?: (event: JsStatusEvent) => void;
}
/** Handle returned immediately after an eval subagent job is registered. */
export interface EvalAgentHandleResult {
    id: string;
    agent: string;
}
export interface EvalAgentResult {
    text: string;
    /** Parsed structured data returned by the child executor. */
    data?: unknown;
    details: {
        agent: string;
        id: string;
        model?: string | string[];
        structured: boolean;
        schemaSource?: "caller" | "agent" | "session";
        schemaMode?: StructuredSubagentSchemaMode;
        schemaStatus?: "valid" | "invalid";
        isolated?: boolean;
        patchPath?: string;
        /** False when `patchPath` is an empty root diff and the work lives in `nestedPatchPaths`. */
        hasRootChanges?: boolean;
        branchName?: string;
        nestedPatches?: NestedRepoPatch[];
        /** On-disk copies of `nestedPatches`, written before the isolation workspace was removed. */
        nestedPatchPaths?: string[];
        changesApplied?: boolean | null;
        isolationSummary?: string;
    };
}
/** Register a background subagent and return its handle immediately. */
export declare function runEvalAgent(args: unknown, options: EvalAgentBridgeOptions): Promise<EvalAgentHandleResult>;
