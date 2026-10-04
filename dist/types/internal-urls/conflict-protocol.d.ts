import type { InternalResource, InternalUrl, InternalWriteResult, ProtocolHandler, ResolveContext, SchemeSpec, WriteContext } from "./types.js";
/** Session-scoped merge-conflict blocks registered by `read`; writable to resolve them. */
export declare class ConflictProtocolHandler implements ProtocolHandler {
    readonly scheme = "conflict";
    readonly spec: SchemeSpec;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    write(url: InternalUrl, content: string, context?: WriteContext): Promise<InternalWriteResult>;
}
