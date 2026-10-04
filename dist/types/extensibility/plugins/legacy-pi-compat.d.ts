import * as path from "node:path";
/**
 * Test seam: whether the extension parse cache opened successfully. Exercises
 * the real eviction + open path, including full WAL-set cleanup on oversized
 * caches (#9549).
 */
export declare function __isExtensionParseCacheAvailableForTests(): boolean;
/**
 * Test seam: close the process-wide extension parse cache connection so the
 * next analysis reopens it at the then-current cache path. Tests that
 * relocate the home/cache root must call this before deleting that root:
 * Windows refuses to remove a directory holding an open SQLite db/WAL set.
 */
export declare function __closeExtensionParseCacheForTests(): void;
/**
 * Compute the package root for the npm prebuilt `dist/cli.js` bundle.
 *
 * `bundle-dist.ts` defines `process.env.PI_BUNDLED="true"`; after bundling,
 * `import.meta.dir` points at `<package>/dist`. Do not resolve the package via
 * bare `@oh-my-pi/pi-coding-agent` here: from a global install Bun can pick an
 * older cache entry, recreating mixed-runtime plugin loading.
 */
export declare function __computeBundledSelfPackageRoot(metaDir: string, pathImpl?: typeof path): string;
/**
 * Resolve the coding-agent compatibility surface that composes omptype's
 * TypeBox facade with legacy `Type.Unsafe`, then drop the remap when that
 * entrypoint is missing.
 *
 * In compiled binaries and npm bundles the surface is served through the
 * `omp-legacy-pi-bundled:` virtual namespace (issue #3423). Dev and source SDK
 * imports use the shipped source module.
 *
 * Exported for tests; production callers use `TYPEBOX_SHIM_PATH`.
 */
export declare function __resolveTypeBoxShimPath(useBundledModules: boolean, sourcePath: string, pathExistsSync?: (p: string) => boolean): string | null;
/**
 * Drop overrides whose filesystem targets are missing so they can fall
 * through to the canonical-resolution path. Virtual `omp-legacy-pi-bundled:`
 * entries always pass because live bundled module references are the source of
 * truth.
 *
 * `pathExistsSync` defaults to `fs.existsSync`; tests inject a stub to
 * simulate the missing-entrypoint failure mode without touching the real FS.
 */
export declare function __validateLegacyPiPackageRootOverrides(candidates: Record<string, string>, pathExistsSync?: (p: string) => boolean): Record<string, string>;
/**
 * Compute the override map keyed by every canonical specifier the host serves
 * directly: the pi-ai / pi-coding-agent roots (compat shims that re-attach
 * legacy helpers) plus, in bundled mode, every build-supplied module key.
 * Subpath coverage stops `@(scope)/pi-ai/oauth` and friends from falling
 * through to the extension's absent peer install.
 */
export declare function __buildLegacyPiPackageRootOverrides(useBundledModules: boolean, bundledModuleKeys?: Iterable<string>): Record<string, string>;
/** Test seam for compiled-binary legacy extension source rewriting. */
export declare function __rewriteLegacyExtensionSourceForTests(source: string, importerPath: string, mtimeTag?: string | null, resolvedImportMtimeTag?: string | null): Promise<string>;
/**
 * Register {@link evaluateGraphCommonJs} as the graph-owned CommonJS require
 * bridge on `globalThis`, first-wins.
 *
 * On source-link installs the `@(scope)/pi-coding-agent` root shim is served
 * from `src/`, so an extension import can evaluate a second instance of this
 * module with empty graph state. An unconditional set would let that empty
 * instance clobber the host bundle's populated bridge and break transitive
 * CommonJS resolution (#6449); guarding preserves the first (host-owned)
 * registration. Idempotent: a subsequent call with a value already present is a
 * no-op.
 */
export declare function ensureGraphCommonJsRequireRegistered(): void;
/** Test seam for compiled-binary dependency graph discovery and rewriting. */
export declare function __collectLegacyPiExtensionSourcesForTests(entryPath: string): Promise<ReadonlyMap<string, string>>;
/**
 * Load a legacy Pi extension module from its real on-disk location.
 *
 * The extension runs in place, so its `import.meta.url` is the real source file
 * and `__dirname`-relative `readFileSync` asset loads (HTML/CSS bundled next to
 * the entry) resolve exactly as they do under the original Pi runtime — no
 * temp-directory mirroring and no asset copying. Graph-scoped `onLoad` hooks
 * rewrite ESM/TS sources and expose evaluated CommonJS namespaces directly.
 */
export declare function loadLegacyPiModule(resolvedPath: string): Promise<unknown>;
export declare function installLegacyPiSpecifierShim(): void;
/** Test seam: clears the memoized canonical specifier resolutions. */
export declare function __resetLegacyPiResolutionCache(): void;
