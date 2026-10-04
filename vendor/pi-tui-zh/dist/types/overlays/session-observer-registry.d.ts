import type { AgentProgress, AgentSource } from "../tools/task.js";
/** EventBus channel for aggregated subagent progress */
export declare const TASK_SUBAGENT_PROGRESS_CHANNEL = "task:subagent:progress";
/** EventBus channel for subagent lifecycle (start/end) */
export declare const TASK_SUBAGENT_LIFECYCLE_CHANNEL = "task:subagent:lifecycle";
/** Payload emitted on TASK_SUBAGENT_PROGRESS_CHANNEL */
export interface SubagentProgressPayload {
    index: number;
    agent: string;
    agentSource: AgentSource;
    task: string;
    parentToolCallId?: string;
    assignment?: string;
    progress: AgentProgress;
    sessionFile?: string;
    /** See {@link SubagentLifecyclePayload.detached}. */
    detached?: boolean;
}
/** Payload emitted on TASK_SUBAGENT_LIFECYCLE_CHANNEL */
export interface SubagentLifecyclePayload {
    id: string;
    agent: string;
    agentSource: AgentSource;
    description?: string;
    status: "started" | "completed" | "failed" | "aborted";
    sessionFile?: string;
    parentToolCallId?: string;
    index: number;
    /**
     * Spawn runs as a detached background job: the parent turn keeps working
     * while this agent runs. Sync task spawns (parent blocked on the call) and
     * eval `agent()` bridge spawns (rendered inside their eval cell) leave this
     * unset — surfaces like the subagent HUD only list detached spawns.
     */
    detached?: boolean;
}
/** Minimal event subscription surface supplied by the host. */
export interface EventBusLike {
    on(channel: string, listener: (data: unknown) => void): () => void;
}
export interface ObservableSession {
    id: string;
    kind: "main" | "subagent";
    label: string;
    agent?: string;
    description?: string;
    status: "active" | "completed" | "failed" | "aborted";
    sessionFile?: string;
    parentToolCallId?: string;
    /**
     * Spawn runs as a detached background job (parent turn not blocked on it).
     * Sync task spawns and eval `agent()` spawns additionally render live in
     * their own inline tool block / eval cell; the pinned HUD jump-lists every
     * active subagent either way.
     */
    detached?: boolean;
    index?: number;
    lastUpdate: number;
    /** Latest progress snapshot from the subagent executor */
    progress?: AgentProgress;
}
/** Coarse source of an observer change; callers use it to separate lifecycle work from high-frequency progress. */
export type SessionObserverChangeKind = "main" | "reset" | "lifecycle" | "progress";
export declare class SessionObserverRegistry {
    #private;
    /** Add a change listener. Returns unsubscribe function. */
    onChange(cb: (kind: SessionObserverChangeKind) => void): () => void;
    setMainSession(sessionFile?: string): void;
    /** Return one tracked session without copying or sorting the registry. */
    getSession(id: string): ObservableSession | undefined;
    getSessions(): ObservableSession[];
    getActiveSubagentCount(): number;
    /** Clear all tracked sessions (e.g. on session switch). Keeps EventBus subscriptions and listeners. */
    resetSessions(): void;
    dispose(): void;
    subscribeToEventBus(eventBus: EventBusLike, subagentEventBus: EventBusLike): void;
}
