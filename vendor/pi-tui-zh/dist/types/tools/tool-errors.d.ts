/** Structured tool failure shared by selector parsing and host tool execution. */
export declare class ToolError extends Error {
    readonly context?: Record<string, unknown> | undefined;
    constructor(message: string, context?: Record<string, unknown> | undefined);
    /** Render error for LLM consumption. Override for custom formatting. */
    render(): string;
}
