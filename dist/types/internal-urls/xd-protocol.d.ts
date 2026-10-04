import type { InternalResource, InternalUrl, InternalWriteResult, ProtocolHandler, ResolveContext, SchemeSpec, WriteContext } from "./types.js";
/** Routes session-bound virtual tool devices through `xd://` URLs. */
export declare class XdProtocolHandler implements ProtocolHandler {
    #private;
    readonly scheme = "xd";
    readonly spec: SchemeSpec;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    write(url: InternalUrl, content: string, context?: WriteContext): Promise<InternalWriteResult>;
}
