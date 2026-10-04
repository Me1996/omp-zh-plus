/**
 * StdinBuffer buffers input and emits complete sequences.
 *
 * This is necessary because stdin data events can arrive in partial chunks,
 * especially for escape sequences like mouse events. Without buffering,
 * partial sequences can be misinterpreted as regular keypresses.
 *
 * For example, the mouse SGR sequence `\x1b[<35;20;5m` might arrive as:
 * - Event 1: `\x1b`
 * - Event 2: `[<35`
 * - Event 3: `;20;5m`
 *
 * The buffer accumulates these until a complete sequence is detected.
 * Call the `process()` method to feed input data.
 *
 * Based on code from OpenTUI (https://github.com/anomalyco/opentui)
 * MIT License - Copyright (c) 2025 opentui
 */
import { EventEmitter } from "events";
/** Terminal bracketed-paste open marker wrapping pasted input. */
export declare const BRACKETED_PASTE_START = "\u001B[200~";
/** Terminal bracketed-paste close marker wrapping pasted input. */
export declare const BRACKETED_PASTE_END = "\u001B[201~";
export type StdinBufferOptions = {
    /**
     * Maximum time to wait for sequence completion (default: 75ms).
     * After this time, a genuinely incomplete escape is flushed.
     */
    timeout?: number;
    /**
     * Maximum extra time (default: 150ms) an unambiguous escape partial — an
     * SGR mouse prefix, or any dangling escape while the kitty keyboard
     * protocol is active — is held past `timeout` waiting for its tail.
     */
    partialHoldTimeout?: number;
    /**
     * Paste-mode inactivity watchdog (default: 1000ms). If no input arrives for
     * this long while waiting for the bracketed-paste end marker, the paste is
     * assumed truncated: accumulated bytes are delivered and input recovers.
     */
    pasteTimeout?: number;
    /**
     * Paste-mode byte cap (default: 64 MiB). Exceeding it aborts paste mode the
     * same way, bounding memory when the end marker never arrives.
     */
    pasteByteLimit?: number;
};
export type StdinBufferEventMap = {
    data: [string];
    /**
     * A completed bracketed paste. `enter` carries an Enter keypress that shared
     * the paste's stdin read, so the terminal can dispatch paste and submit to
     * the same focused component before a paste-triggered overlay can take focus.
     */
    paste: [content: string, enter?: string];
};
/**
 * Buffers stdin input and emits complete sequences via the 'data' event.
 * Handles partial escape sequences that arrive across multiple chunks.
 */
export declare class StdinBuffer extends EventEmitter<StdinBufferEventMap> {
    #private;
    constructor(options?: StdinBufferOptions);
    process(data: string | Buffer): void;
    /**
     * Gate unbracketed raw-paste classification on event-loop responsiveness.
     * Terminal installs a probe once DECRQM confirms bracketed-paste (mode
     * 2004) support: a genuine paste then always arrives wrapped, so an
     * unmarked multiline burst is either an input-method commit — IME,
     * dictation, and emoji commits are typed input, never bracketed (#13344) —
     * or keystrokes an event-loop stall batched into one read (#12540). A burst
     * classified while `stalled()` reports a stall is replayed as the original
     * keys so every Enter submits; otherwise it is delivered as one paste.
     * `undefined` restores unconditional classification.
     */
    setRawPasteStallProbe(stalled: (() => boolean) | undefined): void;
    flush(): string[];
    clear(): void;
    getBuffer(): string;
    destroy(): void;
}
