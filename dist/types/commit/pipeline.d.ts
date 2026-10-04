import type { CommitCommandArgs } from "./types.js";
/** Execute the agentic commit flow or the exact deterministic legacy flow. */
export declare function runCommitCommand(args: CommitCommandArgs): Promise<{
    usedFallback: boolean;
}>;
