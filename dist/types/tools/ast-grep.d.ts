import type { AstGrepToolDetails } from "@oh-my-pi/pi-tui-zh/tools/ast-grep";
import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
import type { ToolExample } from "@oh-my-pi/pi-ai";
import type { ToolSession } from "./index.js";
declare const astGrepSchema: import("@oh-my-pi/omptype").FluentType<{
    lang?: string | undefined;
    pat: string;
    path?: string | undefined;
    skip?: number | undefined;
}, {
    lang?: string | undefined;
    pat: string;
    path?: string | undefined;
    skip?: number | undefined;
}>;
export declare class AstGrepTool implements AgentTool<typeof astGrepSchema, AstGrepToolDetails> {
    private readonly session;
    readonly name = "ast_grep";
    readonly approval: "read";
    readonly label = "AST Grep";
    readonly summary = "Search code with AST patterns (structural grep)";
    get description(): string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        lang?: string | undefined;
        pat: string;
        path?: string | undefined;
        skip?: number | undefined;
    }, {
        lang?: string | undefined;
        pat: string;
        path?: string | undefined;
        skip?: number | undefined;
    }>;
    readonly strict = true;
    readonly examples: readonly ToolExample<typeof astGrepSchema.inferIn>[];
    readonly loadMode = "discoverable";
    constructor(session: ToolSession);
    execute(_toolCallId: string, params: typeof astGrepSchema.infer, signal?: AbortSignal, _onUpdate?: AgentToolUpdateCallback<AstGrepToolDetails>, _context?: AgentToolContext): Promise<AgentToolResult<AstGrepToolDetails>>;
}
export {};
