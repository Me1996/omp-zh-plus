/**
 * Icon glyph normalization for native frames.
 *
 * Components style icons as Private Use Area codepoints (Nerd Font glyphs)
 * baked into text with a padding space, e.g. `{t:"<glyph> Model", s:"statusLineModel"}`.
 * The terminal draws icons and spaces them itself, so every PUA run becomes
 * its own span carrying the `icon` token next to the original tokens (colour
 * survives), and the single space that padded it from the neighbouring text
 * is dropped. Applied once, centrally, to every `TspText` field of a node's
 * props before they go on the wire.
 */
import type { TspKind, TspSpan, TspText } from "@oh-my-pi/pi-wire";
/** Spans with every PUA run split into an `icon` span; the same array when there is none. */
export declare function normalizeIconSpans(spans: readonly TspSpan[]): readonly TspSpan[];
/** A `TspText` with icons normalized; plain strings with icons become spans. */
export declare function normalizeIconText(text: TspText): TspText;
/** Props with every `TspText` field's icons normalized; the same object when nothing changed. */
export declare function normalizeIconProps(kind: TspKind, props: Readonly<Record<string, unknown>> | undefined): Readonly<Record<string, unknown>> | undefined;
