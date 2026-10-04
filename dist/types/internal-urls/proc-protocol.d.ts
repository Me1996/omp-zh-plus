import type { InternalResource, InternalUrl, InternalWriteResult, LocateOptions, ProtocolHandler, ResolveContext, SchemeSpec, WriteContext } from "./types.js";
/** Caller-visible background jobs and project services. Reads never acknowledge delivery. */
export declare class ProcProtocolHandler implements ProtocolHandler {
    readonly scheme = "proc";
    readonly spec: SchemeSpec;
    promptDoc(): string;
    /**
     * A project service's output log. Jobs and running agents have no log file,
     * so their URLs (and the listing) locate to null. Never contacts the daemon broker.
     */
    locate(url: InternalUrl, context?: ResolveContext, options?: LocateOptions): Promise<string | null>;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    write(url: InternalUrl, content: string, context?: WriteContext): Promise<InternalWriteResult>;
}
