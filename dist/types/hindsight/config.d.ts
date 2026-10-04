/**
 * Resolved Hindsight runtime configuration.
 *
 * Every field reads a `hindsight.*` setting handle. Handles declare their `HINDSIGHT_*`
 * environment variable, which wins over the settings layers because operators frequently
 * override per-shell (CI, prod) without touching the persisted settings file.
 */
import type { Settings } from "../config/settings.js";
export type HindsightScoping = "global" | "per-project" | "per-project-tagged";
export interface HindsightConfig {
    hindsightApiUrl: string | null;
    hindsightApiToken: string | null;
    bankId: string | null;
    bankIdPrefix: string;
    scoping: HindsightScoping;
    bankMission: string;
    retainMission: string | null;
    autoRecall: boolean;
    autoRetain: boolean;
    retainMode: "full-session" | "last-turn";
    retainEveryNTurns: number;
    retainOverlapTurns: number;
    retainContext: string;
    recallBudget: "low" | "mid" | "high";
    recallMaxTokens: number;
    recallTypes: string[];
    recallContextTurns: number;
    recallMaxQueryChars: number;
    recallPromptPreamble: string;
    debug: boolean;
    /** Default per-request client deadline (ms) for ops without a specific override. */
    requestTimeoutMs: number;
    /** Client deadline (ms) for reflect (agentic synthesis; costlier than a metadata fetch). */
    reflectTimeoutMs: number;
    /** Client deadline (ms) for recall. */
    recallTimeoutMs: number;
    /** Client deadline (ms) for retain / retainBatch. */
    retainTimeoutMs: number;
    mentalModelsEnabled: boolean;
    mentalModelAutoSeed: boolean;
    mentalModelMaxRenderChars: number;
}
/**
 * Load the resolved Hindsight config. `HINDSIGHT_*` environment variables override settings
 * through the setting definitions (`hindsight/settings.ts`); invalid values fall back to defaults.
 */
export declare function loadHindsightConfig(settings: Settings): HindsightConfig;
/** Whether the caller has enough config to talk to a Hindsight server. */
export declare function isHindsightConfigured(config: HindsightConfig): config is HindsightConfig & {
    hindsightApiUrl: string;
};
