/**
 * Smart unexpected-stop detection: asks one {@link NoulQuestion} whether a
 * text-only assistant turn promised to act and then ended. The judge comes
 * from the live `judge` role chain resolved by {@link resolveJudge}.
 */
import type { AgentTelemetryConfig } from "@oh-my-pi/pi-agent-core";
import type { AssistantMessage, Model } from "@oh-my-pi/pi-ai";
import type { ModelRegistry } from "../config/model-registry.js";
import type { Settings } from "../config/settings.js";
import { type JudgmentUsage } from "../judgment/index.js";
export interface ClassifyUnexpectedStopDeps {
    settings: Settings;
    registry: ModelRegistry;
    sessionId: string;
    /** Active session model; last resort of the judge role chain. */
    model?: Model;
    metadataResolver?: (provider: string) => Record<string, unknown> | undefined;
    /** Session ledger for the classification's billed attempts. */
    onUsage?: (usage: JudgmentUsage) => void;
    telemetry?: AgentTelemetryConfig;
    signal?: AbortSignal;
}
/** Detects terminal turns eligible for mechanical recovery or smart classification. */
export declare function isUnexpectedStopCandidate(message: AssistantMessage): boolean;
/** `true` for an unexpected stop, `false` for a normal end of turn, `undefined` when no judge could answer. */
export declare function classifyUnexpectedStop(text: string, deps: ClassifyUnexpectedStopDeps): Promise<boolean | undefined>;
