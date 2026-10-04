import { type Agent, type AgentEvent, type AgentMessage, type AgentTurnEndContext } from "@oh-my-pi/pi-agent-core";
import type { AssistantMessage, AssistantMessageEvent, Model } from "@oh-my-pi/pi-ai";
import type { Settings } from "../config/settings.js";
import type { SessionManager } from "./session-manager.js";
/** Capabilities borrowed by the session's streaming and loop guards. */
export interface StreamGuardsHost {
    agent: Agent;
    settings: Settings;
    sessionManager: SessionManager;
    model(): Model | undefined;
    isDisposed(): boolean;
    promptGeneration(): number;
    emitNotice(level: "info" | "warning" | "error", message: string, source?: string): void;
    schedulePostPromptTask(task: (signal: AbortSignal) => Promise<void>): void;
    discardAssistantTurn(message: AssistantMessage): void;
}
/** Guards streamed edit calls against invalid final previews. */
export declare class StreamingEditGuard {
    #private;
    constructor(host: StreamGuardsHost);
    /** Whether the current turn was aborted by streaming edit validation. */
    get abortTriggered(): boolean;
    /** Clears all turn-scoped streaming edit state. */
    reset(): void;
    /** Aborts an edit when the native engine's final preview reports an error. */
    maybeAbort(event: AgentEvent): void;
}
/** Detects cross-turn tool loops and Gemini reasoning-header runaways. */
export declare class LoopGuards {
    #private;
    constructor(host: StreamGuardsHost);
    /** Records a completed turn and injects a redirect when calls repeat. */
    recordTurn(messages: AgentMessage[], context: AgentTurnEndContext | undefined): void;
    /** Feeds a streamed assistant event to the Gemini header-runaway detector. */
    onAssistantEvent(message: AssistantMessage, event: AssistantMessageEvent): void;
}
