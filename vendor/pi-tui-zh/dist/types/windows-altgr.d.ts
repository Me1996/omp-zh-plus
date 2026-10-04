/**
 * Recover AltGr text that Windows console hosts drop under the kitty keyboard protocol.
 *
 * The kitty encoder shipped in Windows Terminal / OpenConsole before
 * microsoft/terminal#20052 reports AltGr+key as Alt (or Ctrl+Alt) plus the
 * layout's *unmodified* base key, without the produced text: Hungarian
 * AltGr+F arrives as `CSI 102;3u` instead of `[`. The byte stream is then
 * indistinguishable from a real Alt+F shortcut, so the character is lost and
 * the chord fires `alt+f` bindings instead.
 *
 * Recovery reads two pieces of local state the bytes lack:
 *  - whether Right Alt (AltGr) is physically held, via `GetAsyncKeyState`;
 *  - what the active keyboard layout's AltGr layer produces for the base key,
 *    via `ToUnicodeEx`.
 *
 * Layouts without an AltGr layer (US, UK, ...) resolve to an empty table once and
 * short-circuit every later event. The per-layout table is built once and cached;
 * it is rebuilt only when the foreground window reports a different layout handle.
 *
 * Known limitation: AltGr keys that produce a dead key on the active layout have no
 * table entry (`ToUnicodeEx` reports them as pending composition, not text), so those
 * chords keep reaching Alt bindings.
 */
import { type Pointer } from "bun:ffi";
/** Keyboard layout handle (`HKL`) as `bun:ffi` surfaces pointer-sized values. */
export type KeyboardLayoutHandle = Pointer | bigint;
/**
 * AltGr layer of an explicit layout handle (`HKL`), keyed `"<baseCodepoint>:<shift 0|1>"`.
 * Test seam: lets a harness inspect a loaded layout without making it the active one.
 */
export declare function readAltGrLayer(hkl: KeyboardLayoutHandle): ReadonlyMap<string, string>;
/** Local keyboard state the translator reads; injectable so tests need no live desktop. */
export interface AltGrHost {
    /** AltGr layer of the layout that produced the keystroke, keyed like {@link readAltGrLayer}. */
    activeLayer(): ReadonlyMap<string, string>;
    /** Whether Right Alt (AltGr) is held, or was within the last {@link RIGHT_ALT_LATCH_MS}. */
    isRightAltDown(): boolean;
}
/**
 * How long an observed Right Alt press keeps counting as held. Key state is sampled
 * at processing time, and one stdin read can carry several queued AltGr repeats that
 * are dispatched synchronously after the key is released; the latch keeps that tail
 * typing text. Far shorter than any release-then-Left-Alt chord a person can press.
 */
export declare const RIGHT_ALT_LATCH_MS = 30;
/** Wrap a raw Right Alt probe so a press stays observed for {@link RIGHT_ALT_LATCH_MS}. */
export declare function createRightAltLatch(isDownNow: () => boolean, now: () => number): () => boolean;
/**
 * Translate a kitty CSI-u Alt/Ctrl+Alt chord into the text AltGr produced, or
 * `undefined` when the sequence is not an AltGr keystroke on the active layout.
 *
 * Only call this on native Windows ConPTY hosts with the kitty protocol active.
 */
export declare function translateWindowsAltGrSequence(data: string, host?: AltGrHost): string | undefined;
