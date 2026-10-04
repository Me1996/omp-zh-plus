import { type AgentTool, type AgentToolResult, type AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "./index.js";
import type { CoordinationDetails } from "@oh-my-pi/pi-tui-zh/tools/wait";
declare const waitSchema: import("@oh-my-pi/omptype").FluentType<{}, {}>;
/** Whether `session` has the `wait` tool active, so prompts may point blocked callers at it. */
export declare function hasWaitTool(session: ToolSession): boolean;
/**
 * Blocks on background jobs and services the calling agent started. Work it
 * did not start never sustains a wait: a peer owes no message — a parent
 * blocked awaiting this very agent stays running — so waiting on peers can
 * park both sides for good. A message arriving mid-wait still ends it.
 */
export declare class WaitTool implements AgentTool<typeof waitSchema, CoordinationDetails> {
    #private;
    private readonly session;
    readonly name = "wait";
    readonly label = "Wait";
    readonly summary = "Wait for the next result of a background job or service you started";
    readonly description: string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{}, {}>;
    readonly strict = true;
    readonly interruptible = true;
    readonly approval = "read";
    readonly loadMode = "essential";
    readonly intent = "optional";
    constructor(session: ToolSession);
    execute(_toolCallId: string, _params: typeof waitSchema.infer, signal?: AbortSignal, onUpdate?: AgentToolUpdateCallback<CoordinationDetails>): Promise<AgentToolResult<CoordinationDetails>>;
}
export {};
