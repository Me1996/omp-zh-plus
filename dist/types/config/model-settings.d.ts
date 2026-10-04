/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import { type SettingValueOf } from "./registry.js";
import type { AuthAccountPolicies } from "@oh-my-pi/pi-ai/auth-storage";
import type { cfgDefaultThinkingLevel } from "../session/settings.js";
/** Display metadata for one model tag. */
export interface ModelTagDef {
    name: string;
    color?: string;
    /** If true, the role is functional but not shown in the model selector UI. */
    hidden?: boolean;
}
/** Model tags keyed by tag id (`modelTags`). */
export type ModelTagsSettings = Record<string, ModelTagDef>;
/**
 * One saved model preset (`modelPresets.<name>`): the role assignments and default thinking level
 * captured by `/modelpreset save` or the model hub, re-applied as a whole by `/modelpreset switch`.
 */
export interface ModelPreset {
    modelRoles: Record<string, string>;
    /** `defaultThinkingLevel` at save time; absent in hand-written presets that leave it alone. */
    defaultThinkingLevel?: SettingValueOf<typeof cfgDefaultThinkingLevel>;
}
export declare const cfgAuthBrokerUrl: import("./registry.js").Setting<string | undefined, "auth.broker.url">;
export declare const cfgAuthBrokerToken: import("./registry.js").Setting<string | undefined, "auth.broker.token">;
export declare const cfgAuthAccountPolicies: import("./registry.js").Setting<AuthAccountPolicies, "auth.accountPolicies">;
export declare const cfgEnabledModels: import("./registry.js").Setting<string[], "enabledModels">;
export declare const cfgEnabledProviders: import("./registry.js").Setting<string[], "enabledProviders">;
export declare const cfgDisabledProviders: import("./registry.js").Setting<string[], "disabledProviders">;
export declare const cfgModelRoleStorage: import("./registry.js").Setting<"global" | "project", "modelRoleStorage">;
export declare const cfgModelRoles: import("./registry.js").Setting<Record<string, string>, "modelRoles">;
/** Named model presets; no settings-panel UI — managed by `/modelpreset` and the model hub. */
export declare const cfgModelPresets: import("./registry.js").Setting<Record<string, ModelPreset>, "modelPresets">;
export declare const cfgModelTags: import("./registry.js").Setting<ModelTagsSettings, "modelTags">;
export declare const cfgModelProviderOrder: import("./registry.js").Setting<string[], "modelProviderOrder">;
export declare const cfgCycleOrder: import("./registry.js").Setting<string[], "cycleOrder">;
