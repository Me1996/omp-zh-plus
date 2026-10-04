import type { InternalResource, InternalUrl, ProtocolHandler, ResolveContext, SchemeHost, SchemeSpec, UrlCompletion } from "./types.js";
export declare class RuleProtocolHandler implements ProtocolHandler {
    readonly scheme = "rule";
    /** Virtual: resolved content is the rule body with frontmatter stripped, not the rule file's bytes. */
    readonly spec: SchemeSpec;
    /** Advertised only when the rulebook has addressable rules. */
    promptDoc(host: SchemeHost): string | undefined;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    /** Rule source file (with frontmatter); null for unknown rules and rules with no file on disk. */
    locate(url: InternalUrl, context?: ResolveContext): Promise<string | null>;
    complete(_query?: string, context?: ResolveContext): Promise<UrlCompletion[]>;
}
