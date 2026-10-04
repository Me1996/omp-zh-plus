import type { InternalResource, InternalWriteResult, InternalUrl, ProtocolHandler, ResolveContext, SchemeSpec, UrlCompletion, WriteContext } from "./types.js";
/**
 * Handler for agent:// URLs.
 *
 * Resolves output IDs like "reviewer_0" to their artifact files,
 * with optional JSON extraction.
 */
export declare class AgentProtocolHandler implements ProtocolHandler {
    #private;
    readonly scheme = "agent";
    readonly spec: SchemeSpec;
    promptDoc(): string;
    /**
     * The `<id>.md` output file. JSON-path URLs (`/<json-path>`) render a value
     * rather than the file, so they locate to null, as do missing ids. So does an
     * output superseded by a running turn: a located file is read directly by
     * `read`, which would skip the previous-run banner {@link resolve} adds.
     */
    locate(url: InternalUrl, context?: ResolveContext): Promise<string | null>;
    write(url: InternalUrl, content: string, context?: WriteContext): Promise<InternalWriteResult>;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    complete(): Promise<UrlCompletion[]>;
}
