import type { AstEditToolDetails } from "@oh-my-pi/pi-tui-zh/tools/ast-edit";
import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback, ToolApprovalDecision } from "@oh-my-pi/pi-agent-core";
import type { ToolExample } from "@oh-my-pi/pi-ai";
import type { ToolSession } from "./index.js";
declare const astEditSchema: import("@oh-my-pi/omptype").FluentType<{
    ops: {
        out: string;
        pat: string;
    }[];
    paths: string[];
}, {
    ops: {
        out: string;
        pat: string;
    }[];
    paths: string[];
}>;
type AstEditSchemaInfer = typeof astEditSchema.infer;
export declare class AstEditTool implements AgentTool<typeof astEditSchema, AstEditToolDetails> {
    private readonly session;
    readonly name = "ast_edit";
    /** Strictest write decision ({@link strictestApproval}) over every path; "write" when none is given. */
    readonly approval: (args: unknown) => ToolApprovalDecision;
    readonly formatApprovalDetails: (args: unknown) => string[];
    readonly label = "AST Edit";
    readonly summary = "Perform AST-aware code edits (structural refactoring)";
    readonly description: string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        ops: {
            out: string;
            pat: string;
        }[];
        paths: string[];
    }, {
        ops: {
            out: string;
            pat: string;
        }[];
        paths: string[];
    }>;
    readonly strict = true;
    readonly examples: readonly ToolExample<AstEditSchemaInfer>[];
    readonly deferrable = true;
    readonly loadMode = "discoverable";
    constructor(session: ToolSession);
    execute(_toolCallId: string, params: AstEditSchemaInfer, signal?: AbortSignal, _onUpdate?: AgentToolUpdateCallback<AstEditToolDetails>, _context?: AgentToolContext): Promise<AgentToolResult<AstEditToolDetails>>;
}
export {};
