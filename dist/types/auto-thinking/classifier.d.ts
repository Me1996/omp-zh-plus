/**
 * Per-prompt difficulty classifier for the `auto` thinking level.
 *
 * Asks one {@link ChoiceQuestion} about the user's request — or, for
 * task-spawned turns, about the delegator's `solutionSpace` description alone —
 * and maps the chosen level to a concrete {@link Effort}, clamped into the active model's
 * supported range (never below {@link Effort.Low}). The judge comes from the
 * live `judge` role chain. A local on-device candidate gets the coarser
 * `trivial|moderate|hard` question (3-class is more reliable
 * than 4-way ordinal on sub-2B models), mapped to `low|high|xhigh`.
 *
 * Throws on any failure (no judge, no key, unparseable output, abort/timeout);
 * the caller falls back to a concrete level and continues the turn.
 */
import type { AgentTelemetryConfig } from "@oh-my-pi/pi-agent-core";
import { Effort, type Model } from "@oh-my-pi/pi-ai";
import type { ModelRegistry } from "../config/model-registry.js";
import type { Settings } from "../config/settings.js";
import { type JudgmentUsage } from "../judgment/index.js";
/** The turn to classify. */
export interface DifficultyInput {
    /** The prompt text the agent is about to act on. */
    request: string;
    /**
     * Delegator's description of how open-ended the subtask is (task `solutionSpace` field).
     * When non-blank it replaces `request` as the sole classification input.
     */
    solutionSpace?: string;
}
export interface ClassifyDifficultyDeps {
    settings: Settings;
    registry: ModelRegistry;
    model: Model;
    sessionId?: string;
    signal?: AbortSignal;
    metadataResolver?: (provider: string) => Record<string, unknown> | undefined;
    onUsage?: (usage: JudgmentUsage) => void;
    telemetry?: AgentTelemetryConfig;
}
/**
 * Classify `input` and return a concrete effort clamped to `deps.model`,
 * or `undefined` when the model has no controllable effort surface (auto has
 * nothing to pick — the caller leaves the prior reasoning level in place).
 * @throws when the backend cannot produce a usable classification.
 */
export declare function classifyDifficulty(input: DifficultyInput, deps: ClassifyDifficultyDeps): Promise<Effort | undefined>;
