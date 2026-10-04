import { SecurityStore } from "../security/store.js";
import type { InternalResource, InternalUrl, ProtocolHandler, ResolveContext, SchemeHost, SchemeSpec, UrlCompletion } from "./types.js";
export type SecurityStoreResolver = (cwd: string, signal?: AbortSignal) => Promise<SecurityStore>;
export declare function isSecurityEnabled(): boolean;
export declare class SecurityDisabledError extends Error {
    constructor();
}
export declare class SecurityProtocolHandler implements ProtocolHandler {
    #private;
    readonly scheme = "security";
    readonly spec: SchemeSpec;
    constructor(resolveStore?: SecurityStoreResolver, enabled?: () => boolean);
    /** Advertised only when `security.enabled` is on for the session. */
    promptDoc(host: SchemeHost): string | undefined;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    complete(query?: string, context?: ResolveContext): Promise<UrlCompletion[]>;
}
