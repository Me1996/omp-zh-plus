/**
 * MCP JSON-RPC 2.0 over HTTPS.
 *
 * Lightweight utilities for calling MCP servers directly via HTTP
 * without maintaining persistent connections.
 */
import type { FetchImpl } from "@oh-my-pi/pi-ai";
import type { JsonRpcResponse } from "./types.js";
/**
 * Redact credential-bearing query params (e.g. `exaApiKey`) so failed
 * requests never write secrets to the persistent log file.
 */
export declare function redactUrlForLog(url: string): string;
/**
 * Read the matching JSON-RPC response from a JSON or SSE HTTP response.
 *
 * Notifications, server requests, and responses for other request IDs do not
 * satisfy the caller's request. Malformed messages always fail the response.
 */
export declare function readMcpJsonRpcResponse(response: Response, expectedId: string | number, signal?: AbortSignal): Promise<JsonRpcResponse>;
/** Options controlling a single MCP JSON-RPC HTTP request. */
export interface CallMcpOptions {
    signal?: AbortSignal;
    /** Transport override; defaults to global `fetch`. */
    fetch?: FetchImpl;
    /** Extra request headers merged over the JSON-RPC defaults. */
    headers?: Record<string, string>;
    /** Map a non-2xx response (body already read) to the error thrown. */
    onHttpError?: (response: Response, body: string) => Error;
    /** Map a malformed/unmatched JSON-RPC response to the error thrown. */
    onParseError?: (error: unknown) => Error;
}
/**
 * Call an MCP server with JSON-RPC 2.0 over HTTPS.
 *
 * @param url - Full MCP server URL (including any query parameters)
 * @param method - JSON-RPC method name (e.g., "tools/list", "tools/call")
 * @param params - Method parameters
 * @param options - Optional transport controls such as cancellation.
 * @returns Parsed JSON-RPC response
 */
export declare function callMCP(url: string, method: string, params?: Record<string, unknown>, options?: CallMcpOptions): Promise<JsonRpcResponse>;
