import type { InternalResource, InternalUrl, ProtocolHandler, ResolveContext, SchemeSpec, UrlCompletion } from "./types.js";
export declare class ArtifactProtocolHandler implements ProtocolHandler {
    readonly scheme = "artifact";
    readonly spec: SchemeSpec;
    promptDoc(): string;
    /** Backing artifact file; null for unknown ids, throws the resolve errors for malformed ones. */
    locate(url: InternalUrl, context?: ResolveContext): Promise<string | null>;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    complete(): Promise<UrlCompletion[]>;
}
