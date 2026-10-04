/** Max gap (ms) between two spaces for the later one to count as OS key auto-repeat rather than a
 *  deliberate press. OS auto-repeat is fast; a deliberate tap (even a fast one) is slower. */
export declare const SPACE_REPEAT_MAX_GAP_MS = 120;
/** Two consecutive inter-space gaps are "mechanical" (machine-driven auto-repeat) when both are
 *  within {@link SPACE_REPEAT_MAX_GAP_MS} and differ by no more than this — an absolute jitter floor
 *  or, for slower repeat rates, {@link SPACE_REPEAT_JITTER_RATIO} of the smaller gap. OS key-repeat
 *  is metronomic; a human smashing the bar is fast but irregular, so its deltas never stay this
 *  steady. */
export declare const SPACE_REPEAT_JITTER_MS = 18;
export declare const SPACE_REPEAT_JITTER_RATIO = 0.35;
/** Consecutive mechanical (fast + steady) deltas that confirm the space bar is held and start
 *  recording. Needs a sustained metronomic cadence, so jittery smashing and deliberate taps never
 *  reach it. */
export declare const SPACE_HOLD_MECHANICAL_RUN = 2;
/** Idle gap (ms) after the last repeated space that counts as the space bar being released, ending
 *  the push-to-talk recording. Must comfortably exceed the OS key-repeat interval. */
export declare const SPACE_HOLD_RELEASE_MS = 250;
/** What a recognized space-bar hold drives — the push-to-talk start and stop. */
export interface SpaceHoldHandler {
    /** Gate for the gesture. Returns false to keep the space bar inserting spaces normally, so
     *  disabling push-to-talk restores plain space behavior. */
    enabled(): boolean;
    /** A sustained hold was recognized. The optimistically-typed spaces have already been deleted. */
    onStart(): void;
    /** The held space bar was released (an idle gap with no further repeated spaces, or any other key). */
    onEnd(): void;
}
/** What the host must do with a keypress after {@link SpaceHoldGesture.process} has seen it:
 *  `"pass"` — handle it normally; `"type"` — insert the space now (it is tracked back out if the run
 *  turns into a hold); `"swallow"` — drop it, the gesture consumed it. */
export type SpaceHoldStep = "pass" | "type" | "swallow";
/** Space-hold push-to-talk state machine. A held space bar emits OS auto-repeat: a *steady* stream
 *  of spaces at a fixed fast interval. We watch the inter-space deltas and only recognize a hold once
 *  {@link SPACE_HOLD_MECHANICAL_RUN} consecutive deltas are "mechanical" — both auto-repeat-fast and
 *  near-identical (see {@link gapsAreMechanical}). Smashing the bar is fast but jittery and deliberate
 *  taps are too slow, so neither escalates and both keep typing real spaces; the few spaces typed
 *  before a real hold is recognized are tracked back out of the host input. */
export declare class SpaceHoldGesture {
    #private;
    /** Unset (the default) keeps the space bar typing spaces. */
    handler: SpaceHoldHandler | undefined;
    constructor(deleteTyped: (count: number) => void, allowed?: () => boolean);
    /** Feed one keypress, `isSpace` when it is a plain space bar press. */
    process(isSpace: boolean): SpaceHoldStep;
}
