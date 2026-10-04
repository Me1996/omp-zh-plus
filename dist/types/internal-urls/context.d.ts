/**
 * Session-derived caller contexts for the internal URL router. Tools build
 * their {@link ResolveContext}/{@link WriteContext} here instead of assembling
 * per-tool literals, so every handler sees the same caller identity.
 */
import type { ToolSession } from "../tools/index.js";
import type { LocalProtocolOptions } from "./local-protocol.js";
import type { ResolveContext, WriteContext } from "./types.js";
/**
 * The session's `local://` mapping: its pinned {@link LocalProtocolOptions}
 * (subagents and multi-session hosts pin a parent/foreign root) or else its own
 * artifacts dir and session id, so `local://` never falls through to another
 * session's root.
 */
export declare function sessionLocalProtocolOptions(session: ToolSession): LocalProtocolOptions;
/**
 * Router-facing `local://` mapping: a session with neither pinned options nor
 * its own artifacts dir defers to the process mapping (LocalProtocolHandler
 * override, then the registry's main session) instead of pinning a null root.
 */
export declare function contextLocalProtocolOptions(session: ToolSession): LocalProtocolOptions | undefined;
/** The single ResolveContext builder for a tool session; replaces per-tool literal assembly. */
export declare function sessionResolveContext(session: ToolSession, options?: {
    signal?: AbortSignal;
    skipDirectoryListing?: boolean;
}): ResolveContext;
/** The single WriteContext builder for a tool session; replaces per-tool literal assembly. */
export declare function sessionWriteContext(session: ToolSession, options?: {
    signal?: AbortSignal;
    toolCall?: WriteContext["toolCall"];
}): WriteContext;
