/**
 * TUI rendering for MCP tools.
 *
 * Provides structured display of MCP tool calls and results,
 * showing args and output in JSON tree format similar to task tool.
 */
import { type Component } from "../index.js";
import type { NativeToolView, RenderResultOptions } from "./renderer.js";
import { type Theme } from "../theme/theme.js";
/**
 * Render MCP tool call.
 */
export declare function renderMCPCall(args: Record<string, unknown>, theme: Theme, label: string): Component;
/**
 * Render MCP tool result.
 */
export declare function renderMCPResult(result: {
    content: Array<{
        type: string;
        text?: string;
    }>;
    details?: MCPToolDetails;
    isError?: boolean;
}, options: RenderResultOptions, theme: Theme, args?: Record<string, unknown>): Component;
/** Native MCP call view: the head only, inline while pending. */
export declare function describeMCPCall(args: Record<string, unknown>, label: string): NativeToolView;
/**
 * Native MCP result view: JSON output as a JSON tree, Markdown when the
 * preference is on, otherwise the raw text as tool output. The head's args
 * summary stands in for the ANSI card's Args tree.
 */
export declare function describeMCPResult(result: {
    content: Array<{
        type: string;
        text?: string;
    }>;
    details?: MCPToolDetails;
    isError?: boolean;
}, _options: RenderResultOptions, args?: Record<string, unknown>): NativeToolView | undefined;
import type { OutputMeta } from "./output-meta.js";
/** Set whether plain MCP text results render as Markdown. */
export declare function setMcpRenderMarkdownResults(enabled: boolean): void;
/** Content types in tool results */
export interface MCPTextContent {
    type: "text";
    text: string;
}
/** Base64-encoded image returned by an MCP tool. */
export interface MCPImageContent {
    type: "image";
    data: string;
    mimeType: string;
}
/** Embedded text or binary resource returned by an MCP tool. */
export interface MCPResourceContent {
    type: "resource";
    resource: {
        uri: string;
        mimeType?: string;
        text?: string;
        blob?: string;
    };
}
/** Supported MCP result content blocks retained in display metadata. */
export type MCPContent = MCPTextContent | MCPImageContent | MCPResourceContent;
/** MCP result details shared by renderers and programmatic tool consumers. */
export interface MCPToolDetails {
    /** Server name */
    serverName: string;
    /** Original MCP tool name */
    mcpToolName: string;
    /** Whether the call resulted in an error */
    isError?: boolean;
    /** Raw content from MCP response */
    rawContent?: MCPContent[];
    /** Server-supplied structured data, independent of the model-facing text rendering. */
    structuredContent?: Record<string, unknown>;
    /** Structured metadata from the MCP response */
    mcpMeta?: Record<string, unknown>;
    /** Provider ID (e.g., "claude", "mcp-json") */
    provider?: string;
    /** Provider display name (e.g., "Claude Code", "MCP Config") */
    providerName?: string;
    /** Structured output metadata (set by the spill wrapper when output is truncated to an artifact). */
    meta?: OutputMeta;
}
/** Registry prefix every minted MCP tool name carries. */
export declare const MCP_TOOL_NAME_PREFIX = "mcp__";
/**
 * Parse an MCP tool name back to server and tool components.
 *
 * Note: This returns the normalized tool name (with server prefix stripped).
 * The original MCP tool name may have had the server name as a prefix.
 */
export declare function parseMCPToolName(name: string): {
    serverName: string;
    toolName: string;
} | null;
