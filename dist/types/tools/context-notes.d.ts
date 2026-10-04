import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback, ToolApprovalDecision } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "./index.js";
declare const contextNotesSchema: import("@oh-my-pi/omptype").FluentType<{
    text?: string | undefined;
}, {
    text?: string | undefined;
}>;
declare const newContextSchema: import("@oh-my-pi/omptype").FluentType<{}, {}>;
export type ContextNotesParams = typeof contextNotesSchema.infer;
export type NewContextParams = typeof newContextSchema.infer;
export interface ContextNotesToolDetails {
    entryId?: string;
    text: string;
    bytes?: number;
}
export interface NewContextToolDetails {
    requested: true;
}
type ExperimentalContextSessionManager = NonNullable<ToolSession["sessionManager"]>;
/**
 * Resolves the live session journal only when experimental context management is enabled and
 * owned by this ToolSession. The identity comparison prevents advisor tools from writing the
 * parent agent's notebook or resolving its raw history.
 */
export declare function getExperimentalContextSession(session: ToolSession): ExperimentalContextSessionManager;
/** Reads or replaces the current branch's durable experimental notebook. */
export declare class ContextNotesTool implements AgentTool<typeof contextNotesSchema, ContextNotesToolDetails> {
    private readonly session;
    readonly name = "context_notes";
    readonly approval: (args: unknown) => ToolApprovalDecision;
    readonly label = "Context Notes";
    readonly description: string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        text?: string | undefined;
    }, {
        text?: string | undefined;
    }>;
    readonly strict = true;
    readonly loadMode: "essential";
    readonly summary = "Read or replace persistent experimental context notes";
    constructor(session: ToolSession);
    static createIf(session: ToolSession): ContextNotesTool | null;
    execute(_id: string, params: ContextNotesParams, signal?: AbortSignal, _onUpdate?: AgentToolUpdateCallback<ContextNotesToolDetails>, _context?: AgentToolContext): Promise<AgentToolResult<ContextNotesToolDetails>>;
}
/** Requests a fresh context window; the owning lifecycle consumes this turn-local signal. */
export declare class NewContextTool implements AgentTool<typeof newContextSchema, NewContextToolDetails> {
    private readonly session;
    readonly name = "new_context";
    readonly approval: "write";
    readonly label = "New Context";
    readonly description: string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{}, {}>;
    readonly strict = true;
    readonly loadMode: "essential";
    readonly summary = "Request a fresh context window";
    constructor(session: ToolSession);
    static createIf(session: ToolSession): NewContextTool | null;
    execute(_id: string, _params: NewContextParams, signal?: AbortSignal, _onUpdate?: AgentToolUpdateCallback<NewContextToolDetails>, _context?: AgentToolContext): Promise<AgentToolResult<NewContextToolDetails>>;
}
export {};
