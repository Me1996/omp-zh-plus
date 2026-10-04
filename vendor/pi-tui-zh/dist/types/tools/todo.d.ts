import type { Component } from "../index.js";
import type { RenderResultOptions } from "./renderer.js";
import type { Theme } from "../theme/theme.js";
import type { TspChecklistPhase } from "@oh-my-pi/pi-wire";
import type { NativeToolView, ToolRenderResult } from "./renderer.js";
/** Lifecycle state of a todo item. */
export type TodoStatus = "pending" | "in_progress" | "completed" | "abandoned" | "blocked";
/** Operation names accepted by the todo tool and echoed in successful result details. */
export type TodoOperation = "init" | "start" | "done" | "rm" | "drop" | "block" | "unblock" | "append" | "view";
/** A task displayed within a todo phase. */
export interface TodoItem {
    content: string;
    status: TodoStatus;
    /** When `status === "blocked"`, an optional note on what the task is waiting for. */
    blocker?: string;
    details?: string;
    notes?: string[];
}
/** A named group of todo tasks. */
export interface TodoPhase {
    name: string;
    tasks: TodoItem[];
}
/** A task that became complete in the latest update. */
export interface TodoCompletionTransition {
    phase: string;
    content: string;
}
/** Todo snapshot and transitions displayed after an operation. */
export interface TodoToolDetails {
    /** Operation that produced this snapshot; absent on legacy transcript entries. */
    op?: TodoOperation;
    phases: TodoPhase[];
    storage: "session" | "memory";
    completedTasks?: TodoCompletionTransition[];
}
/**
 * Report whether `content` likely names the same work as any entry in
 * `descriptions`. Used by the sticky todo panel to light up a pending todo
 * when an in-flight subagent is doing the work for it, without requiring
 * the caller to flip the todo's status.
 *
 * Matching is normalize-then-equal first (lowercased; punctuation and
 * whitespace runs both collapsed to a single space; trimmed), with a
 * substring fallback in either direction so minor wording drift
 * ("Sonnet #2: bug scan" vs "Sonnet #2") still links up. The substring
 * fallback requires at least {@link TODO_DESCRIPTION_MIN_OVERLAP} chars on
 * the contained side.
 */
export declare function todoMatchesAnyDescription(content: string, descriptions: readonly string[]): boolean;
/** Whether a todo is settled: completed or deliberately abandoned. Shared so
 *  the collapsed viewport, the HUD progress counters, and the HUD's closed-todo
 *  auto-clear can never disagree about what "done" hides. */
export declare function isClosedTodo<T extends {
    status: TodoStatus;
}>(task: T): boolean;
/** Result of {@link selectCollapsedTodos}: the rows to render plus an optional
 *  summary line (empty string ⇒ no summary row). */
export interface CollapsedTodoSelection<T> {
    items: T[];
    summary: string;
}
/**
 * Walking-viewport selection for a phase's collapsed todo preview (#5873).
 *
 * Applied to `tasks` in todo order: the open tasks run through
 * {@link selectWithinCap}, led by the last {@link COLLAPSED_CLOSED_CONTEXT}
 * closed tasks in todo order so a checked row remains visible even when callers
 * complete work out of sequence. The lead is additive — it never costs an open
 * row — and a phase with no open work left falls back to its closed tasks so the
 * sticky HUD's closed-todo persistence still has something to render.
 *
 * `summary` counts the open tasks that did not fit; the closed lead is context,
 * not part of the budget.
 */
export declare function selectCollapsedTodos<T extends {
    status: TodoStatus;
}>(tasks: T[], isMatched: (task: T) => boolean, cap: number): CollapsedTodoSelection<T>;
type TodoRenderOp = {
    op?: string;
    task?: string;
    phase?: string;
    items?: string[];
};
/** New single-op shape `{op,...}`; legacy `{ops:[...]}` still seen in old transcripts. */
type TodoRenderArgs = TodoRenderOp & {
    ops?: TodoRenderOp[];
};
/** One-based ASCII roman numeral for display (I, II, III, IV, …). */
export declare function phaseRomanNumeral(oneBasedIndex: number): string;
/**
 * Display-only phase header: `I. Foundation`. State and prompts never see this.
 *
 * Sanitized for the same reason task labels are: this is a render boundary and
 * the name may carry provider or session text holding control sequences. The
 * raw `phase.name` stays the lookup key everywhere else.
 */
export declare function formatPhaseDisplayName(name: string, oneBasedIndex: number): string;
/** Frames held before revealing a completion strike. */
export declare const TODO_STRIKE_HOLD_FRAMES = 2;
/** Frames used to reveal a completion strike. */
export declare const TODO_STRIKE_REVEAL_FRAMES = 12;
/** Total frames in the completion strike animation. */
export declare const TODO_STRIKE_TOTAL_FRAMES: number;
/** Wire the live-subagent description source for {@link todoToolRenderer}. */
export declare function setActiveTodoDescriptionsProvider(provider: () => readonly string[]): void;
/**
 * Checklist phases for native terminals: plain phase titles (no roman
 * numerals — the terminal numbers nothing), completed phases folded.
 */
export declare function todoChecklistPhases(phases: readonly {
    name: string;
    tasks: readonly TodoItem[];
}[], isMatched?: (task: TodoItem) => boolean): TspChecklistPhase[];
/** Render todo operations and phased task snapshots. */
export declare const todoToolRenderer: {
    renderCall(args: TodoRenderArgs, options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: TodoToolDetails;
        isError?: boolean;
    }, options: RenderResultOptions, uiTheme: Theme, args?: TodoRenderArgs): Component;
    describeCall(args: TodoRenderArgs): NativeToolView;
    describeResult(result: ToolRenderResult<TodoToolDetails>, options: RenderResultOptions): NativeToolView | undefined;
    mergeCallAndResult: true;
};
export {};
