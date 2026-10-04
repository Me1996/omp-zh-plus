import { type TodoItem, type TodoPhase, type TodoToolDetails } from "@oh-my-pi/pi-tui-zh/tools/todo";
import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "../sdk.js";
import type { SessionEntry } from "../session/session-entries.js";
/** Whether an unknown value is a persisted todo phase. */
export declare function isTodoPhase(value: unknown): value is TodoPhase;
/**
 * Phases a successful, state-changing `todo` result committed, or undefined
 * for errors and pure `view` reads. A direct call lands these on the branch
 * through its own toolResult entry; a caller that produces no `todo`
 * toolResult (the eval bridge) must persist them itself or the next branch
 * rehydration (resume, rewind, fork, /btw) silently reverts the change.
 */
export declare function committedTodoPhases(result: AgentToolResult): TodoPhase[] | undefined;
declare const todoSchema: import("@oh-my-pi/omptype").FluentType<{
    items?: string[] | undefined;
    list?: {
        items: string[];
        phase: string;
    }[] | undefined;
    op: "append" | "block" | "done" | "drop" | "init" | "rm" | "start" | "unblock" | "view";
    phase?: string | undefined;
    reason?: string | undefined;
    task?: string | undefined;
}, {
    items?: string[] | undefined;
    list?: {
        items: string[];
        phase: string;
    }[] | undefined;
    op: "append" | "block" | "done" | "drop" | "init" | "rm" | "start" | "unblock" | "view";
    phase?: string | undefined;
    reason?: string | undefined;
    task?: string | undefined;
}>;
type TodoParams = TodoSchema;
type TodoSchema = typeof todoSchema.infer;
/** A single todo op entry (the params object itself). */
type TodoOpEntryValue = TodoParams;
/** Return the active todo task, preferring an in-progress item over the first pending item. */
export declare function nextActionableTask(phases: readonly TodoPhase[]): TodoItem | undefined;
export declare const USER_TODO_EDIT_CUSTOM_TYPE = "user_todo_edit";
export declare const TODO_HUD_STATE_CUSTOM_TYPE = "todo_hud_state";
export type TodoHudVisibility = "dismissed" | "revealed";
export interface TodoSnapshotIdentity {
    sourceEntryId: string;
    fingerprint: string;
}
export interface TodoHudStateEntryData extends TodoSnapshotIdentity {
    visibility: TodoHudVisibility;
}
/** Identify the latest durable canonical todo snapshot on the active branch. */
export declare function getLatestTodoSnapshotIdentity(entries: SessionEntry[]): TodoSnapshotIdentity | undefined;
/** Return the persisted HUD choice only when it targets the current canonical snapshot exactly. */
export declare function getTodoHudVisibility(entries: SessionEntry[], phases: readonly TodoPhase[]): TodoHudVisibility | undefined;
/** Build persisted HUD metadata only for phases matching the latest durable canonical snapshot. */
export declare function createTodoHudStateData(entries: SessionEntry[], phases: readonly TodoPhase[], visibility: TodoHudVisibility): TodoHudStateEntryData | undefined;
export declare function getLatestTodoPhasesFromEntries(entries: SessionEntry[]): TodoPhase[];
/** Apply an array of `todo`-style ops to existing phases. Used by /todo slash command. */
export declare function applyOpsToPhases(currentPhases: TodoPhase[], ops: TodoOpEntryValue[]): {
    phases: TodoPhase[];
    errors: string[];
};
export declare function resolveTodoMarkdownPath(input: string, cwd: string): string;
/** Render todo phases as a Markdown checklist suitable for editing/copying. */
export declare function phasesToMarkdown(phases: TodoPhase[]): string;
/** Parse a Markdown checklist back into todo phases. */
export declare function markdownToPhases(md: string): {
    phases: TodoPhase[];
    errors: string[];
};
export declare class TodoTool implements AgentTool<typeof todoSchema, TodoToolDetails> {
    private readonly session;
    readonly name = "todo";
    readonly approval: "read";
    readonly label = "Todo";
    readonly summary = "Write a structured todo list to track progress within a session";
    readonly description: string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        items?: string[] | undefined;
        list?: {
            items: string[];
            phase: string;
        }[] | undefined;
        op: "append" | "block" | "done" | "drop" | "init" | "rm" | "start" | "unblock" | "view";
        phase?: string | undefined;
        reason?: string | undefined;
        task?: string | undefined;
    }, {
        items?: string[] | undefined;
        list?: {
            items: string[];
            phase: string;
        }[] | undefined;
        op: "append" | "block" | "done" | "drop" | "init" | "rm" | "start" | "unblock" | "view";
        phase?: string | undefined;
        reason?: string | undefined;
        task?: string | undefined;
    }>;
    readonly concurrency = "exclusive";
    readonly strict = true;
    readonly lenientArgValidation = true;
    readonly loadMode = "discoverable";
    constructor(session: ToolSession);
    execute(_toolCallId: string, params: TodoParams, _signal?: AbortSignal, _onUpdate?: AgentToolUpdateCallback<TodoToolDetails>, _context?: AgentToolContext): Promise<AgentToolResult<TodoToolDetails>>;
}
export {};
