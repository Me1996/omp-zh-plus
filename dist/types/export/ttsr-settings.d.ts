/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import { type SettingValueOf } from "../config/registry.js";
export declare const cfgTtsrEnabled: import("../config/registry.js").Setting<boolean, "ttsr.enabled">;
export declare const cfgTtsrJudge: import("../config/registry.js").Setting<"auto" | "off" | "on", "ttsr.judge">;
export declare const cfgTtsrContextMode: import("../config/registry.js").Setting<"discard" | "keep", "ttsr.contextMode">;
export declare const cfgTtsrInterruptMode: import("../config/registry.js").Setting<"always" | "never" | "prose-only" | "tool-only", "ttsr.interruptMode">;
export declare const cfgTtsrRepeatMode: import("../config/registry.js").Setting<"after-gap" | "once", "ttsr.repeatMode">;
export declare const cfgTtsrRepeatGap: import("../config/registry.js").Setting<number, "ttsr.repeatGap">;
export declare const cfgTtsrBuiltinRules: import("../config/registry.js").Setting<boolean, "ttsr.builtinRules">;
export declare const cfgTtsrDisabledRules: import("../config/registry.js").Setting<string[], "ttsr.disabledRules">;
/** Time-traveling stream rules configuration (`ttsr.*`). */
export declare const cfgTtsr: import("../config/registry.js").Derived<import("../config/registry.js").DerivedValues<{
    enabled: import("../config/registry.js").Setting<boolean, "ttsr.enabled">;
    judge: import("../config/registry.js").Setting<"auto" | "off" | "on", "ttsr.judge">;
    contextMode: import("../config/registry.js").Setting<"discard" | "keep", "ttsr.contextMode">;
    interruptMode: import("../config/registry.js").Setting<"always" | "never" | "prose-only" | "tool-only", "ttsr.interruptMode">;
    repeatMode: import("../config/registry.js").Setting<"after-gap" | "once", "ttsr.repeatMode">;
    repeatGap: import("../config/registry.js").Setting<number, "ttsr.repeatGap">;
    builtinRules: import("../config/registry.js").Setting<boolean, "ttsr.builtinRules">;
    disabledRules: import("../config/registry.js").Setting<string[], "ttsr.disabledRules">;
}>>;
/** Time-traveling stream rules configuration ({@link cfgTtsr}). */
export type TtsrSettings = SettingValueOf<typeof cfgTtsr>;
