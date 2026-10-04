import { type ResolveContext } from "./index.js";
/**
 * Resolve Markdown hyperlinks to existing local resources or absolute file URLs.
 * Relative paths use the calling session's cwd; missing, virtual, and remote targets stay unchanged.
 */
export declare function resolveMarkdownLinkTargets(texts: readonly string[], context?: ResolveContext): Promise<ReadonlyMap<string, string>>;
