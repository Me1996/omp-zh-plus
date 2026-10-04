import type { InternalResource, InternalUrl, LocateOptions, ProtocolHandler, ResolveContext, SchemeHost, SchemeSpec, UrlCompletion } from "./types.js";
/**
 * Handler for skill:// URLs.
 */
export declare class SkillProtocolHandler implements ProtocolHandler {
    readonly scheme = "skill";
    readonly spec: SchemeSpec;
    /** Advertised only when loaded skills are readable through an active tool. */
    promptDoc(host: SchemeHost): string | undefined;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    /**
     * Skill file or directory; `options.directory` maps a bare `skill://<name>` to the skill base dir.
     * Null for a missing entry (or dangling symlink) without `create`, plugin skill or not.
     */
    locate(url: InternalUrl, context?: ResolveContext, options?: LocateOptions): Promise<string | null>;
    complete(): Promise<UrlCompletion[]>;
}
