import type { AssistantMessage, Usage } from "@oh-my-pi/pi-ai";
import { Container } from "../tui.js";
/**
 * Prompt→yield wall time for a turn, from pure local timestamps: the user
 * prompt's timestamp to the response's completion time (`completedAt`, stamped
 * by the session at `message_end`). No provider-reported duration is involved —
 * messages persisted before the stamp existed simply have no span.
 * Undefined when either end is unknown (mid-attach or unstamped message).
 */
export declare function turnElapsedMs(turnStartedAt: number | undefined, message: {
    completedAt?: number;
}): number | undefined;
/** A finished turn's totals, the native `omp.turn.usage` line under its last answer. */
export interface TurnUsageSummary {
    /** Prompt→yield wall time; undefined when either end is unknown. */
    readonly elapsedMs: number | undefined;
    /**
     * Prompt tokens: input, cache writes and orchestration input. Cache reads
     * re-read the context each request, so they stay out (as in the status
     * line's total).
     */
    readonly input: number;
    /** Output tokens, orchestration output included. */
    readonly output: number;
    /** Billed cost in dollars. */
    readonly cost: number;
}
/**
 * Sums the requests of a turn. {@link add} returns the turn's summary on the
 * message that ends the run (any stop but `toolUse`) and starts over.
 */
export declare class TurnUsageTally {
    #private;
    /** Drop a partial turn (a new prompt, a fresh run). */
    reset(): void;
    add(message: AssistantMessage, turnStartedAt: number | undefined): TurnUsageSummary | undefined;
}
/**
 * The native turn line: `12.4s · 19K tok · $0.02 this turn` (the time drops
 * out when unknown, the cost when nothing was billed), and its tooltip with
 * exact counts.
 */
export declare function formatTurnUsage(summary: TurnUsageSummary): {
    text: string;
    title: string;
};
/** Format the metrics shared by standalone usage blocks and compact tool groups. */
export declare function formatUsageRow(usage: Usage, durationMs?: number, ttftMs?: number, timestamp?: number, turnElapsedMs?: number): string;
/** Whether `component` is a per-turn usage/metrics row from {@link createUsageRowBlock}. */
export declare function isUsageRowBlock(component: object): boolean;
export declare function createUsageRowBlock(usage: Usage, durationMs?: number, ttftMs?: number, timestamp?: number, turnElapsedMs?: number): Container;
