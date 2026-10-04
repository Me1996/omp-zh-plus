import type { AgentActivityRow, AgentActivityQuery } from "@oh-my-pi/pi-tui-zh/overlays/agent-activity";
export type { AgentActivityRow, AgentActivityQuery, AgentActivityKind, AgentActivityStatus, } from "@oh-my-pi/pi-tui-zh/overlays/agent-activity";
export { activityRowsFromProgress } from "@oh-my-pi/pi-tui-zh/overlays/agent-activity";
export interface AgentActivityTranscript {
    text: string;
    newSize: number;
    error?: string;
}
export interface AgentActivityRemote {
    readTranscript(agentId: string, fromByte: number): Promise<AgentActivityTranscript | null>;
}
export declare class AgentActivityIndex {
    #private;
    constructor(options?: {
        remote?: AgentActivityRemote;
    });
    onChange(listener: () => void): () => void;
    setLive(agentId: string, rows: readonly AgentActivityRow[]): void;
    sync(agentId: string, sessionFile?: string | null): Promise<void>;
    /** Test/diag helper: number of toolCallId mappings retained for an agent. */
    retainedToolMappings(agentId: string): number;
    recent(agentId: string, limit?: number): AgentActivityRow[];
    query(query?: AgentActivityQuery): AgentActivityRow[];
    clear(): void;
}
