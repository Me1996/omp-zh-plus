import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import { type ShimmerPalette } from "../theme/shimmer.js";
import type { TUI } from "../tui.js";
import { Text } from "./text.js";
/** Milliseconds between spinner-frame advances; exported so time-derived spinners elsewhere tick at the Loader cadence. */
export declare const SPINNER_ADVANCE_MS = 80;
/** A working-row variant (§6.5): a retry countdown, or context compaction. */
export type WorkingRowVariant = {
    readonly kind: "retry";
    readonly attempt: number;
    readonly max: number;
    /** The wait before the attempt, in ms, counted from the row's `startedAt`. */
    readonly delayMs: number;
} | {
    readonly kind: "compaction";
};
/** What the dock's working row (§8.1, role `omp.working`) shows. */
export interface WorkingRowSpec {
    /** The intent, or the variant's label ("Retrying · attempt 1 of 3", "Compacting context…"). */
    readonly label: string;
    /** Epoch ms the work started: the `elapsed` origin and the retry countdown start. */
    readonly startedAt: number;
    readonly variant?: WorkingRowVariant;
    /** Shimmer palette of the label (a session-accented intent). */
    readonly palette?: ShimmerPalette;
    /** Live tok/s, docked before the stop control. */
    readonly rate?: number;
    /** Key id that interrupts (`escape`); undefined hides the stop control (Esc would not cancel). */
    readonly interruptKey?: string;
}
/**
 * The dock's working row: `starburst` spinner (or a retry countdown ring),
 * the intent shimmering, `·`, the elapsed time, a grow spacer, then the stop
 * control whose click sends `interrupt`. Compaction adds an indeterminate
 * `progress` before the stop control; a retry says "Cancel".
 */
export declare function describeWorkingRow(spec: WorkingRowSpec, cx: DescribeContext, now?: number): NativeNode;
type ColorFn = (str: string) => string;
/**
 * Styles Loader message fragments without changing their visible text or width.
 * Set `animated` for colorizers whose ANSI output changes over time.
 */
export type LoaderMessageColorFn = ColorFn & {
    readonly animated?: true;
};
/** Animates a spinner and colorized message while asynchronous work is pending. */
export declare class Loader extends Text {
    #private;
    private spinnerColorFn;
    private messageColorFn;
    private message;
    constructor(ui: TUI, spinnerColorFn: ColorFn, messageColorFn: LoaderMessageColorFn, message?: string | (() => string), spinnerFrames?: string[]);
    /** Return the current message and animation state for debug inspection. */
    debugState(): Record<string, unknown>;
    render(width: number): readonly string[];
    /**
     * A `spinner` (or the static glyph of a one-frame loader, e.g. an interrupt
     * key hint) followed by the message, shimmering when the message colorizer
     * animates, and the right-docked trailer. The terminal clocks the motion.
     * Function messages are re-read whenever the engine revisits the loader.
     */
    describe(cx: DescribeContext): NativeNode;
    /**
     * Describe as the dock's working row ({@link describeWorkingRow}) instead
     * of a spinner line; `spec` is re-read whenever the engine revisits the
     * loader and `interrupt` answers a click on its stop control.
     */
    setWorkingRow(spec: () => WorkingRowSpec, interrupt: () => void): void;
    /** A click on the working row's stop control. */
    handleNativeEvent(event: NativeUiEvent): void;
    start(): void;
    stop(): void;
    /** Lifecycle teardown: stop the animation timer. Idempotent. */
    dispose(): void;
    /** Install a lazy right-docked suffix for the spinner row (e.g. a styled
     * session title). Re-evaluated every paint; dropped when the row leaves
     * less than a two-cell gap. */
    setTrailer(trailer: (() => string | undefined) | undefined): void;
    setMessage(message: string): void;
}
export {};
