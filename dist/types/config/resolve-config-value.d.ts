/** Materialize request headers for models and discovery without property-access side effects. */
export type ConfigHeaderResolver = (signal?: AbortSignal) => Promise<Record<string, string> | undefined>;
/** One raw header layer or previously composed request-time resolver. */
export type ConfigHeaderSource = Record<string, string> | ConfigHeaderResolver | undefined;
/** Optional bearer-header derivation applied after explicitly configured header layers. */
export interface ConfigHeaderResolutionOptions {
    authHeader?: boolean;
    apiKeyConfig?: string;
}
/** Identify command-backed values when collecting credentials that must be invalidated together. */
export declare function isCommandConfigValue(valueConfig: string | undefined): valueConfig is string;
/** Invalidate one command-backed value, including its failure backoff and pending cache generation. */
export declare function invalidateCommandConfig(valueConfig: string | undefined): void;
/** Invalidate every command-backed value without cancelling shared in-flight processes. */
export declare function invalidateAllCommandConfigs(): void;
/**
 * Resolve a configuration value. Command values execute asynchronously and
 * successful stdout is cached; environment-backed and literal values stay live.
 */
export declare function resolveConfigValue(valueConfig: string): Promise<string | undefined>;
/**
 * Run one command-backed value with isolated stdio and a bounded process tree.
 * POSIX uses an absolute shell, a detached process group, and Linux subreaper
 * supervision so descendants cannot survive timeout. Windows retains Brush's
 * established shell grammar and native process-tree cancellation.
 */
export declare function runShellCommand(command: string, timeoutMs: number, cwd?: string): Promise<string | undefined>;
/** Resolve one raw header record, preserving declaration order and omitting empty values. */
export declare function resolveConfigHeaders(headers: Record<string, string> | undefined, signal?: AbortSignal): Promise<Record<string, string> | undefined>;
/**
 * Compose raw config headers and already-composed async header resolvers.
 * Later sources win. The returned resolver materializes a plain record at the
 * request boundary; no property access executes commands.
 */
export declare function createConfigHeaderResolver(sources: readonly ConfigHeaderSource[], options?: ConfigHeaderResolutionOptions): ConfigHeaderResolver | undefined;
/** Clear all command state. Exported for focused resolver tests. */
export declare function clearConfigValueCache(): void;
