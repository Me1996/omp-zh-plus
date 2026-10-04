import type { TuiPaint } from "@oh-my-pi/pi-tui-zh";
import type { StreamScreenFrame } from "./protocol.js";
import type { StreamRedactor } from "./redactor.js";
/** Paint coalescing window between encoder drains; bounds frame rate for live viewers and recordings alike. */
export declare const STREAM_FLUSH_INTERVAL_MS = 50;
/**
 * Convert one prepared terminal row into the stream-safe ANSI subset. Only SGR
 * and OSC 8 survive. Graphics placements become a visible text marker; OSC 66
 * contributes its visible payload without its terminal-specific scaling.
 */
export declare function normalizeStreamRow(row: string): string;
/**
 * Accumulates paints between drains and encodes them as ordered screen frames:
 * `reset`, `history`, `resize`, then one `viewport` snapshot or `patch`
 * against the last viewport this encoder emitted.
 */
export declare class StreamPaintEncoder {
    #private;
    /** `size` is the terminal geometry the consumer already announced (e.g. in `hello`). */
    constructor(size: {
        columns: number;
        rows: number;
    }, redactor: StreamRedactor);
    /** True when a drain would emit at least one frame. */
    get pending(): boolean;
    push(paint: TuiPaint): void;
    /** Redact rows pushed from now on with `redactor`; cached rows are dropped so the next paint re-redacts. */
    setRedactor(redactor: StreamRedactor): void;
    /** Make the next drain emit a full viewport snapshot, re-sending the last one when nothing is pending. */
    resync(): void;
    /**
     * Drain pending state into frames. With `screen: false` (consumer is
     * backpressured) only control frames are emitted; the viewport stays pending
     * and the next screen drain sends a full snapshot.
     */
    drain(options?: {
        screen?: boolean;
    }): StreamScreenFrame[];
}
