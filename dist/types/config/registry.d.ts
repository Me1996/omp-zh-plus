import type { AnyUiMetadata, SubmenuOption, UiBase } from "@oh-my-pi/pi-tui-zh/overlays/settings-defs";
import type { SettingProvenance, Settings } from "./settings.js";
export interface UiBoolean extends UiBase {
}
export interface UiEnum<T extends readonly string[]> extends UiBase {
    /** Submenu options. When omitted, the enum renders as an inline toggle derived from `values`. */
    options?: ReadonlyArray<SubmenuOption<T[number]>>;
}
export interface UiNumber extends UiBase {
    /** Submenu options. Without options, a numeric setting has no UI representation (intentional hide). */
    options?: ReadonlyArray<SubmenuOption>;
}
export interface UiString extends UiBase {
    /** Mask the value in both the settings row and text editor. */
    secret?: boolean;
    /**
     * Submenu options.
     *  - Array  → submenu with these choices.
     *  - "runtime" → submenu populated by the runtime layer (theme registry, etc.).
     *  - Omitted → renders as a free text input.
     */
    options?: ReadonlyArray<SubmenuOption> | "runtime";
}
export interface UiArray extends UiBase {
    /** Membership choices. Without options, an array setting has no UI representation (config-file only). */
    options?: ReadonlyArray<SubmenuOption>;
    /** Selection order is meaningful; the editor renders positions and supports reordering. */
    ordered?: boolean;
}
/**
 * Environment variable that, when set, takes precedence over every settings layer. Default parsing
 * follows the setting's type: booleans follow `parseFlag` (empty is unset; `1`, `y`, `true`, `yes`,
 * `on`, all lower- or upper-case, are true; any other text is false), numbers any finite number,
 * enums a listed value, strings any non-blank text; other text counts as unset.
 */
export type SettingEnv<T> = string | {
    name: string;
    /** Maps the raw variable to a value; `undefined` means "not set". Defaults to the type parser. */
    parse?: (raw: string) => T | undefined;
    /**
     * The variable only replaces the default (env vars documented as fallbacks of a config key):
     *  - `true`: any settings layer configuring a non-null value wins over it.
     *  - `"blank"`: likewise, but a configured empty/whitespace string also yields to the variable.
     */
    fallback?: true | "blank";
};
/** Protocol host that re-applies a setting's default instead of the user's persisted preference. */
export type ProtocolHost = "rpc" | "acp";
interface DefinitionBase {
    /** Dotted setting path as written in config files, e.g. `"lsp.diagnosticsOnWrite"`. */
    id: string;
    /**
     * Marks a credential: never printed or exported without an explicit request. Drives both CLI
     * redaction and settings-panel masking (together with `ui.secret`, see {@link Setting.isCredential}).
     */
    credential?: true;
    /**
     * Array entries may be objects scoping values to working-directory prefixes
     * (`{ path(s)/pathPrefix(es), values | items | <valuesKey> }`, see `config/settings.ts`);
     * `valuesKey` names the domain-specific alias for the values list (e.g. `models`).
     */
    pathScoped?: {
        valuesKey: string;
    };
    /**
     * Protocol hosts (RPC/ACP embedders) that start from this setting's default rather than the local
     * user's interactive preference: at startup the default is pinned as a runtime override unless
     * the host configured a value itself (caller overrides, project settings, `--config`, global config).
     */
    protocolDefault?: readonly ProtocolHost[];
    /**
     * Rejects a malformed configured value with a descriptive error. Runs on every load/reload and
     * before every write, so a typo fails loudly instead of silently reading as the default.
     */
    validate?: (raw: unknown) => void;
    /**
     * Canonicalizes a value on its way in — text parsed by {@link Setting.parse} and every
     * `set`/`override` — e.g. flooring request limits. May throw like `validate`.
     */
    normalize?: (value: unknown) => unknown;
}
export interface BooleanDefinition extends DefinitionBase {
    type: "boolean";
    default: boolean | undefined;
    env?: SettingEnv<boolean>;
    ui?: UiBoolean;
}
export interface StringDefinition extends DefinitionBase {
    type: "string";
    default: string | undefined;
    env?: SettingEnv<string>;
    ui?: UiString;
}
export interface NumberDefinition extends DefinitionBase {
    type: "number";
    default: number | undefined;
    env?: SettingEnv<number>;
    ui?: UiNumber;
}
export interface EnumDefinition<T extends readonly string[] = readonly string[]> extends DefinitionBase {
    type: "enum";
    values: T;
    default: T[number];
    env?: SettingEnv<T[number]>;
    ui?: UiEnum<T>;
}
export interface ArrayDefinition<T = unknown> extends DefinitionBase {
    type: "array";
    default: readonly T[];
    env?: SettingEnv<readonly T[]>;
    /**
     * Closed vocabulary for the entries (`label` names one entry in messages, e.g. "status line
     * segment"). Writes naming an unknown entry are rejected; configured values that already contain
     * one load unchanged with a single warning per entry, so a retired id never breaks startup.
     */
    items?: {
        values: readonly string[];
        label: string;
    };
    ui?: UiArray;
}
export interface RecordDefinition<T = unknown> extends DefinitionBase {
    type: "record";
    default: Readonly<Record<string, T>>;
    env?: SettingEnv<Readonly<Record<string, T>>>;
    ui?: UiBase;
}
/** Any setting definition accepted by {@link register}. */
export type SettingDefinition = BooleanDefinition | StringDefinition | NumberDefinition | EnumDefinition | ArrayDefinition | RecordDefinition;
/** Value type a definition resolves to. */
export type DefinitionValue<D> = D extends {
    type: "boolean";
    default: undefined;
} ? boolean | undefined : D extends {
    type: "boolean";
} ? boolean : D extends {
    type: "string";
    default: infer V;
} ? undefined extends V ? string | undefined : string : D extends {
    type: "number";
    default: undefined;
} ? number | undefined : D extends {
    type: "number";
} ? number : D extends {
    type: "enum";
    values: infer V;
} ? V extends readonly string[] ? V[number] : never : D extends {
    type: "array" | "record";
    default: infer V;
} ? V : never;
/** Object carrying a settings instance, optionally owning the lifetime of listeners bound to it. */
export interface SettingsScope {
    readonly settings: Settings;
    /** Registers teardown to run when the scope ends (session dispose). */
    addDisposer?(dispose: () => void): void;
}
/** Anything a handle can be read against. */
export type ScopeLike = Settings | SettingsScope;
/**
 * Memoized value of one handle/derivation within one settings instance, stored at
 * `Settings.valueCache[slot]` and updated in place on recompute.
 */
export interface ValueCacheEntry {
    revision: number;
    inputs: readonly unknown[];
    value: unknown;
}
/**
 * Read-only value computed from one or more settings. Reads are memoized per scope and recomputed
 * only when an input setting's effective value changes; derivation functions must be pure.
 */
export declare abstract class Derived<T> {
    /**
     * Process-unique index of this handle/derivation: its entry in every `Settings.valueCache`,
     * and for leaf settings its change-listener bucket.
     */
    readonly slot: number;
    /** Leaf settings this value depends on (change notifications subscribe to these). */
    abstract get sources(): readonly AnySetting[];
    /**
     * Registry plumbing: current input values for `settings`; the derivation recomputes only when
     * one changes identity. Read values through {@link get}.
     */
    abstract inputs(settings: Settings): readonly unknown[];
    /** Registry plumbing: computes the value from `inputs` (as returned by {@link inputs}). */
    abstract compute(inputs: readonly unknown[], settings: Settings): T;
    /** Latest value in `scope`. */
    get(scope: ScopeLike): T;
    /** Derives a memoized value from this one. */
    map<U>(fn: (value: T) => U): Derived<U>;
    /**
     * Calls `onChange(next, previous)` whenever this value changes in `scope`, coalesced per microtask
     * so a bulk reload touching several inputs fires once. When `scope` owns a lifetime
     * ({@link SettingsScope.addDisposer}, e.g. an `AgentSession`), the listener is removed with it.
     * Errors and rejections are logged, never thrown. Returns an unsubscribe function.
     */
    listen(scope: ScopeLike, onChange: (value: T, previous: T) => void | Promise<void>): () => void;
}
/**
 * Deep equality of setting values that, unlike `Bun.deepEquals`, also compares the key order of
 * plain objects: record order carries precedence (`edit.modelVariants` takes the first match), so a
 * reorder is a change. Values other than plain objects and arrays compare with `Bun.deepEquals`.
 */
export declare function settingValuesEqual(a: unknown, b: unknown): boolean;
/** Value types of a record of derivations. */
export type DerivedValues<R extends Record<string, Derived<unknown>>> = {
    [K in keyof R]: R[K] extends Derived<infer V> ? V : never;
};
/**
 * Combines several handles/derivations into one memoized value.
 *
 * @example
 * const cfgLspWritethrough = combine(
 * 	{ format: cfgLspFormatOnWrite, diagnostics: cfgLspDiagnosticsOnWrite },
 * 	({ format, diagnostics }) => (format || diagnostics ? { format, diagnostics } : undefined),
 * );
 */
export declare function combine<R extends Record<string, Derived<unknown>>>(parts: R): Derived<DerivedValues<R>>;
export declare function combine<R extends Record<string, Derived<unknown>>, T>(parts: R, fn: (values: DerivedValues<R>) => T): Derived<T>;
/**
 * Handle for one registered setting. Reads resolve, in precedence order: the definition's
 * environment variable, runtime override, `--config` overlay, project, global, then the default.
 */
export declare class Setting<T, Id extends string = string> extends Derived<T> {
    #private;
    readonly id: Id;
    /** {@link id} split into its dotted path, as addressed within a settings layer. */
    readonly segments: readonly string[];
    readonly definition: SettingDefinition;
    /** Environment variable supplying this value, if declared (see {@link SettingEnv}). */
    readonly envName: string | undefined;
    /** How {@link envName} yields to configured layers: `false` = it overrides them (see {@link SettingEnv}). */
    readonly envFallback: boolean | "blank";
    constructor(definition: SettingDefinition & {
        id: Id;
    });
    get sources(): readonly AnySetting[];
    /** Fresh copy of the default value (arrays/records are cloned so callers may mutate). */
    get default(): T;
    /** Declared value kind. */
    get type(): SettingDefinition["type"];
    /** Allowed values for enum settings. */
    get enumValues(): readonly string[] | undefined;
    /** Settings-panel metadata; `undefined` for config-file-only settings. */
    get ui(): AnyUiMetadata | undefined;
    /** Whether the value is a credential (explicit marker or legacy `ui.secret`). */
    get isCredential(): boolean;
    /** Value supplied by the environment variable, or `undefined` when unset or unparseable. */
    envValue(): T | undefined;
    get(scope: ScopeLike): T;
    /**
     * Value from the settings layers alone (runtime, `--config` overlay, project, global, default),
     * ignoring the environment variable — what the settings panel shows and edits.
     */
    layered(scope: ScopeLike): T;
    /**
     * Parses user- or agent-supplied text (`omp config set`, `write cfg://…`) into a value of this
     * setting's type. Booleans accept true/false, yes/no, on/off, 1/0; arrays and records take JSON;
     * strings and enums accept bare text or a JSON-quoted string.
     *
     * @throws Error when the text does not fit the type or enum values.
     */
    parse(text: string): T;
    /** Whether `value` fits this setting's declared type (and enum values). */
    accepts(value: unknown): boolean;
    inputs(settings: Settings): readonly unknown[];
    compute(inputs: readonly unknown[], settings: Settings): T;
    /**
     * Registry plumbing run by `Settings` before every write (handle writes and constructor overrides).
     *
     * @throws Error when `value` names an entry outside {@link ArrayDefinition.items}, fails `validate`
     * (checked first for their specific messages), or does not fit the declared type ({@link accepts}).
     */
    assertWritable(value: unknown): void;
    /**
     * Registry plumbing run by `Settings` on every load/reload for the value `settings` configures.
     *
     * @throws Error when `raw` fails `validate`. Unknown {@link ArrayDefinition.items} entries only warn,
     * once each per instance.
     */
    checkConfigured(settings: Settings, raw: unknown): void;
    /**
     * Persists `value` to the global config; `undefined` removes the key ({@link unset}).
     *
     * @throws Error when the value does not fit the definition (see {@link assertWritable}).
     */
    set(scope: ScopeLike, value: T): void;
    /**
     * Runtime-only override (not persisted); `undefined` removes it ({@link clearOverride}).
     *
     * @throws Error when the value does not fit the definition (see {@link assertWritable}).
     */
    override(scope: ScopeLike, value: T): void;
    /**
     * Removes the key from the persisted global config: any other layer or environment variable that
     * configures this setting still applies, otherwise the default.
     */
    unset(scope: ScopeLike): void;
    /**
     * Persists one entry of this record setting to the global config; `undefined` removes the entry.
     * The record's other entries, persisted or supplied by another layer, stay as they are.
     *
     * @throws Error when this is not a record setting or the entry does not fit the definition.
     */
    setEntry(scope: ScopeLike, key: string, value: RecordEntryOf<T> | undefined): void;
    /**
     * Adds (`member`) or removes `item` in this list setting's persisted global value, leaving every
     * other item as it is.
     *
     * @throws Error when this is not a list setting or the resulting list does not fit the definition.
     */
    setMember(scope: ScopeLike, item: string, options: {
        member: boolean;
    }): void;
    /**
     * Holds the default as a runtime override only while no persisted layer — global, project,
     * `--config` overlay — configures this setting; no-op when the environment or any layer already
     * configures it, and dropped by a global write ({@link set}, {@link setEntry}, {@link setMember}) or
     * {@link unset} of this setting or when a reload or re-scope configures it (protocol-host defaults).
     */
    pinDefault(scope: ScopeLike): void;
    /** Removes a runtime override, restoring the persisted/default value. */
    clearOverride(scope: ScopeLike): void;
    /** Whether the environment or any settings layer (runtime, overlay, project, global) sets this value. */
    isConfigured(scope: ScopeLike): boolean;
    /** Layer supplying the effective value. */
    provenance(scope: ScopeLike): SettingProvenance;
}
/** Value type of a handle or derivation. */
export type SettingValueOf<H> = H extends Derived<infer T> ? T : never;
/** Entry value type of a record setting's value `T` (see {@link Setting.setEntry}). */
export type RecordEntryOf<T> = T extends Readonly<Record<string, infer V>> ? V : never;
/** Handle of any registered setting (runtime/string-keyed surfaces: UI, CLI, `cfg://`). */
export type AnySetting = Setting<unknown>;
/**
 * Declares a setting and returns its typed handle.
 *
 * @throws Error when `id` is already registered.
 */
export declare function register<const D extends SettingDefinition>(definition: D): Setting<DefinitionValue<D>, D["id"]>;
/** Handle for `id`, or `undefined` when no setting has that id. */
export declare function lookup(id: string): AnySetting | undefined;
/** Every registered setting, in declaration order. */
export declare function all(): readonly AnySetting[];
/**
 * Warn-once diagnostics of one settings instance, stored at `Settings.warnState`: each is re-armed
 * only by that instance's own values, so instances reading different values never re-trigger each other.
 */
export interface WarnState {
    /** Invalid configured value each setting (by id) last warned about; re-armed once the value is fixed. */
    readonly invalid: Map<string, unknown>;
    /** Unknown `items` entries each setting (by id) warned about that are still configured. */
    readonly items: Map<string, Set<string>>;
}
/**
 * Registry plumbing run by `Settings` when it derives `target` from `source` (overlays, cwd clones):
 * `target` takes over `source`'s warn-once diagnostics, so the values it inherits are not reported again.
 */
export declare function inheritWarnings(target: Settings, source: Settings): void;
/**
 * Declares a process-wide side effect of a setting (theme, credential redaction, request limits…).
 * It follows the settings instance bound with {@link bindEffects}: applied immediately on bind and
 * on every change. Unlike {@link Derived.listen}, application is synchronous — it lands inside the
 * write or reload that caused it, so code reading the affected process state right after
 * `set`/`override` sees the new value. Errors and rejections are logged, never thrown. Subagent
 * overlays and isolated instances never drive effects. Returns a function removing the effect
 * (module-level declarations never call it; test-scoped effects do).
 */
export declare function effect<T>(value: Derived<T>, apply: (value: T) => void | Promise<void>): () => void;
/**
 * Makes `settings` drive every {@link effect} (the process-global instance, the top-level session's
 * settings in SDK embeddings, an ACP session's workspace settings) until the returned release is
 * called. Holds stack: the most recent outstanding hold drives effects, and releasing it hands them
 * back to the previous hold (re-applying its values). Holding the same instance twice takes two
 * holds; the release is idempotent and never ends another holder's hold.
 */
export declare function bindEffects(settings: Settings): () => void;
/** Instance currently driving effects, if any. */
export declare function effectsSettings(): Settings | undefined;
/** Drops every {@link bindEffects} hold, so no instance drives effects (test teardown). */
export declare function unbindEffects(): void;
/**
 * Test reset: drops every effect hold and re-applies each effect whose last applied value differs
 * from the one `defaults` yields (restoring process state an earlier test changed).
 */
export declare function resetRegistryForTest(defaults: Settings): void;
export {};
