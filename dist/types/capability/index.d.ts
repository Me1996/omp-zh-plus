import type { Settings } from "../config/settings.js";
import type { Capability, CapabilityInfo, CapabilityResult, LoadContext, LoadOptions, Provider, ProviderInfo } from "./types.js";
/**
 * Define a new capability.
 */
export declare function defineCapability<T>(def: Omit<Capability<T>, "providers">): Capability<T>;
/**
 * Register a provider for a capability.
 */
export declare function registerProvider<T>(capabilityId: string, provider: Provider<T>): void;
/**
 * Load a capability by ID.
 */
export declare function loadCapability<T>(capabilityId: string, options?: LoadOptions<T>): Promise<CapabilityResult<T>>;
/** Whether `providerId` is a foreign tool whose `~/` config is opt-in. */
export declare function isForeignUserProvider(providerId: string): boolean;
/**
 * Check whether a user-level (~/...) config source is enabled.
 * Native (.omp) and .agents directories are enabled by default.
 * Foreign tool directories (~/.cursor, ~/.codex, ~/.claude, etc.) are opt-in
 * via `enabledProviders`. Project-level (cwd) config is unaffected; see
 * {@link isProviderEnabled} for the whole-provider switch.
 */
export declare function isUserSourceEnabled(source: string, ctx?: LoadContext): boolean;
/** Opt a foreign provider's `~/` config in. */
export declare function enableUserSource(providerId: string): void;
/** Opt a foreign provider's `~/` config out (project config keeps loading). */
export declare function disableUserSource(providerId: string): void;
/**
 * Bind the capability system to `activeSettings`: provider switches are read live
 * from its `enabledProviders`/`disabledProviders` (settings UI, `set()` from any
 * caller, on-disk reloads — the next discovery pass sees them) and persisted to it.
 * Holds stack: the newest outstanding hold is bound, and releasing it (the returned
 * function) hands the binding back to the previous hold. The release is idempotent
 * and never ends another holder's hold.
 */
export declare function initializeWithSettings(activeSettings: Settings): () => void;
/**
 * Disable a provider globally (across all capabilities).
 */
export declare function disableProvider(providerId: string): void;
/**
 * Enable a previously disabled provider.
 */
export declare function enableProvider(providerId: string): void;
/**
 * Check if a provider is enabled (the whole-provider switch backed by
 * `disabledProviders`). Foreign `~/` config additionally needs
 * {@link isUserSourceEnabled}.
 */
export declare function isProviderEnabled(providerId: string): boolean;
/**
 * Get list of all disabled provider IDs.
 */
export declare function getDisabledProviders(): string[];
/**
 * Set disabled providers from a list (replaces current set), persisting to the bound settings.
 */
export declare function setDisabledProviders(providerIds: string[]): void;
/**
 * Get list of all explicitly enabled provider IDs.
 */
export declare function getEnabledProviders(): string[];
/**
 * Set enabled providers from a list (replaces current set), persisting to the bound settings.
 */
export declare function setEnabledProviders(providerIds: string[]): void;
/**
 * Get a capability definition (for introspection).
 */
export declare function getCapability<T>(id: string): Capability<T> | undefined;
/**
 * List all registered capability IDs.
 */
export declare function listCapabilities(): string[];
/**
 * Get capability info for UI display.
 */
export declare function getCapabilityInfo(capabilityId: string): CapabilityInfo | undefined;
/**
 * Get all capabilities info for UI display.
 */
export declare function getAllCapabilitiesInfo(): CapabilityInfo[];
/**
 * Get provider info for UI display.
 */
export declare function getProviderInfo(providerId: string): ProviderInfo | undefined;
/**
 * Get all providers info for UI display (deduplicated across capabilities).
 */
export declare function getAllProvidersInfo(): ProviderInfo[];
/**
 * Reset all caches. Call after chdir or filesystem changes.
 */
export declare function reset(): void;
/**
 * Reset capability registry settings and provider state. Test-only.
 */
export declare function resetCapabilityForTests(): void;
/**
 * Invalidate cache for a specific path.
 * @param filePath - Absolute or relative path to invalidate
 */
export declare function invalidate(filePath: string, cwd?: string): void;
/**
 * Get cache stats for diagnostics.
 */
export declare function cacheStats(): {
    content: number;
    dir: number;
};
export type * from "./types.js";
