/** Anchored `/cleanse` overlay rendering the host's live board above the editor. */
import { type TUI } from "../index.js";
import type { AgentProgress } from "../tools/task.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { DescribeContext, NativeNode } from "../native/node.js";
import type { CleanseBoardModel, CleanseCheckerDescriptor, CleanseCheckResult, CleanseAssignment, CleanseAgentOutcome } from "../apps/cleanse-board.js";
export type CleansePanelRunStatus = "clean" | "unresolved" | "unsupported" | "cancelled";
interface CleansePanelComponentOptions {
    model: CleanseBoardModel;
    /** Free-form request shown in the header; omitted for checker-discovery runs. */
    request?: string;
    tui: TUI;
}
export declare class CleansePanelComponent extends OverlayPanel {
    #private;
    readonly interactive = true;
    constructor(options: CleansePanelComponentOptions);
    log(line: string): void;
    /** Permanent line styled as a failure (the core's stderr-equivalent). */
    logError(line: string): void;
    phase(text: string | undefined): void;
    checkerStarted(checker: CleanseCheckerDescriptor): void;
    checkerFinished(check: CleanseCheckResult, durationMs: number): void;
    repairFinished(): void;
    agentStarted(name: string, assignment: CleanseAssignment): void;
    agentProgress(name: string, progress: AgentProgress): void;
    agentFinished(outcome: CleanseAgentOutcome, assignment: CleanseAssignment): void;
    /** Stop the live area; the panel stays mounted until the user dismisses it. */
    close(): void;
    /** Record the settled run result and switch the footer to its dismiss hint. */
    finish(status: CleansePanelRunStatus): void;
    /** Record an unexpected failure and switch the footer to its dismiss hint. */
    markError(message: string): void;
    /** Release the repaint timer during teardown. */
    dispose(): void;
    invalidate(): void;
    describe(cx: DescribeContext): NativeNode;
}
export {};
