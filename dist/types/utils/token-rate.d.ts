type MaybeAssistantMessage = {
    role?: string;
    timestamp?: number;
    duration?: number;
    usage?: {
        output?: number;
    };
};
export declare function calculateTokensPerSecond(messages: ReadonlyArray<MaybeAssistantMessage>, isStreaming: boolean, nowMs?: number): number | null;
/**
 * Live generation throughput for the working row: a kernel-weighted rate over
 * recent stream time, `Σ_scales tokens / Σ_scales time` with the sums decayed
 * on {@link METER_HALF_LIVES_MS}. A burst (a write's args) therefore shifts
 * the reading in proportion to its token mass against the last minute or so,
 * instead of replacing it.
 *
 * Streamed deltas are tokenized locally per bucket for the in-flight message
 * and kept in a separate set of sums. What the provider bills but never
 * streams — hidden or summarized reasoning, the tool-call envelope — is
 * modelled as a *hidden-token rate*: tokens accruing per ms of message span
 * on top of the visible deltas, estimated from recent messages as
 * `Σ(billed − local) / Σ span`. The in-flight message credits that rate
 * live, including through its silent lead-in; once `usage.output` lands the
 * residual is spread uniformly over the span and the message merges into
 * history. Additive, not multiplicative: a fast burst of visible tokens is
 * never amplified by what earlier messages hid.
 *
 * Stream time runs from {@link begin} to {@link end}; callers pass the
 * message's own request-start timestamp and `timestamp + duration` (epoch ms,
 * the `Date.now()` clock) so dispatch latency never shortens a span. Tool
 * execution between messages neither ages the sums nor counts as time, so the
 * readout holds across it. Each `AgentSession` owns one meter, so background
 * subagents keep their own reading; {@link seed} restores it from the last
 * completed turn after a history swap and {@link reset} blanks it.
 *
 * Whole-message averages come from {@link calculateTokensPerSecond} instead.
 */
export declare class TokenRateMeter {
    #private;
    constructor(count: (text: string) => number);
    /** Open a message at wall time `nowMs`; a message still open is dropped unbilled. */
    begin(nowMs?: number): void;
    /** Record streamed text at wall time `nowMs`; opens the message if {@link begin} was not called. */
    push(text: string, nowMs?: number): void;
    /**
     * Close the in-flight message. `outputTokens` is the provider's billed
     * output count; when absent or zero (aborted stream) the local estimate
     * stands and the hidden-token rate is left untouched.
     */
    end(outputTokens: number | undefined, nowMs?: number): void;
    /** Drop the window; the readout goes blank until a new run accumulates enough tokens. */
    reset(): void;
    /**
     * Seed the window from a completed turn (`outputTokens` over `durationMs`),
     * scaled past the evidence gate so even short turns read immediately. Like
     * a just-finished turn, the reading holds until the next message blends
     * with it or {@link reset} blanks it.
     */
    seed(outputTokens: number, durationMs: number): void;
    /** Tokens per second over the decayed window, or null until enough tokens have accumulated. */
    rate(nowMs?: number): number | null;
}
export {};
