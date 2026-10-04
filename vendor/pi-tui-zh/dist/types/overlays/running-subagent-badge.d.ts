import type { AgentHubRegistry } from "./agent-hub-types.js";
export interface RunningSubagentRegistrySource<T extends AgentHubRegistry = AgentHubRegistry> {
    agentRegistry: T;
}
export declare function getRunningSubagentBadgeRegistry<T extends AgentHubRegistry>(collabGuest: RunningSubagentRegistrySource<T> | undefined, localRegistry: T): T;
export declare function getRunningSubagentBadgeAgentIds(registry: AgentHubRegistry): string[];
