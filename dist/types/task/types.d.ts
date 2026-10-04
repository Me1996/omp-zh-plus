import type { AgentSource } from "@oh-my-pi/pi-tui-zh/tools/task";
export { TASK_SUBAGENT_PROGRESS_CHANNEL, TASK_SUBAGENT_LIFECYCLE_CHANNEL, } from "@oh-my-pi/pi-tui-zh/overlays/session-observer-registry";
export type { SubagentProgressPayload, SubagentLifecyclePayload, } from "@oh-my-pi/pi-tui-zh/overlays/session-observer-registry";
import { type BaseType } from "@oh-my-pi/omptype";
import type { AgentSessionEvent } from "../session/agent-session.js";
import type { ConfiguredThinkingLevel } from "@oh-my-pi/pi-tui-zh/thinking";
/** Maximum output bytes per agent */
export declare const MAX_OUTPUT_BYTES: number;
/** Maximum output lines per agent */
export declare const MAX_OUTPUT_LINES: number;
/** EventBus channel for raw subagent events */
export declare const TASK_SUBAGENT_EVENT_CHANNEL = "task:subagent:event";
/** Payload emitted on TASK_SUBAGENT_EVENT_CHANNEL */
export interface SubagentEventPayload {
    id: string;
    event: AgentSessionEvent;
}
export declare const taskItemSchema: import("@oh-my-pi/omptype").FluentType<{
    agent: string;
    model?: string | string[] | undefined;
    name?: string | undefined;
    outputSchema?: string | boolean | object | null | undefined;
    schemaMode?: "permissive" | "strict" | undefined;
    solutionSpace: string;
    task: string;
    tools?: string[] | undefined;
}, {
    agent?: string | undefined;
    model?: string | string[] | undefined;
    name?: string | undefined;
    outputSchema?: string | boolean | object | null | undefined;
    schemaMode?: "permissive" | "strict" | undefined;
    solutionSpace: string;
    task: string;
    tools?: string[] | undefined;
}>;
export declare const taskSchema: import("@oh-my-pi/omptype").FluentType<{
    agent: string;
    isolated?: boolean | undefined;
    model?: string | string[] | undefined;
    name?: string | undefined;
    outputSchema?: string | boolean | object | null | undefined;
    schemaMode?: "permissive" | "strict" | undefined;
    solutionSpace: string;
    task: string;
    tools?: string[] | undefined;
}, {
    agent?: string | undefined;
    isolated?: boolean | undefined;
    model?: string | string[] | undefined;
    name?: string | undefined;
    outputSchema?: string | boolean | object | null | undefined;
    schemaMode?: "permissive" | "strict" | undefined;
    solutionSpace: string;
    task: string;
    tools?: string[] | undefined;
}>;
declare const ALL_TASK_SCHEMAS: readonly [import("@oh-my-pi/omptype").FluentType<{
    agent: string;
    isolated?: boolean | undefined;
    model?: string | string[] | undefined;
    name?: string | undefined;
    outputSchema?: string | boolean | object | null | undefined;
    schemaMode?: "permissive" | "strict" | undefined;
    solutionSpace: string;
    task: string;
    tools?: string[] | undefined;
}, {
    agent?: string | undefined;
    isolated?: boolean | undefined;
    model?: string | string[] | undefined;
    name?: string | undefined;
    outputSchema?: string | boolean | object | null | undefined;
    schemaMode?: "permissive" | "strict" | undefined;
    solutionSpace: string;
    task: string;
    tools?: string[] | undefined;
}>, import("@oh-my-pi/omptype").FluentType<{
    agent: string;
    model?: string | string[] | undefined;
    name?: string | undefined;
    outputSchema?: string | boolean | object | null | undefined;
    schemaMode?: "permissive" | "strict" | undefined;
    solutionSpace: string;
    task: string;
    tools?: string[] | undefined;
}, {
    agent?: string | undefined;
    model?: string | string[] | undefined;
    name?: string | undefined;
    outputSchema?: string | boolean | object | null | undefined;
    schemaMode?: "permissive" | "strict" | undefined;
    solutionSpace: string;
    task: string;
    tools?: string[] | undefined;
}>, import("@oh-my-pi/omptype").FluentType<{
    context: string;
    model?: unknown;
    tasks: {
        agent: string;
        isolated?: boolean | undefined;
        model?: string | string[] | undefined;
        name?: string | undefined;
        outputSchema?: string | boolean | object | null | undefined;
        schemaMode?: "permissive" | "strict" | undefined;
        solutionSpace: string;
        task: string;
        tools?: string[] | undefined;
    }[];
}, {
    context: string;
    model?: unknown;
    tasks: {
        agent?: string | undefined;
        isolated?: boolean | undefined;
        model?: string | string[] | undefined;
        name?: string | undefined;
        outputSchema?: string | boolean | object | null | undefined;
        schemaMode?: "permissive" | "strict" | undefined;
        solutionSpace: string;
        task: string;
        tools?: string[] | undefined;
    }[];
}>, import("@oh-my-pi/omptype").FluentType<{
    context: string;
    model?: unknown;
    tasks: {
        agent: string;
        model?: string | string[] | undefined;
        name?: string | undefined;
        outputSchema?: string | boolean | object | null | undefined;
        schemaMode?: "permissive" | "strict" | undefined;
        solutionSpace: string;
        task: string;
        tools?: string[] | undefined;
    }[];
}, {
    context: string;
    model?: unknown;
    tasks: {
        agent?: string | undefined;
        model?: string | string[] | undefined;
        name?: string | undefined;
        outputSchema?: string | boolean | object | null | undefined;
        schemaMode?: "permissive" | "strict" | undefined;
        solutionSpace: string;
        task: string;
        tools?: string[] | undefined;
    }[];
}>];
type DynamicTaskSchema = (typeof ALL_TASK_SCHEMAS)[number];
export type TaskSchema = typeof taskSchema;
/** Active task tool parameter schema for the current isolation / batch flags */
export type TaskToolSchemaInstance = DynamicTaskSchema | BaseType;
/** Build the task wire schema for the current settings and spawn policy. */
export declare function getTaskSchema(options: {
    isolationEnabled: boolean;
    batchEnabled: boolean;
    effortEnabled?: boolean;
    /** Advertise the `tools` field for eval-defined tools (`eval.tools.enabled`, default on). */
    evalToolsEnabled?: boolean;
    defaultAgent?: string;
}): TaskToolSchemaInstance;
/**
 * Whether an agent at `taskDepth` may still spawn children — i.e. it currently
 * holds the `task` tool. Mirrors the task-tool availability gate;
 * `maxRecursionDepth < 0` disables the cap entirely.
 */
export declare function canSpawnAtDepth(maxRecursionDepth: number, taskDepth: number): boolean;
/** Agent definition (bundled or discovered) */
export interface AgentDefinition {
    name: string;
    description: string;
    systemPrompt: string;
    tools?: string[];
    spawns?: string[] | "*";
    model?: string[];
    thinkingLevel?: ConfiguredThinkingLevel;
    output?: unknown;
    blocking?: boolean;
    autoloadSkills?: string[];
    /** When `false`, the agent's `read` tool returns verbatim file content instead of structural summaries. */
    readSummarize?: boolean;
    /** Prewalk hand-off for the spawned session: `true` = switch to the default prewalk target at the first edit/write, string = custom target model pattern. */
    prewalk?: boolean | string;
    /** Advisor for spawned sessions of this agent: `true` = advise with the default advisor-role model, string = advise with that model pattern (optional `:level` suffix). Absent/`false` = no advisor. */
    advisor?: boolean | string;
    source: AgentSource;
    filePath?: string;
}
