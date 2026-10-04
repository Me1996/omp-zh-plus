import type { InteractiveModeContext } from "../types.js";
export declare class BtwController {
    #private;
    private readonly ctx;
    constructor(ctx: InteractiveModeContext);
    /** Whether the inline panel owns Escape. */
    hasActiveRequest(): boolean;
    canBranch(): boolean;
    /** Whether plain `b` is currently reserved for a completed or pending branch action. */
    handlesBranchKey(): boolean;
    canCopy(): boolean;
    handleCopy(): Promise<boolean>;
    handleBranch(): Promise<boolean>;
    handleEscape(): boolean;
    canFollowUp(): boolean;
    handleFollowUp(): boolean;
    handleCancel(): boolean;
    dispose(): Promise<void>;
    flush(timeoutMs?: number): Promise<void>;
    withSessionMove(operation: () => Promise<boolean>): Promise<boolean>;
    start(question: string): Promise<void>;
    startFollowUp(recordId: string, question: string, signal?: AbortSignal): Promise<boolean>;
}
