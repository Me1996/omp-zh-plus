/**
 * Registry for handling tool events from subprocess agents.
 *
 * Tools can register handlers to:
 * - Extract structured data from their execution results
 * - Trigger subprocess termination on completion
 * - Provide custom rendering for realtime/final display
 */
import { type SubprocessToolRenderer } from "@oh-my-pi/pi-tui-zh/tools/subprocess";
/** Event from subprocess tool execution (parsed from JSONL) */
export interface SubprocessToolEvent {
    toolName: string;
    toolCallId: string;
    args?: Record<string, unknown>;
    result?: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: unknown;
    };
    isError?: boolean;
}
/** Handler for subprocess tool events */
export interface SubprocessToolHandler<TData = unknown> extends SubprocessToolRenderer<TData> {
    /**
     * Extract structured data from tool result.
     * Extracted data is accumulated in progress.extractedToolData[toolName][].
     */
    extractData?: (event: SubprocessToolEvent) => TData | undefined;
    /**
     * Whether this tool's completion should terminate the subprocess.
     * Return true to send SIGTERM after the tool completes.
     */
    shouldTerminate?: (event: SubprocessToolEvent) => boolean;
}
/** Registry for subprocess tool handlers */
declare class SubprocessToolRegistryImpl {
    #private;
    /**
     * Register a handler for a tool's subprocess events.
     */
    register<T>(toolName: string, handler: SubprocessToolHandler<T>): void;
    /**
     * Get the handler for a tool, if registered.
     */
    getHandler(toolName: string): SubprocessToolHandler | undefined;
    /**
     * Check if a tool has a registered handler.
     */
    hasHandler(toolName: string): boolean;
    /**
     * Get all registered tool names.
     */
    getRegisteredTools(): string[];
}
/** Singleton registry instance */
export declare const subprocessToolRegistry: SubprocessToolRegistryImpl;
/** Type helper for extracted tool data in progress/result */
export type ExtractedToolData = Record<string, unknown[]>;
export {};
