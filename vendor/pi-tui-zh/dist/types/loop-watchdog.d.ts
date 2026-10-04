export interface LoopWatchdogOptions {
    /** How far ahead each probe tick is scheduled, in ms. Default 250. */
    intervalMs?: number;
    /** A tick later than this past its deadline counts as a block. Default 250. */
    thresholdMs?: number;
    /** Overshoot beyond this is suppressed only when the process burned negligible CPU. Default 60_000. */
    sleepMs?: number;
    /** Monotonic clock source; injectable for tests. Default `performance.now`. */
    now?: () => number;
    /** Process CPU time in ms; injectable for tests. Default `process.cpuUsage`. */
    cpuNow?: () => number;
    /** Timer source; injectable for tests. Default `setTimeout`. */
    schedule?: (cb: () => void, ms: number) => LoopWatchdogTimer;
}
/**
 * Timer handle the watchdog arms. `cancel`, when present, is invoked on stop()
 * so a stopped watchdog leaves no armed timer to wake the loop even once.
 */
interface LoopWatchdogTimer {
    unref?(): void;
    cancel?(): void;
}
/**
 * Always-on event-loop lag probe. Each tick is scheduled `intervalMs` ahead of
 * a recorded deadline; a tick that fires `thresholdMs` past its deadline means
 * the loop was blocked that long. The overshoot is logged once on the rising
 * edge (one block ⇒ one line, deduped via `#wasBlocked`), tagged with the phase
 * active during the elapsed interval via {@link takeRecentLoopPhase} — which
 * survives the synchronous push/pop the instrumented hot paths do before this
 * delayed tick can run — so the stall names its cause instead of "unknown".
 *
 * The handle is `unref`'d so the probe never keeps the process alive, and stop()
 * cancels the armed timer when the handle exposes `cancel` (the default
 * `setTimeout` handle does, via `clearTimeout`). The `#generation` guard remains
 * as a fallback for injected handles that cannot cancel.
 *
 * A long overshoot is classified by CPU time rather than by duration. System
 * sleep and a CPU-bound wedge both produce an arbitrarily large gap, so duration
 * alone cannot tell them apart, and suppressing on duration discards exactly the
 * worst stalls. Only a gap the process spent negligible CPU on is treated as
 * sleep. CPU accounting is process-wide, so worker activity errs toward logging.
 */
export declare class LoopWatchdog {
    #private;
    constructor(options?: LoopWatchdogOptions);
    start(): void;
    stop(): void;
    /**
     * Whether the loop is blocked right now — the armed tick is already more
     * than `thresholdMs` overdue — or a detected block ended within the last
     * `thresholdMs`. Input read at such a moment may be keystrokes the block
     * batched into one read. Resolves both orders in which a resumed loop can
     * run the late tick and the queued stdin read. A suspended-process gap is
     * not a stall, and a stopped watchdog never reports one.
     */
    isStalled(): boolean;
}
export {};
