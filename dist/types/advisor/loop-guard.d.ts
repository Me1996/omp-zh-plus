import type { AgentMessage, AgentTurnEndContext } from "@oh-my-pi/pi-agent-core";
import type { Settings } from "../config/settings.js";
/** Capabilities the advisor loop guard borrows from its agent. */
export interface AdvisorLoopGuardHost {
    settings: Settings;
    /** Advisor name, for log attribution only. */
    name: string;
    /** The advisor agent's live context array. */
    liveMessages(): AgentMessage[];
    /** Appends to the advisor agent's live context. */
    appendMessage(message: AgentMessage): void;
    /** Stops the current advisor update after it ignores one corrective. */
    abort(reason: Error): void;
}
/**
 * Bounds repeated identical tool calls inside an advisor's own `Agent` loop.
 *
 * Advisors drive a private loop that never passes through the primary session's
 * `LoopGuards`, so a model reissuing one failing call had no bound at all:
 * `AdvisorRuntime` counts whole-turn provider failures, which a turn that
 * *succeeds* while burning dozens of identical failing tool calls never trips.
 * Reuses the primary's `model.toolCallLoopGuard.*` settings and corrective so
 * one knob governs both loops (issue #9491).
 */
export declare class AdvisorLoopGuard {
    #private;
    constructor(host: AdvisorLoopGuardHost);
    /** Clear detector and escalation state at an advisor update/context boundary. */
    reset(): void;
    /** Records one completed advisor turn and injects a redirect when calls repeat. */
    recordTurn(messages: AgentMessage[], context: AgentTurnEndContext | undefined): void;
}
