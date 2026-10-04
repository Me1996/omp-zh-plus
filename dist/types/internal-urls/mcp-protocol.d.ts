import type { InternalResource, InternalUrl, ProtocolHandler, SchemeSpec } from "./types.js";
/**
 * Protocol handler for MCP resources.
 *
 * URL forms:
 * - mcp://<resource-uri> (e.g. mcp://test://notes, mcp://ibkr://portfolio/positions)
 * - A resource's native URI when its scheme has no OMP handler (e.g. ags://capabilities/current-host)
 */
export declare class McpProtocolHandler implements ProtocolHandler {
    readonly scheme = "mcp";
    readonly spec: SchemeSpec;
    /**
     * Always advertised: the system prompt is built before MCP discovery settles
     * (`MCPManager.instance()` and its server set are populated asynchronously),
     * so there is no reliable synchronous "has servers" signal at prompt time.
     */
    promptDoc(): string;
    resolve(url: InternalUrl): Promise<InternalResource>;
}
