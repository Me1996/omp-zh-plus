import type { Model } from "@oh-my-pi/pi-ai";
import { type CompactionBoundaries, type ContextBreakdown } from "@oh-my-pi/pi-tui-zh/status-line/context-usage";
import type { ScopeLike } from "../config/registry.js";
import type { AgentSession } from "./agent-session.js";
/** Resolve session policy before handing pure boundary arithmetic to the UI. */
export declare function getSessionCompactionBoundaries(settings: ScopeLike, contextWindow: number, model?: Model | null): CompactionBoundaries | null;
/** Read host settings and optionally run the provider's inline-image planner. */
export declare function computeSessionContextBreakdown(session: AgentSession, options?: {
    snapcompactSavings?: boolean;
}): ContextBreakdown;
