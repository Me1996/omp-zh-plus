/**
 * Model presets: named snapshots of the role assignments (`modelRoles`) and
 * `defaultThinkingLevel`, saved and re-applied as a whole.
 *
 * Presets persist to the global config (`modelPresets.<name>`); a project config
 * may also define presets, which are listed and applied but never copied into
 * the global file. Applying a preset writes roles the way the model hub does:
 * into the scope selected by `modelRoleStorage`, replacing `--model`/env runtime
 * role overrides like hub edits do. Roles still decided by another layer (a
 * `--config` overlay, a project config in global mode, or the global config in
 * project mode) are reported back instead of being silently kept.
 */
import type { Model } from "@oh-my-pi/pi-ai";
import { type ConfiguredThinkingLevel } from "@oh-my-pi/pi-tui-zh/thinking";
import type { AgentSession } from "../session/agent-session.js";
import { type ModelPreset } from "./model-settings.js";
import type { Settings, SettingProvenance } from "./settings.js";
export declare function isValidModelPresetName(name: string): boolean;
type PresetLookup = {
    kind: "found";
    preset: ModelPreset;
} | {
    kind: "missing";
} | {
    kind: "invalid";
    reason: string;
};
/** Look a preset up whole from the highest layer owning its name — same-name entries never merge. */
export declare function getModelPreset(settings: Settings, name: string): PresetLookup;
/** Saved preset names, sorted; names a `--config`/runtime `null` tombstone hides are left out. */
export declare function getModelPresetNames(settings: Settings): string[];
/**
 * First saved preset (by name) the current setup matches: identical effective
 * role assignments and, when the preset records one, the same default thinking
 * level. Undefined when the roles were edited past every preset.
 */
export declare function findActiveModelPreset(settings: Settings): string | undefined;
/**
 * Save the effective role assignments and `defaultThinkingLevel` as `name` in the
 * global config, overwriting a preset of the same name. Only this entry is
 * written, so presets defined by a project config are never copied globally.
 *
 * @throws Error when `name` is not a valid preset name.
 */
export declare function saveModelPreset(settings: Settings, name: string): ModelPreset;
export type ModelPresetDeleteResult = "deleted" | "missing" | "project";
/**
 * Delete `name` from the global config. A preset only a project (or `--config`)
 * file defines is reported as `project`: it has to be removed from that file.
 * The same applies when another layer defines the same name: the global entry is
 * removed but the preset keeps listing, so `project` is reported instead of a
 * false `deleted`.
 */
export declare function deleteModelPreset(settings: Settings, name: string): ModelPresetDeleteResult;
/**
 * Layer above global config that still defines preset `name`, if any — so a
 * global save can warn that the just-saved entry is shadowed and won't apply.
 */
export declare function modelPresetShadowOwner(settings: Settings, name: string): "runtime" | "overlay" | "project" | undefined;
/** Status line after saving `name`, naming the higher layer whose same-name preset still wins, if any. */
export declare function modelPresetSavedMessage(settings: Settings, name: string): string;
export declare function acquireModelRoleMutation(): Promise<() => void>;
/** A role whose effective assignment differs from the preset after applying it. */
export interface ModelPresetShadowedRole {
    role: string;
    /** The preset's selector, or undefined when the preset leaves the role unset. */
    expected: string | undefined;
    /** The effective selector that won instead. */
    actual: string | undefined;
    source: SettingProvenance;
}
/** The preset's `defaultThinkingLevel` when a layer above global config still decides the setting. */
export interface ModelPresetShadowedThinking {
    expected: NonNullable<ModelPreset["defaultThinkingLevel"]>;
    /** The effective setting that won instead; the live session still uses `expected`. */
    actual: ModelPreset["defaultThinkingLevel"];
    source: SettingProvenance;
}
export type ModelPresetSwitchResult = {
    kind: "switched";
    model: Model;
    thinkingLevel: ConfiguredThinkingLevel | undefined;
    /** Roles another layer still decides; empty on a clean switch. */
    shadowed: ModelPresetShadowedRole[];
    /** Set when another layer still decides `defaultThinkingLevel`, so it returns on reload. */
    shadowedThinking: ModelPresetShadowedThinking | undefined;
} | {
    kind: "missing";
} | {
    kind: "invalid";
    reason: string;
}
/** Nothing was written: the preset's default model cannot be used right now. */
 | {
    kind: "unavailable";
    reason: string;
}
/** Roles were written but the live model could not be switched. */
 | {
    kind: "failed";
    reason: string;
    shadowed: ModelPresetShadowedRole[];
};
export type ModelPresetSession = Pick<AgentSession, "setModel" | "setThinkingLevel" | "getAvailableModels" | "scopedModels" | "modelRegistry">;
/**
 * Apply preset `name`: persist its roles and thinking level, then switch the
 * live session to the resulting default model and thinking level.
 *
 * The preset's own default is checked before anything is written, so a preset
 * whose model is gone leaves settings untouched. A live switch that still fails
 * afterwards is reported as `failed`, never as a completed switch.
 */
export declare function applyModelPreset(settings: Settings, session: ModelPresetSession, name: string): Promise<ModelPresetSwitchResult>;
/** One line per role (and the thinking level) the preset could not set, for status output. */
export declare function describeShadowedRoles(shadowed: readonly ModelPresetShadowedRole[], thinking?: ModelPresetShadowedThinking): string[];
/** True when the switch applied the whole preset: switched, with no role or thinking level still decided elsewhere. */
export declare function isCleanModelPresetSwitch(result: ModelPresetSwitchResult): boolean;
/** Short summary of a switch outcome for status lines and command output. */
export declare function formatModelPresetSwitch(name: string, result: ModelPresetSwitchResult): string;
export {};
