import type { AgentTool, AgentToolResult, AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
import type { FindToolDetails } from "@oh-my-pi/pi-tui-zh/tools/find";
import type { ToolSession } from "../index.js";
declare const findSchema: import("@oh-my-pi/omptype").FluentType<{
    grep_keywords: string[];
    path?: string | undefined;
    query: string;
}, {
    grep_keywords: string[];
    path?: string | undefined;
    query: string;
}>;
export type FindToolInput = typeof findSchema.infer;
/**
 * Resolve `find.enabled` for a session: `auto` enables `find` only when the
 * judge role is backed by a native System One model ({@link hasNativeJudge})
 * rather than a prompted small model. Gates tool creation and the `find` hints
 * in sibling tool prompts.
 */
export declare function isFindEnabled(session: ToolSession): boolean;
/** Semantic search tool: describe a behavior, get files and line ranges that implement it. */
export declare class FindTool implements AgentTool<typeof findSchema, FindToolDetails> {
    private readonly session;
    readonly name = "find";
    readonly approval: "read";
    readonly loadMode = "essential";
    readonly label = "Find";
    readonly summary = "Semantic grep: find files and line ranges by describing what they do";
    readonly description: string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        grep_keywords: string[];
        path?: string | undefined;
        query: string;
    }, {
        grep_keywords: string[];
        path?: string | undefined;
        query: string;
    }>;
    readonly strict = true;
    constructor(session: ToolSession);
    execute(_toolCallId: string, params: FindToolInput, signal?: AbortSignal, onUpdate?: AgentToolUpdateCallback<FindToolDetails>): Promise<AgentToolResult<FindToolDetails>>;
}
export {};
