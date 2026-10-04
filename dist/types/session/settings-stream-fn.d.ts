/**
 * Settings-aware stream wrapper shared by the main agent (sdk.ts) and the
 * advisor agent (AgentSession.#buildAdvisorRuntime).
 *
 * verbosity, stream watchdog budgets, per-provider in-flight caps, and the loop
 * guard out of `Settings`
 * per request, layering them onto whatever options the caller passed. Before
 * this helper existed, advisor turns called bare `streamSimple` while the main
 * turn went through an inline closure that read these settings — so an advisor on
 * OpenRouter never saw `providers.openrouterVariant`, breaking sticky routing
 * and OpenRouter response-cache hits across advisor calls.
 */
import { type StreamFn } from "@oh-my-pi/pi-agent-core";
import { type Model } from "@oh-my-pi/pi-ai";
import type { Settings } from "../config/settings.js";
import { type AnthropicSlowModeLanes } from "./anthropic-slow-mode.js";
/** Map `providers.openaiWebsockets` to the provider `preferWebsockets` hint (`auto` → model default). */
export declare function resolveOpenAIWebsocketPreference(settings: Settings): boolean | undefined;
/** Session wiring for Anthropic subscription wrap-up and slow mode (`providers.anthropic.slowMode`). */
export interface SettingsStreamSlowModeContext {
    /** Defaults to the process-wide lane registry. */
    lanes?: AnthropicSlowModeLanes;
    /** Final gate before auto-accepting the lane for `model` (e.g. prefer sibling accounts). */
    canAutoAccept?: (model: Model) => boolean | Promise<boolean>;
    /** Route slow-mode notices to the requesting session. */
    notify?: (level: "info" | "warning" | "error", message: string) => void;
    /** Record which account lane served the session's latest Anthropic request. */
    onLane?: (lane: string) => void;
}
/**
 * Build a {@link StreamFn} that reads provider routing/guard settings from
 * `settings` per call and forwards to `base` (defaults to `streamSimple`).
 *
 * Caller-supplied `streamOptions` always win — the helper only fills holes.
 * The one exception is the output cap, which is lowered when prompt plus cap
 * would exceed the model's context window (see
 * {@link fitOutputTokensToContextWindow}); every request this session drives,
 * including side turns like `/btw`, goes through here.
 */
export declare function createSettingsAwareStreamFn(settings: Settings, base?: StreamFn, slowModeContext?: SettingsStreamSlowModeContext): StreamFn;
