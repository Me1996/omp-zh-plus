import type { CustomTool } from "../extensibility/custom-tools/types.js";
import type { ToolSession } from "../tools/index.js";
import { type EffectiveSubagentPolicy } from "./structured-subagent.js";
/** One user-supplied unit tracked through a workpool batch. */
export interface WorkPoolItem {
    id: string;
    seq: number;
    text: string;
    agentId?: string;
    batchId?: string;
    status: "queued" | "running" | "completed" | "failed" | "cancelled";
}
/** Keep-alive subagent and its queued work within a pool. */
export interface WorkPoolAgent {
    id: string;
    index: number;
    state: "running" | "idle" | "dead";
    queue: WorkPoolItem[];
    turns: number;
    contextTokens?: number;
    contextWindow?: number;
    jobId?: string;
}
/** One turn assigned to a pool agent and tracked as an internal job. */
export interface WorkPoolBatch {
    id: string;
    agentId: string;
    items: WorkPoolItem[];
    jobId: string;
    startedAt: number;
    status: "running" | "completed" | "failed" | "cancelled";
    output?: string;
}
/** Aggregate pool activity returned by `WorkPool.status()`. */
export interface WorkPoolStatus {
    name: string;
    agent: string;
    limit: number;
    closed: boolean;
    freshAgents: boolean;
    agents: Array<{
        id: string;
        state: WorkPoolAgent["state"];
        queued: number;
        turns: number;
        contextTokens?: number;
        contextWindow?: number;
        current?: string;
    }>;
    items: Record<WorkPoolItem["status"], number>;
    batches: number;
}
/** Non-consuming batch snapshot returned by `WorkPool.peek()`. */
export interface WorkPoolPeekResult {
    batches: Array<{
        id: string;
        agent: string;
        items: string[];
        status: WorkPoolBatch["status"];
        output?: string;
    }>;
    pending: number;
}
/** Resolved policy and optional shared context used to create a pool. */
export interface WorkPoolCreateOptions {
    name: string;
    /** Raw selector applied to each worker at creation, never to follow-up turns. */
    model?: string | string[];
    policy: EffectiveSubagentPolicy;
    context?: string;
    customTools?: CustomTool[];
}
/** Dispatches queued items across keep-alive subagents under one aggregate job. */
export declare class WorkPool {
    #private;
    readonly name: string;
    readonly ownerId: string;
    readonly session: ToolSession;
    readonly policy: EffectiveSubagentPolicy;
    readonly context?: string;
    readonly customTools: CustomTool[];
    readonly freshAgents: boolean;
    readonly agents: WorkPoolAgent[];
    readonly items: WorkPoolItem[];
    readonly batches: WorkPoolBatch[];
    closed: boolean;
    rrCursor: number;
    constructor(session: ToolSession, options: WorkPoolCreateOptions);
    /** Current worker ceiling from the live `task.maxConcurrency` setting. */
    limit(): number;
    /** Queue items and start the aggregate pool job on the first non-empty push. */
    push(texts: string[]): string[];
    /** Return current workers, item counts, and context usage. */
    status(): WorkPoolStatus;
    /** Return batch results without consuming the aggregate job delivery. */
    peek(): WorkPoolPeekResult;
    /** Stop accepting work and cancel items not yet assigned to a turn. */
    close(): {
        dropped: string[];
    };
}
/** Process-local workpool registry scoped by owner id and pool name. */
export declare class WorkPoolRegistry {
    #private;
    /** Return the process-global workpool registry. */
    static global(): WorkPoolRegistry;
    /** Replace the global registry with an empty instance for tests. */
    static resetForTests(): void;
    /** Create a uniquely named pool for the session owner. */
    create(session: ToolSession, options: WorkPoolCreateOptions): WorkPool;
    /** Find one pool without creating it. */
    get(ownerId: string, name: string): WorkPool | undefined;
    /** Close and forget every pool owned by an ending session. */
    releaseOwner(ownerId: string): void;
}
