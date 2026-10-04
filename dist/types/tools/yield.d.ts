/**
 * Result submission tool for subagent output.
 *
 * Subagents can call this tool incrementally or terminally depending on `type`.
 */
import type { AgentMessage, AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
import type { TSchema } from "@oh-my-pi/pi-ai/types";
import type { ToolSession } from "./index.js";
export declare function resolveYieldReportText(messages: readonly AgentMessage[], toolCallId: string): string | undefined;
export interface YieldDetails {
    /** Successful result payload, or omitted when `useLastTurn` requests last-turn extraction. */
    data?: unknown;
    status: "success" | "aborted";
    error?: string;
    /** Optional result section/classification supplied by the yield caller. */
    type?: string | string[];
    /** True when the caller intentionally omitted success data so the executor uses the last assistant turn. */
    useLastTurn?: boolean;
    /** True when this incremental workpool yield completed every item in the active batch. */
    complete?: boolean;
    /**
     * Set when the yield tool exhausted its in-tool schema-retry budget
     * (MAX_SCHEMA_RETRIES) and accepted the data anyway. Surfaced so the
     * executor's post-mortem finalizer can honor the override instead of
     * re-rejecting the same payload with `schema_violation` — keeping the
     * subagent's acceptance and the parent's view of the result in lockstep.
     */
    schemaOverridden?: boolean;
}
export declare class YieldTool implements AgentTool<TSchema, YieldDetails> {
    #private;
    readonly name = "yield";
    readonly approval: "read";
    readonly label = "Submit Result";
    readonly intent: "omit";
    lenientArgValidation: boolean;
    get strict(): boolean;
    get description(): string;
    get parameters(): TSchema;
    constructor(session: ToolSession);
    /**
     * Clear per-run accumulator state before a kept-alive session continues with a
     * new monitored turn. The tool instance is stored once in the session's tool
     * registry and reused across follow-up turns (`runSubagentFollowUpTurn`), so a
     * prior run's incremental-section flag and retry counters would otherwise leak
     * forward: a later thinking-only `{type:"result"}` would skip the empty-last-
     * turn and schema guards (which require `!#hasIncrementalSections`) and fail
     * the run post-mortem. Workpool submission state resets separately via the
     * batch key in {@link #workPoolItems}.
     */
    resetTurnState(): void;
    execute(toolCallId: string, params: unknown, _signal?: AbortSignal, _onUpdate?: AgentToolUpdateCallback<YieldDetails>, _context?: AgentToolContext): Promise<AgentToolResult<YieldDetails>>;
}
/**
 * Reset per-run yield state through either a native tool or an
 * `ExtensionToolWrapper` proxy.
 */
export declare function resetYieldTurnState(tool: AgentTool | undefined): void;
