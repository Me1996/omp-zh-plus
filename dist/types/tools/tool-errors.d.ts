/**
 * Standardized error types for tool execution.
 *
 * Tools should throw these instead of returning error text.
 * The agent loop catches and renders them appropriately.
 */
/**
 * Error thrown when a tool operation is aborted (e.g., via AbortSignal).
 */
export declare class ToolAbortError extends Error {
    static readonly MESSAGE = "Operation aborted";
    constructor(message?: string, options?: ErrorOptions);
}
/**
 * Throw ToolAbortError if the signal is aborted.
 * Use this instead of signal?.throwIfAborted() to get consistent error types.
 */
export declare function throwIfAborted(signal?: AbortSignal): void;
/**
 * Render an error for LLM consumption.
 * Handles ToolError.render() and falls back to message/string.
 */
export declare function renderError(e: unknown): string;
/** Clone-safe error metadata a tool worker sends back across the worker boundary. */
export interface WorkerErrorPayload {
    name: string;
    message: string;
    stack?: string;
    isToolError: boolean;
    isAbort: boolean;
}
/** Serialize a thrown value into {@link WorkerErrorPayload} for a worker `tool-reply`. */
export declare function toWorkerErrorPayload(error: unknown): WorkerErrorPayload;
