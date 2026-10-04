import type { ToolApprovalDecision, ToolTier } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "../tools/index.js";
import type { InternalResource, InternalUrl, InternalWriteResult, LocateOptions, ProtocolHandler, ResolveContext, SchemeHost, SchemeSpec, UrlCompletion, WriteContext } from "./types.js";
/**
 * Routed read/search target.
 * - `file`: a file-backed scheme whose URL located a local path; read it through the filesystem pipeline.
 * - `resource`: anything else; resolve it with {@link InternalUrlRouter.resolve} on `url.href`.
 */
export type UrlTarget = {
    kind: "file";
    url: InternalUrl;
    spec: SchemeSpec;
    path: string;
    sel?: string;
} | {
    kind: "resource";
    url: InternalUrl;
    spec: SchemeSpec;
    sel?: string;
};
/** Process-global scheme registry; tools route internal URLs through its spec-driven API. */
export declare class InternalUrlRouter {
    #private;
    constructor();
    /** Process-global router instance. */
    static instance(): InternalUrlRouter;
    /** Reset the global instance in tests. */
    static resetForTests(): void;
    /**
     * Install (or replace) the handler for `handler.scheme`. Throws when the spec's write
     * policy disagrees with the handler: `write()` exists exactly for `write.via: "handler"`;
     * `write.via: "file"` needs a mutable file-backed spec with `locate()`; a `sandbox` scope
     * needs a linkable `locateSync()` so {@link sandboxRoots} can locate its root.
     */
    register(handler: ProtocolHandler): void;
    /** Whether the router constructor registered `scheme` (case-insensitive): an OMP-owned scheme hosts may not replace. */
    isBuiltin(scheme: string): boolean;
    /** Remove a scheme's handler; true when one was registered. */
    unregister(scheme: string): boolean;
    /** Registered handler for `scheme` (case-insensitive). */
    getHandler(scheme: string): ProtocolHandler | undefined;
    /** Declared spec of a registered scheme (case-insensitive). */
    spec(scheme: string): SchemeSpec | undefined;
    /** Specs of every registered scheme, in registration order. */
    specs(): ReadonlyMap<string, SchemeSpec>;
    /**
     * Rewrite mistyped spellings of a scheme that declares
     * {@link SchemeSpec.singleSlashAlias} to `scheme://x`: the single-slash alias
     * (`local:/x`) and a filesystem path prefixed onto the URL
     * (`/home/me/repo/local://x`). Other inputs pass through.
     */
    normalize(input: string): string;
    /** Whether `input` (after {@link normalize}) is a hierarchical `scheme://` URL of a registered scheme. */
    canHandle(input: string): boolean;
    /**
     * Whether read can resolve this URL through either a native handler or the
     * MCP resource fallback. MCP resources may use arbitrary custom schemes and
     * may be opaque (`urn:example:document`) rather than hierarchical.
     */
    canResolve(input: string): boolean;
    /** Schemes whose handler supports host/path autocomplete. */
    completionSchemes(): string[];
    /**
     * Candidate completions for the host/path portion of `scheme://<query>`.
     * Returns `null` when the scheme is unknown or does not support completion.
     */
    complete(scheme: string, query: string, context?: ResolveContext): Promise<UrlCompletion[] | null>;
    /**
     * {@link normalize} `input`, then peel a trailing read selector per spec.selectors (+portAuthority).
     * Non-URLs and unknown schemes pass through unchanged.
     */
    split(input: string): {
        path: string;
        sel?: string;
    };
    /**
     * A mutating tool's URL target ({@link normalize}d) with a whole-file display selector
     * (`:raw`/`:conflicts`) peeled, so it names the file `read` does. Any other selector — a line
     * range, `raw:1-20`, a malformed `:-10` — throws ToolError: the tool addresses a whole file, and
     * dropping the selector would mutate a file the caller never named. Non-URLs pass through.
     */
    peelWriteSelector(input: string, tool: string): string;
    /** Route a read/search target. null when input is not a router URL (after MCP fallback). */
    target(input: string, context?: ResolveContext): Promise<UrlTarget | null>;
    /** handler.locate on the URL with its read selector peeled; null when the scheme has no locate or the URL has no local backing. */
    locate(input: string, context?: ResolveContext, options?: LocateOptions): Promise<string | null>;
    /**
     * locate or throw ToolError. A locatable, immutable, non-remote scheme resolves from session-local
     * stores, so its resolve error diagnoses the miss (`Cannot find artifact://9: Artifact 9 not found.
     * Available: …`); otherwise `Cannot ${action} ${scheme}:// URL: no local file backs ${input}`
     * (+ a `read` hint for remote/virtual schemes).
     */
    requireLocal(input: string, action: string, context?: ResolveContext, options?: LocateOptions): Promise<string>;
    /**
     * Whether `input` is a registered URL with a glob segment. The authority counts as the first
     * segment unless it is a host ({@link SchemeSpec.portAuthority}). The query (`?key=…`) and
     * fragment never glob, so `issue://?search=fix*` is no glob while `memory://root/?.md` is.
     */
    isGlob(input: string): boolean;
    /** Sync locate for renderers; only schemes with spec.linkable. Never throws. */
    locateSync(input: string, context?: ResolveContext): string | undefined;
    /**
     * Absolute roots of every `sandbox`-scope writable scheme (plan mode keeps them writable), located
     * for `context` through {@link locateSync}; {@link register} requires such schemes to be linkable.
     */
    sandboxRoots(context?: ResolveContext): string[];
    /** Searchable leaf documents behind `input` ({@link ProtocolHandler.enumerate}); null when its scheme cannot enumerate. */
    enumerate(input: string, context?: ResolveContext): Promise<Array<{
        url: string;
        content: string;
    }> | null>;
    /** Parsed URL and scheme spec of a registered `input`, for the `write` tool's routing and gates; undefined for non-URLs. */
    writeTarget(input: string): {
        url: InternalUrl;
        spec: SchemeSpec;
    } | undefined;
    /**
     * Whether file-editing tools (`edit`, `ast_edit`) may write the file `input` locates: its
     * scheme is mutable and tools own its writes (`spec.write.via === "file"`).
     */
    fileWritable(input: string): boolean;
    /**
     * Approval decision for writing `input`: its scheme's `spec.write.tier`. Non-URLs are "write";
     * a registered scheme without `spec.write` is denied at the gate as read-only, never prompted.
     */
    writeTier(input: string, content: string | undefined, session: ToolSession | undefined): ToolApprovalDecision;
    /** Max spec.readTier over every registered `scheme://` occurring ANYWHERE in `text` (substring, fail-closed for delimited paths). Default "read". */
    readTier(text: string): ToolTier;
    /** Rendered promptDoc lines, registration order, for schemes available under `host`. */
    describe(host: SchemeHost): string[];
    /** Resolve an internal URL through its registered protocol handler. */
    resolve(input: string, context?: ResolveContext): Promise<InternalResource>;
    /**
     * Write an internal URL through its registered protocol handler. Returns the
     * handler's model-facing result, if it produced one.
     */
    write(input: string, content: string, context?: WriteContext): Promise<InternalWriteResult | void>;
}
