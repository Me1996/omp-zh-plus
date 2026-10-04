import type { InternalResource, InternalUrl, ProtocolHandler, ResolveContext, SchemeSpec } from "./types.js";
/** Session image attachments (`attachment://1`), located at their original image files. */
export declare class AttachmentProtocolHandler implements ProtocolHandler {
    readonly scheme = "attachment";
    readonly spec: SchemeSpec;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    locate(url: InternalUrl, context?: ResolveContext): Promise<string | null>;
}
