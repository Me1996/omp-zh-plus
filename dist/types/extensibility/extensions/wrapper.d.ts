/**
 * Tool wrappers for extensions.
 */
import { type AgentTool, type AgentToolContext, type AgentToolResult, type AgentToolUpdateCallback, type ToolLoadMode } from "@oh-my-pi/pi-agent-core";
import type { Static, TSchema } from "@oh-my-pi/pi-ai";
import type { ExtensionRunner } from "./runner.js";
import type { ExtensionAgentIdentity, RegisteredTool } from "./types.js";
/**
 * Adapts a RegisteredTool into an AgentTool.
 */
export declare class RegisteredToolAdapter implements AgentTool<any, any, any> {
    private registeredTool;
    private runner;
    name: string;
    description: string;
    parameters: any;
    label: string;
    strict: boolean;
    renderCall?: (args: any, options: any, theme: any) => any;
    renderResult?: (result: any, options: any, theme: any, args?: any) => any;
    readonly loadMode: ToolLoadMode;
    constructor(registeredTool: RegisteredTool, runner: ExtensionRunner);
    execute(toolCallId: string, params: any, signal?: AbortSignal, onUpdate?: AgentToolUpdateCallback<any>, context?: AgentToolContext): Promise<AgentToolResult<unknown, unknown>>;
}
/**
 * Backward-compatible factory function wrapper.
 */
export declare function wrapRegisteredTool(registeredTool: RegisteredTool, runner: ExtensionRunner): AgentTool;
/**
 * Wrap all registered tools into AgentTools.
 */
export declare function wrapRegisteredTools(registeredTools: RegisteredTool[], runner: ExtensionRunner): AgentTool[];
/**
 * Wraps a tool with extension callbacks for interception.
 * - Emits tool_call event before execution (can block)
 * - Emits tool_result event after execution (can modify result)
 *
 * `agent` overrides the runner's own `ctx.agent` for those events when the tool
 * runs on behalf of a different agent than the runner's session — the advisor's
 * toolset shares the primary session's runner (for approval enforcement) but
 * must not be reported as the primary agent.
 */
export declare class ExtensionToolWrapper<TParameters extends TSchema = TSchema, TDetails = unknown> implements AgentTool<TParameters, TDetails> {
    #private;
    private tool;
    private runner;
    name: string;
    description: string;
    parameters: TParameters;
    label: string;
    strict: boolean;
    constructor(tool: AgentTool<TParameters, TDetails>, runner: ExtensionRunner, agent?: ExtensionAgentIdentity);
    /**
     * Forward browser mode changes when available.
     */
    restartForModeChange(): Promise<void>;
    execute(toolCallId: string, params: Static<TParameters>, signal?: AbortSignal, onUpdate?: AgentToolUpdateCallback<TDetails, TParameters>, context?: AgentToolContext): Promise<AgentToolResult<TDetails, TParameters>>;
}
