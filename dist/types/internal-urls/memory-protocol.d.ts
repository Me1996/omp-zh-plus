import type { InternalResource, InternalUrl, LocateOptions, ProtocolHandler, ResolveContext, SchemeHost, SchemeSpec, UrlCompletion } from "./types.js";
/**
 * Protocol handler for memory:// URLs.
 * Binds the URL to the session that issued it: the caller's own memory
 * backend decides how `memory://<id>` is answered, and its cwd decides which
 * file-backed root is read. Callers that name no identity keep the legacy
 * registry-wide lookup.
 */
export declare class MemoryProtocolHandler implements ProtocolHandler {
    readonly scheme = "memory";
    readonly spec: SchemeSpec;
    /** Advertised only when the session's memory backend owns the file-backed `memory://root` namespace. */
    promptDoc(host: SchemeHost): string | undefined;
    /**
     * File backing `memory://root[/<path>]` for a local-backend caller; null for
     * mnemopi ids, non-local backends, and missing entries without `create`.
     */
    locate(url: InternalUrl, context?: ResolveContext, options?: LocateOptions): Promise<string | null>;
    locateSync(url: InternalUrl): string | undefined;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    complete(_query?: string, context?: ResolveContext): Promise<UrlCompletion[]>;
}
