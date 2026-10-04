/**
 * Layered settings store (global config, project, `--config` overlay, runtime overrides) with
 * background persistence. Values are typed and read through registry handles
 * (see `./registry`), declared next to their domain and collected by `./all-settings`:
 *
 *   cfgCompactionEnabled.get(settings);         // sync read
 *   cfgThemeDark.set(settings, "titanium");     // sync write, saves in background
 *
 * For tests:
 *   const isolated = Settings.isolated({ "compaction.enabled": false });
 */
import * as path from "node:path";
import { procmgr } from "@oh-my-pi/pi-utils";
import type { ModelRole } from "../config/model-roles.js";
import { AgentStorage } from "../session/agent-storage.js";
import { type AnySetting, type ValueCacheEntry, type WarnState } from "./registry.js";
import "./all-settings.js";
/** Settings layer that supplies an effective value; see {@link Settings.getProvenance}. */
export type SettingProvenance = "env" | "runtime" | "overlay" | "project" | "global" | "default";
/** Raw settings object as stored in YAML */
export interface RawSettings {
    [key: string]: unknown;
}
export interface SettingsOptions {
    /** Current working directory for project settings discovery */
    cwd?: string;
    /** Agent directory for config.yml/config.yaml storage */
    agentDir?: string;
    /** Don't persist to disk (for tests) */
    inMemory?: boolean;
    /** Read config sources without opening storage or writing migrations */
    readOnly?: boolean;
    /** Initial runtime overrides, keyed by setting id (legacy ids migrate; values are checked like `override`). */
    overrides?: Readonly<Record<string, unknown>>;
    /** Extra config.yml-style overlays loaded after global/project settings */
    configFiles?: string[];
}
/** One instance's own layers, lowest precedence first. */
interface OwnLayers {
    global: RawSettings;
    project: RawSettings;
    configOverlay: RawSettings;
    overrides: RawSettings;
}
/** The layers an {@link Settings.overlay} child writes locally; see {@link Settings.overlayLayers}. */
export type OverlayLayers = Readonly<Pick<OwnLayers, "global" | "overrides">>;
/**
 * Drop entries from capability-provided project settings whose non-object
 * value would shadow an entire settings group. `.claude/settings.json` is
 * shared with other tools, and a foreign leaf like `"tui": "fullscreen"`
 * deep-merges over omp's `tui` group, silently replacing every `tui.*`
 * setting for sessions rooted in that project. Values at schema leaves,
 * unknown keys, and well-formed nested objects pass through unchanged.
 */
export declare function dropSettingsGroupShadows(data: RawSettings, sourcePath: string, basePrefix?: string): RawSettings;
/** Receives the setting whose effective value changed (see {@link Settings.onEffectiveChange}). */
type SettingChangeListener = (setting: AnySetting) => void;
/**
 * Split a dangling symlink target into the physical path segments the flush
 * walk should follow. Three platform-correctness rules that a naive
 * `target.split(/[\\/]+/)` gets wrong:
 *
 *  1. Root double-count. An ABSOLUTE target seeds the accumulator at
 *     `parse(target).root` — `C:\` on Windows, the `\\server\share\` prefix of
 *     a UNC path, `/` on POSIX. The root must therefore be STRIPPED from the
 *     string before splitting; otherwise it is re-emitted as a leading segment
 *     and `C:\managed\final.yml` resolves to `C:\` + `C:` + `managed` + … =
 *     `C:\C:\managed\final.yml`, so the flush fails against a dangling absolute
 *     link on Windows. (POSIX escaped this by luck: the leading `/` splits to an
 *     empty leading segment that the walk already skips.) A RELATIVE target
 *     seeds at the link's real parent dir and keeps every segment unchanged.
 *  2. Separator set. `\` is a separator only on Windows. On POSIX it is a valid
 *     filename character, so a target literally named `managed\config.yml` must
 *     stay ONE segment, not two. Split on the platform separator set: `/` only
 *     on POSIX, `/` or `\` on Windows. Keyed off `pathApi.sep` so the rule is
 *     driven by the platform, not a hardcoded cross-platform class.
 *  3. Dot segments. POSIX follows each component physically, so `..` stays a
 *     raw segment and the walk pops the REAL parent of whatever `alias`
 *     resolved to. Windows collapses `.` and `..` inside a symlink target
 *     lexically before following any component: `alias\..\final.yml` names the
 *     link directory's `final.yml` even when `alias` is a directory link, and
 *     `missing\..\final.yml` never consults `missing`. Only a leading `..` of a
 *     relative target still pops the link's real parent, and a trailing
 *     separator survives to demand a directory. Walking raw `..` segments there
 *     writes a file the link never reads — possibly an unrelated one — so the
 *     Windows target is normalized first.
 *
 * `pathApi` is injectable so the platform-specific behavior is testable off the
 * host OS (drive with `path.win32` / `path.posix`); it defaults to the host.
 */
declare function physicalTargetSegments(target: string, pathApi?: typeof path): string[];
export declare class Settings {
    #private;
    /**
     * Registry-owned memo of handle and derivation values for this instance, indexed by
     * `Derived.slot` and validated against {@link revision}; see `config/registry.ts`.
     */
    readonly valueCache: (ValueCacheEntry | undefined)[];
    /** Registry-owned warn-once diagnostics of this instance; see `config/registry.ts`. */
    readonly warnState: WarnState;
    private constructor();
    /**
     * Initialize the global singleton.
     * Call once at startup before accessing `settings`. Rejects (never throws) on an invalid
     * override or configuration.
     */
    static init(options?: SettingsOptions): Promise<Settings>;
    /**
     * Load effective settings from config.yml and project providers without
     * opening agent.db, migrating legacy settings, or writing marker files.
     */
    static loadReadOnly(options?: SettingsOptions): Promise<Settings>;
    /**
     * Load a persisted settings instance without touching the global singleton.
     */
    static loadIsolated(options?: SettingsOptions): Promise<Settings>;
    /**
     * Create an in-memory settings instance without affecting the global singleton.
     * A supplied storage handle remains shared for runtime data while setting overrides stay non-persistent.
     */
    static isolated(overrides?: Readonly<Record<string, unknown>>, options?: {
        storage?: AgentStorage | null;
    }): Settings;
    /**
     * Child view for a subagent or other derived session: reads fall through to this instance
     * live (a later edit here reaches the child and its listeners), while `overrides` and every
     * later write on the child stay in the child — never persisted, never written back here.
     *
     * @throws Error when `overrides` names an unknown setting or a value its definition rejects.
     */
    overlay(overrides?: Readonly<Record<string, unknown>>): Settings;
    /**
     * Deep copy of this {@link overlay}'s own layers (its `set` and `override` writes). Passing it to
     * {@link restoreOverlay} on the same parent rebuilds an equivalent child, so a holder can keep
     * this plain data instead of the live child with its merged view, memoized values and listeners.
     */
    overlayLayers(): OverlayLayers;
    /** {@link overlay} of this instance whose own layers are `layers` (from {@link overlayLayers}). */
    restoreOverlay(layers: OverlayLayers): Settings;
    /**
     * Get the global singleton.
     * Throws if not initialized.
     */
    static get instance(): Settings;
    /** Return the initialized or in-flight global settings without starting a writable load. */
    static get current(): Promise<Settings> | null;
    /**
     * Registry plumbing behind `Setting.get`: the configured value of `id` across all layers
     * (path-scoped entries resolved for this cwd), or `undefined` when unset — the handle
     * supplies the default. Read settings through their handles, not this.
     *
     * A configured `null` is treated as unset: YAML writes `null` for a key left
     * without a value (`fallbackChains:`), and no schema entry has a null
     * default, so returning it verbatim would hand callers a value the schema
     * says is impossible (#13183).
     */
    rawValue(setting: AnySetting): unknown;
    /**
     * Whether `setting` has an explicitly configured value (global config, project
     * config, or runtime override) rather than falling back to the schema default.
     * A configured `null` counts as unset, like in {@link rawValue}.
     */
    isConfigured(setting: AnySetting): boolean;
    /**
     * Layer supplying the effective value of `setting`, in merge precedence order:
     * runtime override → config overlay → project → global → (overlay parent) → schema default.
     * A value that merges to `null` is unset and reports `"default"`.
     */
    getProvenance(setting: AnySetting): SettingProvenance;
    /**
     * Registry plumbing behind `Setting.set` / `Setting.override`: writes `value` for `setting` to the
     * global layer (persisted in the background; releases a soft pin, see {@link pinDefaultValue}) or
     * the runtime-override layer, then notifies change listeners (process-wide effects apply
     * synchronously). On an {@link overlay} both layers are local to the overlay.
     *
     * @throws Error when the value does not fit the definition's type or fails its `items`/`validate` check.
     */
    writeValue(setting: AnySetting, value: unknown, layer: "global" | "override"): void;
    /**
     * Registry plumbing behind `Setting.unset`: removes `setting` from the global layer (the removal
     * is persisted in the background) and releases its soft pin, so the remaining layers — or else
     * the default — supply the value.
     */
    unsetGlobalValue(setting: AnySetting): void;
    /**
     * Registry plumbing behind `Setting.setEntry`: writes `value` as the `key` entry of record `setting`
     * in the global layer (`undefined` removes the entry). The record's other entries, and every entry
     * another layer supplies, stay untouched, and only that entry is persisted; otherwise like a global
     * {@link writeValue}.
     *
     * @throws Error when `setting` is not a record or the entry fails the definition's `validate` check.
     */
    writeEntry(setting: AnySetting, key: string, value: unknown): void;
    /**
     * Registry plumbing behind `Setting.setMember`: adds (`member`) or removes `item` in list `setting`
     * of the global layer, seeded from the default when that layer has no list, so the persisted list
     * changes by that item only; otherwise like a global {@link writeValue}.
     *
     * @throws Error when `setting` is not a list or the resulting list fails its `items`/`validate` check.
     */
    writeMember(setting: AnySetting, item: string, { member }: {
        member: boolean;
    }): void;
    /**
     * Registry plumbing behind `Setting.pinDefault`: overrides `setting` with its default unless a
     * layer configures it, keeping the override soft — a global write or unset of the setting, or a
     * disk reload or re-scope that makes a persisted layer configure it, drops it, and an explicit
     * override/clear ends it.
     */
    pinDefaultValue(setting: AnySetting): void;
    /** Registry plumbing behind `Setting.clearOverride`: drops the runtime override of `setting`. */
    clearOverrideValue(setting: AnySetting): void;
    /**
     * Registry plumbing behind `Derived.listen` and `effect`: calls `listener` synchronously
     * whenever the effective value of one of `sources` changes in this instance. Returns the
     * unsubscribe. Consumers observe settings through handles instead.
     */
    onEffectiveChange(sources: readonly AnySetting[], listener: SettingChangeListener): () => void;
    /**
     * Drop pending debounced saves and refuse any further background writes.
     * Used when an instance is being discarded (test teardown): an armed timer
     * or a chained in-flight save on a dropped instance would otherwise fire
     * later and race the successor's file locks. Also stops config-file watching.
     */
    cancelPendingSaves(): void;
    /**
     * Apply on-disk edits live: watch the directories holding config.yml, the
     * project settings files, and `--config` overlays, and run a debounced
     * keep-last-good reload (a file that fails to parse or validate keeps its
     * layer's last good values). Only the persisting process-global instance watches; other
     * instances ignore the call. Stopped by {@link stopWatching} /
     * {@link cancelPendingSaves}.
     */
    startWatching(): void;
    /** Stop config-file watching started by {@link startWatching}; idempotent. */
    stopWatching(): void;
    /**
     * Flush any pending saves to disk.
     * Call before exit to ensure all changes are persisted.
     */
    flush(): Promise<void>;
    /**
     * Independent instance scoped to `cwd`: same global, `--config` overlay, and runtime layers, the
     * project layer re-read for `cwd` (persisted instances). An {@link overlay} clones its parent for
     * `cwd` and re-applies its own layers on top, so inherited values carry over.
     *
     * @throws Error when a configured value fails its definition's `validate` check.
     */
    cloneForCwd(cwd: string): Promise<Settings>;
    /**
     * Re-read the current global, project, and explicit overlay layers from disk
     * without replacing this instance or discarding runtime overrides.
     *
     * All sources are loaded and validated before any live layer is replaced, so
     * readers never observe a partially refreshed or invalid configuration.
     * Concurrent callers share the same reload.
     *
     * @throws Error when a source fails to load or a value fails its definition's
     * `validate` check; the previous layers stay in effect.
     */
    reloadFromDisk(): Promise<void>;
    /**
     * Re-scope this instance to a new working directory *in place*: reload the
     * project layer (`.claude/settings.yml` etc.) from `cwd`, re-resolve
     * path-scoped settings against it, and notify listeners (and process-wide
     * effects: theme, symbols, …) of every value the new scope changes. Global
     * settings and runtime overrides are preserved.
     *
     * Unlike {@link cloneForCwd}, this mutates the live instance, so every holder
     * (the `settings` proxy, the active session, controllers) observes the new
     * project scope without swapping references — used when the process changes
     * directory mid-run (`/move`, cross-project resume). No-op when `cwd` is
     * already the current scope. Serialized with disk reloads.
     *
     * @throws Error when a value configured for the new scope fails its definition's
     * `validate` check; the instance then stays on its previous scope.
     */
    reloadForCwd(cwd: string): Promise<void>;
    getStorage(): AgentStorage | null;
    getCwd(): string;
    getAgentDir(): string;
    /**
     * Monotonic revision for consumers caching derived effective settings.
     * Changes after every merged-layer or cwd-scope rebuild, including overlays
     * and path-scoped array re-resolution.
     */
    get revision(): number;
    /**
     * Raw global settings layer (`config.yml`/`config.yaml`), deep-cloned.
     *
     * Exposes arbitrary namespaced keys (e.g. an extension's own `piVim` block)
     * that the typed, schema-bound {@link get} cannot reach. Used by the legacy
     * pi `SettingsManager` shim to match upstream Pi's `getGlobalSettings()`.
     * The clone means callers cannot mutate internal state. An {@link overlay}
     * reports its parent's layer with the overlay's own writes merged on top.
     */
    getGlobalSettings(): RawSettings;
    /**
     * Raw project settings layer (`.claude/settings.yml`, `.omp/config.yml`,
     * etc.), deep-cloned. Companion to {@link getGlobalSettings} for the legacy
     * pi `SettingsManager` shim's `getProjectSettings()`; an {@link overlay}
     * likewise reports its parent's layer under its own.
     */
    getProjectSettings(): RawSettings;
    getPlansDirectory(): string;
    /**
     * Get shell configuration based on settings.
     */
    getShellConfig(): procmgr.ShellConfig;
    /**
     * Provenance of the effective `extensions` array for extension-root
     * sub-discovery. `"project"` only when a project settings provider owns it
     * (any of `.omp/config.yml`, `.omp/settings.json`, `.claude/settings.json`,
     * … — all merged into the project layer) and no higher user-level layer (a
     * `--config` overlay or a runtime override) replaces it; otherwise `"user"`.
     * Callers pass this into {@link EffectiveExtensionRoots.configuredLevel} so
     * discovery labels roots by the authority that produced them rather than
     * re-deriving provenance from a partial disk scan. An {@link overlay} whose
     * own layers leave `extensions` alone reports its parent's level.
     */
    extensionsSourceLevel(): "user" | "project";
    /**
     * Set a model role (helper for modelRoles record). Passing `undefined`
     * clears the role from the persisted record and any runtime override.
     *
     * In project storage mode, when a project edit has temporarily replaced
     * the process-wide runtime override for `role` and that override is still
     * active (the runtime slot currently matches the project value), the
     * global-layer write must not rewrite that runtime slot — otherwise the
     * global fallback would immediately shadow the still-configured project
     * role. The global layer is still persisted; only the runtime override is
     * left untouched. The guard is precise so that a later clear, a late
     * `overrideModelRoles`, or a storage-mode transition does not leave a
     * stale skip in place.
     */
    setModelRole(role: ModelRole | string, modelId: string | undefined): void;
    /**
     * Whether `role`'s runtime override slot currently holds the temporary
     * project-scoped value installed by a prior `setProjectModelRole`. Returns
     * `false` when storage is not project-mode, no capture exists, or the
     * project role was cleared. With explicit provenance invalidation, a
     * surviving capture implies no external supersession occurred.
     */
    isProjectModelRoleRuntimeOverrideActive(role: ModelRole | string): boolean;
    /**
     * Set a model role in the current project's settings layer.
     */
    setProjectModelRole(role: ModelRole | string, modelId: string): void;
    /**
     * Clear a model role from the current project's settings layer.
     */
    clearProjectModelRole(role: ModelRole | string): void;
    /**
     * Get a model role (helper for modelRoles record).
     */
    getModelRole(role: ModelRole | string): string | undefined;
    /**
     * Get a model role from only the global settings layer (an {@link overlay}'s own, else its parent's).
     */
    getGlobalModelRole(role: ModelRole | string): string | undefined;
    /**
     * Get a model role from only the current project settings layer (an {@link overlay}'s own, else its parent's).
     */
    getProjectModelRole(role: ModelRole | string): string | undefined;
    /**
     * Report which layer actually supplies the effective model role across
     * full merge precedence (runtime override → config overlay → project →
     * global → default). Unlike {@link getModelRoleSource}, this accounts
     * for runtime and config-overlay layers and detects ownership by key
     * presence rather than normalized value, so a `null` tombstone in the
     * overlay or runtime layer correctly blocks lower layers. The project
     * layer is checked through {@link projectLayerForMerge} because a
     * project null is a cleared value (falls back to global), not a
     * tombstone.
     */
    getModelRoleProvenance(role: ModelRole | string): SettingProvenance;
    /**
     * Get the persisted layer supplying a model role (project/global/default only).
     */
    getModelRoleSource(role: ModelRole | string): "project" | "global" | "default";
    /**
     * Raw `modelPresets` entry for `name` from the highest-precedence layer that
     * defines it (runtime override → config overlay → project → global), whole —
     * same-name entries are NOT deep-merged across layers. A `null` entry on a
     * tombstoning layer (runtime, overlay) hides the preset; a `null` anywhere
     * else counts as unset. Falls back to the parent chain like the model-role
     * layer helpers.
     */
    getOwnedModelPreset(name: string): {
        entry: unknown;
        source: "runtime" | "overlay" | "project" | "global";
    } | undefined;
    /**
     * Get all model roles (helper for modelRoles record).
     */
    getModelRoles(): ReadOnlyDict<string>;
    overrideModelRoles(roles: ReadOnlyDict<string>): void;
}
/**
 * Run extension-owned work with the settings instance of its active session.
 *
 * Legacy Pi extensions synchronously call `SettingsManager.create(ctx.cwd)`;
 * `cwd` alone cannot distinguish concurrent sessions that use different
 * settings for the same project. The async scope supplies that missing session
 * identity without process-global mutation.
 */
export declare function withActiveSettings<T>(instance: Settings | undefined, fn: () => T): T;
export declare function isSettingsInitialized(): boolean;
/**
 * Resolve the settings visible to a legacy Pi `SettingsManager.create()` call.
 *
 * An active extension session is authoritative because `cwd`/`agentDir` cannot
 * uniquely identify concurrent SDK sessions with per-session overrides. Outside
 * extension execution, the most recently constructed matching instance is the
 * best available scope; an unscoped lookup falls back to the global singleton.
 */
export declare function findScopedSettings(cwd?: string, agentDir?: string): Settings | undefined;
/**
 * Reset the global singleton for testing.
 * @internal
 */
export declare function resetSettingsForTest(): void;
/**
 * Exposes the dangling-symlink target segment splitter for platform-specific
 * tests: the root-double-count and POSIX-backslash bugs only reproduce with an
 * explicit `path.win32` / `path.posix` engine, which cannot be forced from the
 * host OS otherwise.
 * @internal
 */
export declare const __physicalTargetSegmentsForTesting: typeof physicalTargetSegments;
/**
 * The global settings singleton.
 * Must call `Settings.init()` before using.
 */
export declare const settings: Settings;
export {};
