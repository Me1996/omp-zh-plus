import type { SourceMeta } from "../../../capability/types.js";
import type { CustomTool } from "../../../extensibility/custom-tools/types.js";
import { type LoadMCPConfigsOptions, loadAllMCPConfigs } from "../../../mcp/config.js";
import type { MCPLoadResult } from "../../../mcp/manager.js";
import type { McpConnectionStatusEvent } from "../../../mcp/startup-events.js";
import type { MCPServerConfig } from "../../../mcp/types.js";
/** Manager methods `/extensions` needs to match `/mcp enable` / `/mcp disable`. */
export interface MCPToggleManager {
    getConnectionStatus(name: string): "connected" | "connecting" | "disconnected";
    getTools(): CustomTool[];
    disconnectServer(name: string): Promise<void>;
    connectServers(configs: Record<string, MCPServerConfig>, sources: Record<string, SourceMeta>, onStatus?: (event: McpConnectionStatusEvent) => void): Promise<Pick<MCPLoadResult, "errors"> | MCPLoadResult>;
}
export interface MCPToggleSession {
    refreshMCPTools(tools: CustomTool[]): Promise<void> | void;
}
export interface ApplyMcpToggleRuntimeOptions {
    name: string;
    enabled: boolean;
    cwd: string;
    manager?: MCPToggleManager;
    session?: MCPToggleSession;
    /** Same discovery filters as session startup (`sdk.ts` / `/mcp reload`). */
    discovery?: LoadMCPConfigsOptions;
    loadConfigs?: typeof loadAllMCPConfigs;
    onStatus?: (event: McpConnectionStatusEvent) => void;
}
/**
 * After `/extensions` persists an MCP enable/disable, apply the same live
 * connect/disconnect + session tool refresh that `/mcp enable` / `/mcp disable`
 * already do. Config persistence stays in `setMcpServerEnabled`.
 */
export declare function applyMcpToggleRuntime(options: ApplyMcpToggleRuntimeOptions): Promise<void>;
