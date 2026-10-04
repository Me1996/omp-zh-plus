import type { AgentSession } from "../../session/agent-session.js";
import { type ConfiguredThinkingLevel } from "@oh-my-pi/pi-tui-zh/thinking";
/** Text shown when the active model has no thinking dial. */
export declare function noThinkingMessage(session: AgentSession): string;
/**
 * Resolve an `/effort <level>` argument to a selector the active model
 * accepts, or the message explaining why it cannot be applied. Shared by the
 * text/ACP handler and the TUI handler.
 */
export declare function resolveThinkingArgument(session: AgentSession, args: string): {
    level: ConfiguredThinkingLevel;
} | {
    error: string;
};
