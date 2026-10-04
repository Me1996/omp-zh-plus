import type { MemoryRetainDetails } from "@oh-my-pi/pi-tui-zh/tools/memory";
import type { AgentTool, AgentToolResult } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "./index.js";
declare const memoryRetainSchemaBase: import("@oh-my-pi/omptype").FluentType<{
    items: {
        content: string;
        context?: string | undefined;
    }[];
}, {
    items: {
        content: string;
        context?: string | undefined;
    }[];
}>;
/** Offered only where a shared bank exists; see {@link isGlobalMemoryScopeAvailable}. */
declare const memoryRetainSchemaWithScope: import("@oh-my-pi/omptype").FluentType<{
    items: {
        content: string;
        context?: string | undefined;
        scope?: "global" | "project" | undefined;
    }[];
}, {
    items: {
        content: string;
        context?: string | undefined;
        scope?: "global" | "project" | undefined;
    }[];
}>;
type MemoryRetainSchema = typeof memoryRetainSchemaBase | typeof memoryRetainSchemaWithScope;
export type MemoryRetainParams = typeof memoryRetainSchemaWithScope.infer;
export declare class MemoryRetainTool implements AgentTool<MemoryRetainSchema, MemoryRetainDetails> {
    private readonly session;
    readonly name = "retain";
    /** A global item reaches every project's recall, so it needs the same approval as a file write. */
    readonly approval: (args: unknown) => "read" | "write";
    readonly label = "Retain";
    get description(): string;
    get parameters(): MemoryRetainSchema;
    readonly strict = true;
    readonly loadMode = "discoverable";
    readonly summary = "Store important facts in long-term memory";
    constructor(session: ToolSession);
    static createIf(session: ToolSession): MemoryRetainTool | null;
    execute(_id: string, params: MemoryRetainParams): Promise<AgentToolResult<MemoryRetainDetails>>;
}
export {};
