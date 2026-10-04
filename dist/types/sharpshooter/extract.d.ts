import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
import { type Model } from "@oh-my-pi/pi-ai";
import type { ModelRegistry } from "../config/model-registry.js";
import type { Settings } from "../config/settings.js";
import type { AgentSession } from "../session/agent-session.js";
/**
 * Await the session's in-flight extraction, bounded by `timeoutMs`. Called from
 * session disposal so short-lived processes (print mode) do not exit before a
 * just-fired extraction persists its deltas.
 */
export declare function flushSharpshooterExtraction(session: AgentSession, timeoutMs?: number): Promise<void>;
export interface SharpshooterEnvelope {
    prompt: string;
    previousHuman?: string;
    assistantContext?: string;
}
/** Build the extraction prompt and its bounded referent context from a transcript snapshot. */
export declare function buildSharpshooterEnvelope(messages: AgentMessage[], current?: AgentMessage): SharpshooterEnvelope | undefined;
/** Resolve the configured extraction model, then fall back to the `smol` role. */
export declare function resolveSharpshooterModel(settings: Settings, modelRegistry: ModelRegistry): Promise<Model | undefined>;
/** Start best-effort extraction for one committed user prompt without blocking the caller. */
export declare function maybeStartSharpshooterExtraction(options: {
    session: AgentSession;
    settings: Settings;
    modelRegistry: ModelRegistry;
    agentDir: string;
    /** The just-committed user message; falls back to the transcript's latest user message. */
    message?: AgentMessage;
}): void;
