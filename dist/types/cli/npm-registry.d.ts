/** Public npm registry; used when no user configuration names another one. */
export declare const DEFAULT_NPM_REGISTRY = "https://registry.npmjs.org/";
/** Registry resolved for one package: where to fetch its metadata and how to authenticate. */
export interface NpmRegistry {
    /**
     * Registry base URL with a trailing slash, passed to `--registry`. Userinfo
     * is always stripped so credentials never reach error text or child argv;
     * they travel in {@link authorization} instead.
     */
    url: string;
    /** Human-readable origin of {@link url}, for diagnostics. */
    source: string;
    /** `Authorization` header value for metadata requests, when credentials are configured. */
    authorization?: string;
}
/** Maps an npm package name to the registry that serves it. */
export type NpmRegistryResolver = (pkg: string) => NpmRegistry;
type Env = Record<string, string | undefined>;
/** Resolver pinned to a single registry; used when no user configuration applies. */
export declare function fixedNpmRegistry(url?: string, source?: string): NpmRegistryResolver;
/** Test seams for {@link loadNpmRegistryResolver}; production reads the process env and home directory. */
export interface LoadNpmRegistryOptions {
    env?: Env;
    homeDir?: string;
}
/** Read the user's npm/bun registry configuration once and return a per-package resolver. */
export declare function loadNpmRegistryResolver(options?: LoadNpmRegistryOptions): Promise<NpmRegistryResolver>;
/**
 * Metadata URL for `pkg` at `tag` (a dist-tag or version) on `registry`.
 * Scoped names use npm's escaped `@scope%2fname` form, which every registry
 * implementation accepts.
 */
export declare function npmRegistryPackageUrl(registry: NpmRegistry, pkg: string, tag?: string): string;
/** Parse `.npmrc` ini: `key = value` lines, `;`/`#` comments, npm-style `${VAR}` expansion. */
export declare function parseNpmrc(text: string, env: Env, source?: string): Map<string, string>;
export {};
