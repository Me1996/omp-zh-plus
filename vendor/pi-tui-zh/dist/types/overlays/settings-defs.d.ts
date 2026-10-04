/** Schema-independent display definitions for the settings overlay. */
import type { SymbolKey } from "../theme/symbols.js";
export type SettingTab = "appearance" | "model" | "interaction" | "context" | "memory" | "files" | "shell" | "tools" | "tasks" | "providers";
/** Tab display metadata - icon is resolved via theme.symbol() */
export type TabMetadata = {
    label: string;
    icon: Extract<SymbolKey, `tab.${string}`>;
};
/** Ordered list of tabs for UI rendering */
export declare const SETTING_TABS: SettingTab[];
/** Tab display metadata - icon is a symbol key from theme.ts (tab.*) */
export declare const TAB_METADATA: Record<SettingTab, TabMetadata>;
/** One-sentence lead per tab, under the page title of the native settings page. */
export declare const TAB_LEADS: Record<SettingTab, string>;
/**
 * Ordered section groups per tab. Settings declare their section via `ui.group`;
 * the settings UI renders groups in this order with a heading row between them.
 * Ungrouped settings render first, before any section heading.
 */
export declare const TAB_GROUPS: Record<SettingTab, readonly string[]>;
/** Submenu choice metadata. */
export type SubmenuOption<V extends string = string> = {
    value: V;
    label: string;
    description?: string;
};
export interface UiBase {
    tab: SettingTab;
    /** Section within the tab; must be listed in TAB_GROUPS[tab]. Ungrouped settings render at the top. */
    group?: string;
    label: string;
    description: string;
    /**
     * Risk note. Marks the settings row with a warning glyph and renders above
     * the description in warning styling. For settings that can get the user
     * rate-limited, flagged, or banned — not for merely advanced options.
     */
    warning?: string;
    /** Condition function name - setting only shown when true */
    condition?: string;
}
/** Wide ui shape exposed to consumers that walk the schema generically. */
export type AnyUiMetadata = UiBase & {
    options?: ReadonlyArray<SubmenuOption> | "runtime";
    secret?: boolean;
    ordered?: boolean;
};
/** Structural schema entries supplied by the application host. */
export interface SettingsDisplayEntry {
    path: string;
    type: string;
    defaultValue: unknown;
    ui?: AnyUiMetadata;
    enumValues?: readonly string[];
    credential?: boolean;
    condition?: () => boolean;
}
export interface SettingsHost {
    entries: readonly SettingsDisplayEntry[];
    get(path: string): unknown;
    set(path: string, value: unknown): void;
    /**
     * Removes the value from the global config: a project or other layer, or an environment
     * variable, that configures the setting still applies; otherwise the default does.
     */
    unset(path: string): void;
    normalizeProviderLimits(value: unknown): Record<string, number>;
    validateProviderLimits(value: unknown): Record<string, number>;
}
/** Primitive value displayed by a settings control. */
export type SettingsDisplayValue = boolean | string;
interface BaseSettingDef {
    path: string;
    defaultValue: unknown;
    schemaType: string;
    label: string;
    description: string;
    /** Risk note shown in warning styling; set for settings that can get the user flagged or banned. */
    warning?: string;
    tab: SettingTab;
    /** Section within the tab; items are ordered by TAB_GROUPS[tab] and rendered under a heading row. */
    group?: string;
    /**
     * Optional visibility predicate. When supplied and returning false, the
     * setting is hidden from the UI. Applies to every variant — booleans,
     * enums, submenus, and text inputs.
     */
    condition?: () => boolean;
}
export interface BooleanSettingDef extends BaseSettingDef {
    type: "boolean";
}
export interface EnumSettingDef extends BaseSettingDef {
    type: "enum";
    values: readonly string[];
}
type OptionList = ReadonlyArray<SubmenuOption>;
export interface SubmenuSettingDef extends BaseSettingDef {
    type: "submenu";
    options: OptionList;
    onPreview?: (value: string) => void;
    onPreviewCancel?: (originalValue: string) => void;
}
export interface TextInputSettingDef extends BaseSettingDef {
    type: "text";
    secret: boolean;
}
export interface ProviderLimitsSettingDef extends BaseSettingDef {
    type: "providerLimits";
}
/** Array-of-enum setting edited as a toggle list; `ordered` lists render positions and support reordering. */
export interface MultiSelectSettingDef extends BaseSettingDef {
    type: "multiselect";
    options: OptionList;
    ordered: boolean;
}
export type SettingDef = BooleanSettingDef | EnumSettingDef | SubmenuSettingDef | TextInputSettingDef | ProviderLimitsSettingDef | MultiSelectSettingDef;
/** Get all setting definitions with UI, retaining live host visibility predicates. */
export declare function getAllSettingDefs(entries: readonly SettingsDisplayEntry[]): SettingDef[];
/** Get settings ordered by their tab's section layout. */
export declare function getSettingsForTab(entries: readonly SettingsDisplayEntry[], tab: SettingTab): SettingDef[];
/** Find the display definition for a host setting path. */
export declare function getSettingDef(entries: readonly SettingsDisplayEntry[], path: string): SettingDef | undefined;
/**
 * The numeric value a number-like choice option stands for: its number, or
 * -1 for `default` (the stored sentinel, see the selector's value mapping);
 * `undefined` when the option is not numeric.
 */
export declare function numericOption(value: string): number | undefined;
/**
 * Number hint: a numeric setting whose choices are all numbers (or the
 * `default` sentinel) edits as a stepper through those values on a native
 * settings page. Returns the steps (number → label), else `undefined`.
 */
export declare function numberSteps(def: SettingDef): Record<string, string> | undefined;
/** Format a setting's declared default for display. */
export declare function getDisplayDefault(entries: readonly SettingsDisplayEntry[], path: string): string;
export {};
