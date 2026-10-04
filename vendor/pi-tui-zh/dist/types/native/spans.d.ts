import type { TspSpan, TspText } from "@oh-my-pi/pi-wire";
import { type ThemeBg } from "../theme/theme.js";
import type { NativeNode } from "./node.js";
/**
 * Convert ANSI-styled text into escape-free spans. SGR colours map back to
 * the omp theme tokens that produced them; OSC 8 becomes `href`; every other
 * escape (cursor moves, APC markers) is dropped.
 */
export declare function styledSpans(styled: string): TspSpan[];
/** The visible characters of ANSI-styled text: every escape dropped, sanitized like {@link styledSpans}. */
export declare function plainText(styled: string): string;
/** {@link plainText} as a single-line label: line breaks and whitespace runs collapse to one space. */
export declare function plainLine(styled: string): string;
/** Spans for plain text passed through an optional ANSI styler. */
export declare function styleSpans(content: string, style?: (text: string) => string): TspSpan[];
/** Collapse unstyled single-span text to a plain string (smaller frames). */
export declare function compactText(spans: readonly TspSpan[]): TspText;
/** Pre-rendered ANSI rows as one unwrapped text block (rows already carry their line breaks). */
export declare function rowsText(lines: readonly string[]): NativeNode;
/** Theme background token of the first SGR background in ANSI-styled text. */
export declare function styledBackground(styled: string): ThemeBg | undefined;
