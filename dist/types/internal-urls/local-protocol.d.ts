import type { InternalResource, InternalUrl, LocateOptions, ProtocolHandler, ResolveContext, SchemeSpec, UrlCompletion } from "./types.js";
export interface LocalProtocolOptions {
    getArtifactsDir?: () => string | null;
    getSessionId?: () => string | null;
}
/** Resolve the session-scoped local:// root, shortening long Windows artifact paths before writes hit MAX_PATH. */
export declare function resolveLocalRoot(options: LocalProtocolOptions, platform?: NodeJS.Platform): string;
/**
 * Recursively copy every local:// artifact from one session-scoped root to
 * another. Used when a session transition mints a fresh local root (plan
 * approve-and-execute, handoff) so plans, scratch files, and research notes the
 * carried-forward context references stay readable in the replacement session.
 * No-op when the roots match or the source root is absent.
 */
export declare function copyLocalArtifacts(sourceRoot: string, destinationRoot: string): Promise<void>;
/** Resolve a local:// URL to an on-disk path under the active session's local root. */
export declare function resolveLocalUrlToPath(input: string | InternalUrl, options: LocalProtocolOptions, platform?: NodeJS.Platform): string;
/**
 * On-disk roots the eval helpers (`read`/`write`) substitute for
 * internal-URL schemes so e.g. `write("local://x.md")` lands where a later
 * `read local://x.md` resolves — instead of a literal `local:/` directory under
 * the cwd (a stdlib `pathlib.Path`/`path.resolve` collapses `local://` to
 * `local:/`). Keyed by scheme without the `://`. Currently only `local`, but the
 * shape is a map so additional file-backed schemes can be added without
 * re-plumbing the worker boundary.
 */
export declare function buildEvalUrlRoots(options: LocalProtocolOptions): Record<string, string>;
/**
 * Protocol handler for local:// URLs.
 *
 * URL forms:
 * - local:// - Lists files at the session local root
 * - local://<path> - Reads a file under the session local root
 */
export declare class LocalProtocolHandler implements ProtocolHandler {
    #private;
    readonly scheme = "local";
    /** Session scratch space: `write` persists through its file pipeline via `locate({ create })`, approved at read tier. */
    readonly spec: SchemeSpec;
    /**
     * Install a process-global override that wins over the AgentRegistry-based
     * derivation. Used by top-level SDK consumers that wire
     * `localProtocolOptions` on `createAgentSession`; subagents keep their
     * inherited mapping session-bound.
     */
    static setOverride(value: LocalProtocolOptions | undefined): void;
    /** Reset the process-global override. Test-only. */
    static resetOverrideForTests(): void;
    /**
     * Returns the active local-protocol options.
     *
     * Resolution order:
     * 1. **Caller-supplied** `context.localProtocolOptions` (the actual session
     *    that initiated the `read`/`find`/`search`/`router.resolve` call). This
     *    is what keeps `local://` reads pinned to the calling session in
     *    multi-session hosts (cmux/ACP, embedded SDK consumers) where every
     *    session registers as `kind: "main"` and "first one wins" would route
     *    to the wrong artifacts directory.
     * 2. Explicit process-global override installed via {@link setOverride}
     *    (used by SDK consumers with a custom artifacts/session-id mapping and
     *    by code paths that do not have a calling session, e.g. TUI hyperlink
     *    resolution).
     * 3. The first `main`-kind session in `AgentRegistry.global()`. Its
     *    `SessionManager` supplies both `getArtifactsDir` and `getSessionId`.
     *    Last-resort fallback — every caller that has a session reference
     *    SHOULD thread it through `context` so this branch is never taken in
     *    multi-session setups.
     */
    static resolveOptions(context?: ResolveContext): LocalProtocolOptions | undefined;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    locate(url: InternalUrl, context?: ResolveContext, options?: LocateOptions): Promise<string | null>;
    locateSync(url: InternalUrl, context?: ResolveContext): string | undefined;
    promptDoc(): string;
    complete(_query?: string, context?: ResolveContext): Promise<UrlCompletion[]>;
}
