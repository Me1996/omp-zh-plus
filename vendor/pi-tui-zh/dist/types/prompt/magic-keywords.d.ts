/**
 * Magic-keyword engine: standalone prose words the host registers via
 * {@link setMagicKeywords} glow with a per-word gradient in the editor and in
 * sent bubbles, and are exempt from spelling autocorrect. The host (coding-agent
 * `modes/magic-keywords.ts`) owns the word list and the notices each word
 * injects; this module only knows how to find and paint them.
 */
/** One registered magic keyword: the prose trigger and its editor gradient. */
export interface MagicKeywordSpec {
    /** Exact lowercase trigger, matched only as standalone prose. */
    readonly word: string;
    /** HSL hue sweep `[from, to]` in degrees painted across the word; `to` may exceed 360 to wrap through red. */
    readonly hue: readonly [number, number];
}
/**
 * Replace the registered keyword set. The host calls this once at startup;
 * until then nothing glows and no word is exempt from autocorrect.
 */
export declare function setMagicKeywords(specs: readonly MagicKeywordSpec[]): void;
/** Whether `word` is exactly a registered magic keyword (used to shield it from spelling autocorrect). */
export declare function isMagicKeyword(word: string): boolean;
/**
 * Whether `text` contains `word` as standalone lowercase prose — never inside
 * a code block, inline code span, or XML/HTML section. Pure: does not require
 * `word` to be registered.
 */
export declare function containsMagicKeyword(text: string, word: string): boolean;
/**
 * Gradient-highlight every registered keyword that appears as standalone
 * prose, skipping any occurrence inside a code block, inline code span, or
 * XML/HTML section. Each pass paints one word with its own gradient, so order
 * is irrelevant — earlier passes only inject zero-width SGR escapes (no
 * backticks or angle brackets), which never confuse later passes' markdown
 * masking.
 *
 * `resetTo` is the SGR foreground sequence restored after each painted keyword;
 * pass the surrounding text color when decorating already-colored content (e.g.
 * a themed message bubble) so the gradient does not bleed into the rest of the
 * line. Defaults to a plain foreground reset for default-colored editor text.
 *
 * `phase` ∈ [0, 1) cyclically rotates each gradient — the editor passes a
 * `Date.now()`-derived value to animate a Claude-Code-style shimmer while a
 * keyword is on screen and the prompt is focused; sent message bubbles omit it
 * to keep the static gradient.
 */
export declare function highlightMagicKeywords(text: string, resetTo?: string, phase?: number): string;
/**
 * UTF-16 ranges of every registered keyword standing as prose in `text`
 * (never inside code or XML/HTML sections), for decorating the keywords
 * without painting them: a TSP terminal draws the gradient sweep itself.
 */
export declare function magicKeywordRanges(text: string): {
    from: number;
    to: number;
}[];
/**
 * Cheap test for "does this text contain any registered keyword as standalone
 * prose?". Short-circuits on a substring probe before paying for the
 * markdown-aware prose check, so the common "no keyword in buffer" path is one
 * `String#includes` per word. Used by the live editor to gate the shimmer timer.
 */
export declare function hasMagicKeyword(text: string): boolean;
