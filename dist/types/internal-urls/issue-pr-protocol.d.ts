import type { InternalResource, InternalUrl, ProtocolHandler, ResolveContext, SchemeSpec } from "./types.js";
/**
 * Handler for `issue://` URLs.
 */
export declare class IssueProtocolHandler implements ProtocolHandler {
    readonly scheme = "issue";
    readonly spec: SchemeSpec;
    /** Advertised when `gh` is on PATH; the entry documents `pr://` too. */
    promptDoc(): string | undefined;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
}
/**
 * Handler for `pr://` URLs.
 */
export declare class PrProtocolHandler implements ProtocolHandler {
    readonly scheme = "pr";
    readonly spec: SchemeSpec;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
}
