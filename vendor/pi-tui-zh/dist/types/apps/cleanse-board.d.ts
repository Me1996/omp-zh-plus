import { type LiveBoardOutput } from "../chrome/live-board.js";
import type { AgentProgress } from "../tools/task.js";
import type { DescribeContext, NativeNode } from "../native/node.js";
/** Checker identity shown in live rows and verdicts. */
export interface CleanseCheckerDescriptor {
    id: string;
    label: string;
}
/** Checker result fields consumed by the verdict line. */
export interface CleanseCheckResult extends CleanseCheckerDescriptor {
    diagnostics: readonly unknown[];
}
/** Repair workload fields displayed in agent rows. */
export interface CleanseAssignment {
    index: number;
    groups: readonly {
        file?: string;
    }[];
    weight: number;
}
/** Completion fields displayed when a repair agent settles. */
export interface CleanseAgentOutcome {
    name: string;
    success: boolean;
    error?: string;
    resolvedModel?: string;
}
/** Rendering surface for one `omp cleanse` run. */
export interface CleanseStatusBoard {
    readonly interactive: boolean;
    /** Print a permanent line above the live area (plain write when non-TTY). */
    log(text: string): void;
    /** Show a transient spinner line; `undefined` clears it. Non-TTY prints the text once. */
    phase(text: string | undefined): void;
    checkerStarted(checker: CleanseCheckerDescriptor): void;
    checkerFinished(check: CleanseCheckResult, durationMs: number): void;
    /** End the repair phase and drop its live rows before verification. */
    repairFinished(): void;
    agentStarted(name: string, assignment: CleanseAssignment): void;
    agentProgress(name: string, progress: AgentProgress): void;
    agentFinished(outcome: CleanseAgentOutcome, assignment: CleanseAssignment): void;
    /** Clear the live area and restore the cursor. Idempotent. */
    close(): void;
}
/**
 * Live-view state for one cleanse run, shared by the CLI stdout board and the
 * interactive-mode overlay panel so both surfaces render identical rows.
 *
 * Mutators mirror {@link CleanseStatusBoard}; the finish mutators return the
 * permanent line the surface should log above the live area.
 */
export declare class CleanseBoardModel {
    #private;
    phase(text: string | undefined): void;
    checkerStarted(checker: CleanseCheckerDescriptor): void;
    /** Drop the checker's live row and build its permanent verdict line. */
    checkerFinished(check: CleanseCheckResult, durationMs: number): string;
    repairFinished(): void;
    agentStarted(name: string, assignment: CleanseAssignment): void;
    agentProgress(name: string, progress: AgentProgress): void;
    /** Drop the agent's live row, advance the repair bar, and build its permanent outcome line. */
    agentFinished(outcome: CleanseAgentOutcome, assignment: CleanseAssignment): string;
    /**
     * Semantic twin of the permanent line the most recent
     * {@link checkerFinished}/{@link agentFinished} call returned, for native
     * surfaces that log settled work as nodes.
     */
    get lastSettled(): NativeNode | undefined;
    /**
     * Native live rows (NATIVE_REDESIGN §10): phase and checker spinners, the
     * repair head with a `meter` of fixed lanes, and the running repair agents
     * as a grid of lanes, one `agent` row each (status, current tool with its
     * intent, tools, tokens, cost, timer). Terminals without `agent`/`meter`
     * get the plain rows and a `progress` bar. Spinners and timers are
     * terminal-clocked, so the node only changes when the board state does.
     * `undefined` while nothing is live.
     */
    describeLive(cx: DescribeContext): NativeNode | undefined;
    /** Render the transient live rows for the current spinner frame. */
    renderLive(spinner: string): string[];
}
/** Create the cleanse status board bound to `output` (default `process.stdout`). */
export declare function createCleanseStatusBoard(output?: LiveBoardOutput, errors?: LiveBoardOutput): CleanseStatusBoard;
