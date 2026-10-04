import type { ToolApprovalDecision } from "@oh-my-pi/pi-agent-core";
import type { EvalPreludeDefinition } from "../eval/preludes.js";
import type { ToolSession } from "../tools/index.js";
/** Read-only actions never mutate flow state; everything else writes `.omp/ratchet/<flow>/`. */
export declare function ratchetApproval(args: unknown): ToolApprovalDecision;
export type ApprovalOutcome = {
    approved: true;
} | {
    approved: false;
    aborted: boolean;
    feedback?: string;
};
/** Create the ratchet eval prelude; `/ratchet` enables it for the session via `ratchet.enabled`. */
export declare function createRatchetPrelude(session: ToolSession): EvalPreludeDefinition;
