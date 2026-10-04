/**
 * Speculative subagent launch for streamed batch `task` calls.
 *
 * While a `{ context, tasks[] }` call streams, {@link TaskLaunchSession} starts
 * each item's subagent as soon as that item's JSON object closes, instead of
 * waiting for the whole call. When the call finishes streaming:
 *
 * - invalid call (parse/validation error) → every launched run is aborted;
 * - launched items differ from the finished call → every launched run is aborted;
 * - otherwise the not-yet-launched remainder starts too.
 *
 * Dispatch then adopts the runs whose spawn params still match
 * ({@link TaskLaunchSession.adopt}); anything unadopted is aborted when the
 * agent loop discards the session (blocked call, changed arguments, aborted
 * turn). Launches require host authorization (`authorizeLaunch`), which denies
 * whenever approval is not auto-allow or extension lifecycle handlers could
 * veto the call.
 */
import { type AgentToolCall, type SpeculativeOperationSink, type SpeculativeToolReference, type ToolSpeculationAssessmentContext, type ToolSpeculationStreamSession } from "@oh-my-pi/pi-agent-core";
import type { TaskParams } from "@oh-my-pi/pi-tui-zh/tools/task";
import type { SpawnRun } from "./spawn-run.js";
/**
 * Incremental scanner over streamed batch-task argument JSON. Extracts the
 * top-level `context` string once it closes and every `tasks[]` element whose
 * object has closed; never parses the unfinished tail.
 */
export declare class BatchArgsScanner {
    #private;
    /** Shared `context`, once its string has closed. */
    get context(): string | undefined;
    /** Closed `tasks[]` elements, in order. */
    get items(): readonly Record<string, unknown>[];
    /** Input left the batch shape (non-object items, non-array `tasks`, unparsable item). */
    get malformed(): boolean;
    /** Scan the streamed buffer; a buffer that does not extend the previous one restarts the scan. */
    feed(raw: string): void;
}
/** Task-tool operations a {@link TaskLaunchSession} drives. */
export interface TaskLauncher {
    /** Per-spawn params of a batch call (or streamed prefix), or undefined when it fails validation. */
    spawns(args: unknown): TaskParams[] | undefined;
    /** Preflight and start one spawn; undefined when it may not start early. */
    start(toolCallId: string, spawn: TaskParams, index: number, signal: AbortSignal): Promise<SpawnRun | undefined>;
}
export interface TaskLaunchSessionOptions {
    sink: SpeculativeOperationSink;
    tool: SpeculativeToolReference;
    launcher: TaskLauncher;
    /** Called once when the session stops owning launches (adopted or discarded). */
    onClose: () => void;
}
/** One streamed `task` call's speculative launches; see the module docs. */
export declare class TaskLaunchSession implements ToolSpeculationStreamSession {
    #private;
    /** The task tool routes adoption through its own session map, not the tool context. */
    readonly contextIndependent = true;
    constructor(options: TaskLaunchSessionOptions);
    update(toolCall: AgentToolCall, partialJson?: string): void;
    /** The call finished streaming: abort on error or delta, else launch the remainder. */
    finalize(context: ToolSpeculationAssessmentContext): void;
    matchesFinalArgs(args: Readonly<Record<string, unknown>>): boolean;
    /**
     * Hand every launched run whose spawn params equal `spawns[index]` to the
     * dispatching call and abort the rest. Closes the session.
     */
    adopt(spawns: readonly TaskParams[]): Promise<Map<number, SpawnRun>>;
    /** Dispatch finished without adopting: nothing launched may keep running. */
    commit(): void;
    discard(reason: string): void;
}
