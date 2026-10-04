import type { AgentTool, AgentToolResult } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "./index.js";
declare const learnSchemaBase: import("@oh-my-pi/omptype").FluentType<{
    context?: string | undefined;
    memory: string;
    skill?: {
        action: "create" | "update";
        body: string;
        description: string;
        name: string;
    } | undefined;
}, {
    context?: string | undefined;
    memory: string;
    skill?: {
        action: "create" | "update";
        body: string;
        description: string;
        name: string;
    } | undefined;
}>;
/** Offered only where a shared bank exists; see {@link isGlobalMemoryScopeAvailable}. */
declare const learnSchemaWithScope: import("@oh-my-pi/omptype").FluentType<{
    context?: string | undefined;
    memory: string;
    scope?: "global" | "project" | undefined;
    skill?: {
        action: "create" | "update";
        body: string;
        description: string;
        name: string;
    } | undefined;
}, {
    context?: string | undefined;
    memory: string;
    scope?: "global" | "project" | undefined;
    skill?: {
        action: "create" | "update";
        body: string;
        description: string;
        name: string;
    } | undefined;
}>;
type LearnSchema = typeof learnSchemaBase | typeof learnSchemaWithScope;
export type LearnParams = typeof learnSchemaWithScope.infer;
/**
 * Orchestrating "learn" tool: persists a lesson to long-term memory and,
 * given a `skill` payload, mints/enhances a managed skill via the shared
 * `writeManagedSkill` primitive. Gated behind `autolearn.enabled` plus a live
 * memory backend — `hindsight`/`mnemopi` (remote/SQLite) or `local` (the
 * file-based rollout backend, where lessons append to `learned.md`).
 */
export declare class LearnTool implements AgentTool<LearnSchema> {
    private readonly session;
    readonly name = "learn";
    /** A global lesson reaches every project's recall, so it needs the same approval as a file write. */
    readonly approval: (args: unknown) => "read" | "write";
    readonly label = "Learn";
    get description(): string;
    get parameters(): LearnSchema;
    readonly strict = true;
    readonly loadMode: "essential";
    readonly summary = "Capture a reusable lesson to memory (and optionally a managed skill)";
    constructor(session: ToolSession);
    static createIf(session: ToolSession): LearnTool | null;
    execute(_id: string, params: LearnParams): Promise<AgentToolResult>;
}
export {};
