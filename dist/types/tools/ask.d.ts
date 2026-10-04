import type { AskToolDetails } from "@oh-my-pi/pi-tui-zh/tools/ask";
import type { AgentTool, AgentToolContext, AgentToolResult, AgentToolUpdateCallback } from "@oh-my-pi/pi-agent-core";
import { type ToolExample } from "@oh-my-pi/pi-ai";
import type { ToolSession } from "./index.js";
export declare const OTHER_OPTION = "Other (type your own)";
declare const askSchema: import("@oh-my-pi/omptype").FluentType<{
    questions: {
        header?: string | undefined;
        id: string;
        multi?: boolean | undefined;
        options: {
            description?: string | undefined;
            label: string;
            preview?: string | undefined;
        }[];
        question: string;
        recommended?: number | undefined;
    }[];
}, {
    questions: {
        header?: string | undefined;
        id: string;
        multi?: boolean | undefined;
        options: {
            description?: string | undefined;
            label: string;
            preview?: string | undefined;
        }[];
        question: string;
        recommended?: number | undefined;
    }[];
}>;
export type AskToolInput = typeof askSchema.infer;
/**
 * Recover valid questions from a persisted `ask` tool call for `/tree` re-answer.
 * Apply live tool-call normalization first so optional null placeholders in saved
 * arguments do not prevent reopening; malformed questions still fail closed.
 */
export declare function recoverAskQuestions(toolCallArguments: unknown): AskToolInput["questions"] | undefined;
type AskParams = AskToolInput;
/**
 * Ask tool for interactive user prompting during execution.
 *
 * Allows gathering user preferences, clarifying instructions, and getting decisions
 * on implementation choices as the agent works.
 */
export declare class AskTool implements AgentTool<typeof askSchema, AskToolDetails> {
    #private;
    private readonly session;
    readonly name = "ask";
    readonly approval: "read";
    readonly label = "Ask";
    readonly summary = "Ask the user a clarifying question";
    readonly description: string;
    readonly parameters: import("@oh-my-pi/omptype").FluentType<{
        questions: {
            header?: string | undefined;
            id: string;
            multi?: boolean | undefined;
            options: {
                description?: string | undefined;
                label: string;
                preview?: string | undefined;
            }[];
            question: string;
            recommended?: number | undefined;
        }[];
    }, {
        questions: {
            header?: string | undefined;
            id: string;
            multi?: boolean | undefined;
            options: {
                description?: string | undefined;
                label: string;
                preview?: string | undefined;
            }[];
            question: string;
            recommended?: number | undefined;
        }[];
    }>;
    readonly strict = true;
    readonly examples: readonly ToolExample<typeof askSchema.infer>[];
    readonly concurrency = "exclusive";
    readonly loadMode = "discoverable";
    constructor(session: ToolSession);
    static createIf(session: ToolSession): AskTool | null;
    execute(_toolCallId: string, params: AskParams, signal?: AbortSignal, _onUpdate?: AgentToolUpdateCallback<AskToolDetails>, context?: AgentToolContext): Promise<AgentToolResult<AskToolDetails>>;
}
export {};
