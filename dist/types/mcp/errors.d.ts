import type { JsonRpcError } from "./types.js";
/** MCP transport used by a failed operation. */
export type MCPTransportKind = "http" | "stdio" | "unknown";
/** Protocol stage at which an MCP operation failed. */
export type MCPFailureStage = "connect" | "send" | "receive" | "decode" | "protocol";
/** Stable failure classes exposed in MCP tool diagnostics. */
export type MCPFailureClass = "connect" | "timeout" | "eof" | "reset" | "malformed_response" | "json_rpc" | "http_status" | "closed" | "unknown";
interface MCPTransportErrorOptions {
    transport: MCPTransportKind;
    stage: MCPFailureStage;
    failure: MCPFailureClass;
    message: string;
    retryable: boolean;
    code?: string | number;
    data?: string;
    traceId?: string;
    cause?: unknown;
}
export declare class MCPTransportError extends Error {
    /** Transport implementation handling the failed operation. */
    readonly transport: MCPTransportKind;
    /** Protocol stage reached before failure. */
    readonly stage: MCPFailureStage;
    /** Stable machine-readable failure classification. */
    readonly failure: MCPFailureClass;
    /** Whether reconnecting and replaying follows the existing safe-retry policy. */
    readonly retryable: boolean;
    /** Transport, HTTP, subprocess, or JSON-RPC error code when available. */
    readonly code: string | number | undefined;
    /** Bounded, credential-redacted JSON-RPC error data. */
    readonly data: string | undefined;
    /** Safe server trace or request identifier. */
    readonly traceId: string | undefined;
    constructor(options: MCPTransportErrorOptions);
}
/** Extract a safe request or trace identifier from MCP HTTP response headers. */
export declare function mcpTraceIdFromHeaders(headers: Headers): string | undefined;
/** Preserve a server-provided JSON-RPC error without exposing credential-shaped data. */
export declare function createMCPJsonRpcError(transport: MCPTransportKind, error: JsonRpcError, traceId?: string): MCPTransportError;
/** Classify an arbitrary transport exception while removing runtime-only advice. */
export declare function normalizeMCPTransportError(error: unknown, options: {
    transport: MCPTransportKind;
    stage: MCPFailureStage;
    traceId?: string;
}): MCPTransportError;
/** Render an MCP tool failure as stable, actionable diagnostic fields. */
export declare function formatMCPToolFailure(error: unknown, serverName: string, toolName: string): string;
export {};
