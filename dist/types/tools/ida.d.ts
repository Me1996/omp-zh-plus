import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback, ToolApprovalDecision } from "@oh-my-pi/pi-agent-core";
import type { OutputMeta } from "@oh-my-pi/pi-tui-zh/tools/output-meta";
import type { ToolSession } from "./index.js";
declare const idaSchema: import("@oh-my-pi/omptype").FluentType<{
    action: "close" | "comment" | "exec" | "list" | "make_function" | "open" | "rename" | "save" | "set_type";
    code?: string | undefined;
    db?: string | undefined;
    decl?: string | undefined;
    name?: string | undefined;
    repeatable?: boolean | undefined;
    save?: boolean | undefined;
    target?: string | undefined;
    text?: string | undefined;
    timeout?: number | undefined;
}, {
    action: "close" | "comment" | "exec" | "list" | "make_function" | "open" | "rename" | "save" | "set_type";
    code?: string | undefined;
    db?: string | undefined;
    decl?: string | undefined;
    name?: string | undefined;
    repeatable?: boolean | undefined;
    save?: boolean | undefined;
    target?: string | undefined;
    text?: string | undefined;
    timeout?: number | undefined;
}>;
/** Parameters accepted by the `ida` tool. */
export type IdaParams = typeof idaSchema.infer;
/** Actions supported by the `ida` tool. */
export type IdaAction = IdaParams["action"];
/** Structured details attached to `ida` tool results. */
export interface IdaToolDetails {
    action: IdaAction;
    db?: string;
    meta?: OutputMeta;
}
/** IDA Pro tool: lifecycle, structured edits, and Python `exec` against process-wide shared IDBs. */
export declare class IdaTool implements AgentTool<typeof idaSchema, IdaToolDetails> {
    #private;
    private readonly session;
    readonly name = "ida";
    readonly approval: (args: unknown) => ToolApprovalDecision;
    readonly formatApprovalDetails: (args: unknown) => string[];
    readonly label = "IDA";
    readonly summary = "Open, edit, and script IDA Pro databases shared across agents";
    readonly description: string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        action: "close" | "comment" | "exec" | "list" | "make_function" | "open" | "rename" | "save" | "set_type";
        code?: string | undefined;
        db?: string | undefined;
        decl?: string | undefined;
        name?: string | undefined;
        repeatable?: boolean | undefined;
        save?: boolean | undefined;
        target?: string | undefined;
        text?: string | undefined;
        timeout?: number | undefined;
    }, {
        action: "close" | "comment" | "exec" | "list" | "make_function" | "open" | "rename" | "save" | "set_type";
        code?: string | undefined;
        db?: string | undefined;
        decl?: string | undefined;
        name?: string | undefined;
        repeatable?: boolean | undefined;
        save?: boolean | undefined;
        target?: string | undefined;
        text?: string | undefined;
        timeout?: number | undefined;
    }>;
    readonly strict = true;
    readonly loadMode = "discoverable";
    constructor(session: ToolSession);
    /** Create the tool when `ida.enabled` is on. */
    static createIf(session: ToolSession): IdaTool | null;
    execute(_toolCallId: string, params: IdaParams, signal?: AbortSignal, _onUpdate?: AgentToolUpdateCallback<IdaToolDetails>, _context?: AgentToolContext): Promise<AgentToolResult<IdaToolDetails>>;
}
export {};
