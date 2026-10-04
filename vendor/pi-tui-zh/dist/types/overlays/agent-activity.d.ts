import type { AgentProgress } from "../tools/task.js";
export type AgentActivityKind = "response" | "tool" | "irc" | "lifecycle";
export type AgentActivityStatus = "pending" | "success" | "error" | "aborted";
export interface AgentActivityRow {
    id: string;
    agentId: string;
    timestamp: number;
    kind: AgentActivityKind;
    title: string;
    summary: string;
    status?: AgentActivityStatus;
    entryId?: string;
    toolCallId?: string;
    toolName?: string;
    from?: string;
    to?: string;
    replyTo?: string;
    source: "live" | "transcript" | "irc";
}
export interface AgentActivityQuery {
    agentIds?: ReadonlySet<string>;
    kinds?: ReadonlySet<AgentActivityKind>;
    search?: string;
    before?: {
        timestamp: number;
        id: string;
    };
    limit?: number;
}
/** Activity index surface rendered by the agent hub. */
export interface AgentActivitySource {
    setLive(agentId: string, rows: AgentActivityRow[]): void;
    sync(agentId: string, sessionFile: string | null): Promise<void>;
    query(query: AgentActivityQuery): AgentActivityRow[];
    recent(agentId: string, limit: number): AgentActivityRow[];
}
/** Collapse an activity label to one readable terminal line. */
export declare function activityOneLine(value: string): string;
/** Stable timestamp ordering for merged activity rows. */
export declare function compareActivityRows(a: AgentActivityRow, b: AgentActivityRow): number;
export declare function activityRowsFromProgress(progress: AgentProgress, lastUpdate?: number): AgentActivityRow[];
