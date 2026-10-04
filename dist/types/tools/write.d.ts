import type { WriteToolDetails } from "@oh-my-pi/pi-tui-zh/tools/write";
import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback, ToolApprovalDecision } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "../sdk.js";
declare const writeSchema: import("@oh-my-pi/omptype").FluentType<{
    content?: string | undefined;
    path: string;
}, {
    content?: string | undefined;
    path: string;
}>;
/** Write arguments; `content` may be omitted only where the target scheme's write policy allows it. */
export type WriteToolInput = typeof writeSchema.infer;
type WriteParams = WriteToolInput;
/**
 * Write tool implementation.
 *
 * Creates or overwrites files with optional LSP formatting and diagnostics.
 */
export declare class WriteTool implements AgentTool<typeof writeSchema, WriteToolDetails> {
    #private;
    private readonly session;
    readonly name = "write";
    readonly approval: (args: unknown) => ToolApprovalDecision;
    readonly formatApprovalDetails: (args: unknown) => string[];
    readonly label = "Write";
    get description(): string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        content?: string | undefined;
        path: string;
    }, {
        content?: string | undefined;
        path: string;
    }>;
    readonly strict = true;
    readonly concurrency = "exclusive";
    readonly loadMode = "essential";
    /** Stream matchers should see the real file content, not its JSON-escaped argument encoding. */
    matcherDigest(args: unknown): string | undefined;
    constructor(session: ToolSession);
    execute(_toolCallId: string, { path: rawPath, content: rawContent }: WriteParams, signal?: AbortSignal, onUpdate?: AgentToolUpdateCallback<WriteToolDetails>, context?: AgentToolContext): Promise<AgentToolResult<WriteToolDetails>>;
}
export {};
