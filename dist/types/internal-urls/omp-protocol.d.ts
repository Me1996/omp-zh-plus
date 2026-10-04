import type { InternalResource, InternalUrl, ProtocolHandler, ResolveContext, SchemeSpec, UrlCompletion } from "./types.js";
/**
 * Handler for omp:// URLs.
 *
 * Resolves documentation file names to their content, or lists available docs.
 */
export declare class OmpProtocolHandler implements ProtocolHandler {
    #private;
    readonly scheme = "omp";
    readonly spec: SchemeSpec;
    /** Always advertised: harness docs are embedded in every build. */
    promptDoc(): string;
    resolve(url: InternalUrl): Promise<InternalResource>;
    /** The docs root expands to every embedded doc; a single-doc URL yields that doc (or throws when unknown). */
    enumerate(url: InternalUrl, context?: ResolveContext): Promise<Array<{
        url: string;
        content: string;
    }>>;
    complete(): Promise<UrlCompletion[]>;
}
