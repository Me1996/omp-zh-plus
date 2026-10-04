/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import { type SettingValueOf } from "../config/registry.js";
/** One bash-interceptor rule: commands matching `pattern` are redirected to `tool`. */
export interface BashInterceptorRule {
    pattern: string;
    flags?: string;
    tool: string;
    message: string;
    allowSubcommands?: string[];
}
export declare const DEFAULT_BASH_INTERCEPTOR_RULES: BashInterceptorRule[];
export declare const cfgShellPath: import("../config/registry.js").Setting<string | undefined, "shellPath">;
export declare const cfgBashEnabled: import("../config/registry.js").Setting<boolean, "bash.enabled">;
export declare const cfgBashAllowCompoundCommands: import("../config/registry.js").Setting<boolean, "bash.allowCompoundCommands">;
export declare const cfgBashAutoBackgroundEnabled: import("../config/registry.js").Setting<boolean, "bash.autoBackground.enabled">;
export declare const cfgBashPatterns: import("../config/registry.js").Setting<readonly [], "bash.patterns">;
export declare const cfgBashInterceptorEnabled: import("../config/registry.js").Setting<boolean, "bashInterceptor.enabled">;
export declare const cfgBashInterceptorPatterns: import("../config/registry.js").Setting<BashInterceptorRule[], "bashInterceptor.patterns">;
export declare const cfgBashDirenv: import("../config/registry.js").Setting<"auto" | "off", "bash.direnv">;
export declare const cfgBashDirenvLoadTimeoutMs: import("../config/registry.js").Setting<number, "bash.direnvLoadTimeoutMs">;
export declare const cfgShellMinimizerEnabled: import("../config/registry.js").Setting<boolean, "shellMinimizer.enabled">;
export declare const cfgShellMinimizerSettingsPath: import("../config/registry.js").Setting<string | undefined, "shellMinimizer.settingsPath">;
export declare const cfgShellMinimizerOnly: import("../config/registry.js").Setting<string[], "shellMinimizer.only">;
export declare const cfgShellMinimizerExcept: import("../config/registry.js").Setting<string[], "shellMinimizer.except">;
export declare const cfgShellMinimizerMaxCaptureBytes: import("../config/registry.js").Setting<number, "shellMinimizer.maxCaptureBytes">;
export declare const cfgShellMinimizerSourceOutlineLevel: import("../config/registry.js").Setting<"aggressive" | "default", "shellMinimizer.sourceOutlineLevel">;
export declare const cfgShellMinimizerLegacyFilters: import("../config/registry.js").Setting<boolean | undefined, "shellMinimizer.legacyFilters">;
/** Shell output minimizer configuration (`shellMinimizer.*`). */
export declare const cfgShellMinimizer: import("../config/registry.js").Derived<import("../config/registry.js").DerivedValues<{
    enabled: import("../config/registry.js").Setting<boolean, "shellMinimizer.enabled">;
    settingsPath: import("../config/registry.js").Setting<string | undefined, "shellMinimizer.settingsPath">;
    only: import("../config/registry.js").Setting<string[], "shellMinimizer.only">;
    except: import("../config/registry.js").Setting<string[], "shellMinimizer.except">;
    maxCaptureBytes: import("../config/registry.js").Setting<number, "shellMinimizer.maxCaptureBytes">;
    sourceOutlineLevel: import("../config/registry.js").Setting<"aggressive" | "default", "shellMinimizer.sourceOutlineLevel">;
    legacyFilters: import("../config/registry.js").Setting<boolean | undefined, "shellMinimizer.legacyFilters">;
}>>;
/** Shell output minimizer configuration ({@link cfgShellMinimizer}). */
export type ShellMinimizerSettings = SettingValueOf<typeof cfgShellMinimizer>;
export declare const cfgBashAutoBackgroundThresholdMs: import("../config/registry.js").Setting<number, "bash.autoBackground.thresholdMs">;
