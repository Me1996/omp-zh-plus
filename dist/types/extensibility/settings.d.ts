/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import { type SettingValueOf } from "../config/registry.js";
export declare const cfgExtensions: import("../config/registry.js").Setting<string[], "extensions">;
export declare const cfgDisabledExtensions: import("../config/registry.js").Setting<string[], "disabledExtensions">;
export declare const cfgSkillsRegistryUrl: import("../config/registry.js").Setting<string, "skills.registryUrl">;
export declare const cfgSkillsEnabled: import("../config/registry.js").Setting<boolean, "skills.enabled">;
export declare const cfgSkillsEnableSkillCommands: import("../config/registry.js").Setting<boolean, "skills.enableSkillCommands">;
export declare const cfgSkillsEnableCodexUser: import("../config/registry.js").Setting<boolean, "skills.enableCodexUser">;
export declare const cfgSkillsEnableClaudeUser: import("../config/registry.js").Setting<boolean, "skills.enableClaudeUser">;
export declare const cfgSkillsEnableClaudeProject: import("../config/registry.js").Setting<boolean, "skills.enableClaudeProject">;
export declare const cfgSkillsEnablePiUser: import("../config/registry.js").Setting<boolean, "skills.enablePiUser">;
export declare const cfgSkillsEnablePiProject: import("../config/registry.js").Setting<boolean, "skills.enablePiProject">;
export declare const cfgSkillsEnableAgentsUser: import("../config/registry.js").Setting<boolean, "skills.enableAgentsUser">;
export declare const cfgSkillsEnableAgentsProject: import("../config/registry.js").Setting<boolean, "skills.enableAgentsProject">;
export declare const cfgSkillsCustomDirectories: import("../config/registry.js").Setting<string[], "skills.customDirectories">;
export declare const cfgSkillsIgnoredSkills: import("../config/registry.js").Setting<string[], "skills.ignoredSkills">;
export declare const cfgSkillsIncludeSkills: import("../config/registry.js").Setting<string[], "skills.includeSkills">;
/** Skill discovery options (`skills.*` except the `omp skill` registry URL). */
export declare const cfgSkills: import("../config/registry.js").Derived<import("../config/registry.js").DerivedValues<{
    enabled: import("../config/registry.js").Setting<boolean, "skills.enabled">;
    enableSkillCommands: import("../config/registry.js").Setting<boolean, "skills.enableSkillCommands">;
    enableCodexUser: import("../config/registry.js").Setting<boolean, "skills.enableCodexUser">;
    enableClaudeUser: import("../config/registry.js").Setting<boolean, "skills.enableClaudeUser">;
    enableClaudeProject: import("../config/registry.js").Setting<boolean, "skills.enableClaudeProject">;
    enablePiUser: import("../config/registry.js").Setting<boolean, "skills.enablePiUser">;
    enablePiProject: import("../config/registry.js").Setting<boolean, "skills.enablePiProject">;
    enableAgentsUser: import("../config/registry.js").Setting<boolean, "skills.enableAgentsUser">;
    enableAgentsProject: import("../config/registry.js").Setting<boolean, "skills.enableAgentsProject">;
    customDirectories: import("../config/registry.js").Setting<string[], "skills.customDirectories">;
    ignoredSkills: import("../config/registry.js").Setting<string[], "skills.ignoredSkills">;
    includeSkills: import("../config/registry.js").Setting<string[], "skills.includeSkills">;
}>>;
/** Skill discovery options ({@link cfgSkills}); omitted fields fall back to the setting defaults. */
export type SkillsSettings = Partial<SettingValueOf<typeof cfgSkills>>;
export declare const cfgCommandsEnableClaudeUser: import("../config/registry.js").Setting<boolean, "commands.enableClaudeUser">;
export declare const cfgCommandsEnableClaudeProject: import("../config/registry.js").Setting<boolean, "commands.enableClaudeProject">;
export declare const cfgCommandsEnableOpencodeUser: import("../config/registry.js").Setting<boolean, "commands.enableOpencodeUser">;
export declare const cfgCommandsEnableOpencodeProject: import("../config/registry.js").Setting<boolean, "commands.enableOpencodeProject">;
export declare const cfgExtensionHandlersToolCallTimeoutMs: import("../config/registry.js").Setting<number, "extensionHandlers.toolCallTimeoutMs">;
