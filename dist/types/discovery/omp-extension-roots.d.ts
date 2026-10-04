import type { ExtensionRootMode, LoadContext } from "../capability/types.js";
/** A resolved extension package directory wired into the discovery surfaces. */
export interface OmpExtensionRoot {
    /** Absolute path to the package directory. */
    path: string;
    /** Stable display name (basename of the package directory). */
    name: string;
    /** Scope from which the path was sourced. */
    level: "user" | "project";
}
/** Extension sub-discovery mode; re-exported alias of {@link ExtensionRootMode}. */
export type OmpExtensionRootMode = ExtensionRootMode;
export interface InjectOmpExtensionCliRootOptions {
    /**
     * `explicit-only` exposes only roots named by this CLI invocation. Use it
     * with `--no-extensions` so configured and installed packages cannot
     * contribute sibling capabilities through the `omp-plugins` provider.
     */
    mode?: OmpExtensionRootMode;
    /** Replace roots from an earlier invocation instead of extending them. */
    replace?: boolean;
}
/**
 * Run one SDK invocation with its own extension-package roots. Async resources
 * started inside `callback` retain this scope, including discovery deliberately
 * deferred until the end of session startup. Raw relative paths are resolved by
 * {@link listOmpExtensionRoots} against that invocation's active cwd.
 */
export declare function withOmpExtensionRootScope<T>(paths: readonly string[], mode: OmpExtensionRootMode, callback: () => T): T;
/**
 * Record the owning session's effective `extensions` setting (and its
 * `Settings`-resolved provenance) on the active invocation scope so
 * sub-discovery honors overlays/runtime overrides and foreign project
 * providers without reading the process-global settings singleton. No-op
 * outside a {@link withOmpExtensionRootScope} callback.
 */
export declare function setInvocationConfiguredExtensions(paths: readonly string[], level?: "user" | "project"): void;
/**
 * Register CLI-provided extension package paths (e.g. from `--extension`/`-e`)
 * so the sub-discovery providers can find their sibling `skills/`, `hooks/`,
 * etc. Paths that do not resolve to a directory are silently dropped — file
 * entrypoints have no package sub-tree to scan.
 *
 * Call once during startup before any capability load. Repeated calls extend
 * the registered set; {@link clearOmpExtensionCliRoots} resets for tests.
 */
export declare function injectOmpExtensionCliRoots(paths: readonly string[], home: string, cwd: string, options?: InjectOmpExtensionCliRootOptions): void;
/** Drop every CLI-injected root. Tests use this between cases. */
export declare function clearOmpExtensionCliRoots(): void;
/** Inspect currently-injected CLI roots (read-only). Exposed for diagnostics + tests. */
export declare function getInjectedOmpExtensionCliRoots(): readonly OmpExtensionRoot[];
/**
 * Resolve every configured extension package directory for the given context.
 *
 * Sources are threaded as one `EffectiveExtensionRoots` value — from
 * `ctx.extensionRoots` (a post-startup reload), else the invocation scope
 * (a construction-time load), else the process defaults (CLI injection + disk).
 * The three lanes stay separate so no dimension is lost:
 *
 * 1. Explicit lane — `explicit` roots (SDK `additionalExtensionPaths` / CLI
 *    `--extension`). Always active, always user-level.
 * 2. Configured lane — the effective `extensions:` setting, added only in
 *    `merge` mode. Its provenance (`configuredLevel`) is carried from
 *    `Settings` (the authority that merges every project provider, incl.
 *    `.claude/settings.json`, and honors overlays/overrides), never re-derived
 *    from a partial `.omp` disk scan; scopeless callers read the persisted
 *    `.omp` config, which supplies its own level.
 * 3. Installed npm/link plugins under `<plugins>/node_modules/`, added only in
 *    `merge` mode. Marketplace installs load via the `claude-plugins` provider.
 *
 * `explicit-only` mode (an SDK `disableExtensionDiscovery` session) contributes
 * the explicit lane alone — no ambient `extensions:`, installed plugins, or
 * disk config — identically inside and outside the construction scope.
 *
 * Only entries that resolve to a directory on disk are returned; file
 * entrypoints contribute zero sub-discovery surface and are filtered out.
 * Installed-plugin enumeration failures degrade gracefully at `debug`.
 */
export declare function listOmpExtensionRoots(ctx: LoadContext): Promise<OmpExtensionRoot[]>;
