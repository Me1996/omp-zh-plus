/**
 * omp theme colours → TSP tones. Components that only hold ANSI stylers
 * (`(text) => string`) sample them with a probe string to recover the theme
 * token behind the escape, then map the token to a card/text tone.
 */
import type { TspTone } from "@oh-my-pi/pi-wire";
import { type ThemeBg, type ThemeColor } from "../theme/theme.js";
/** Theme background token of an ANSI background styler, sampled with a probe string. */
export declare function sampleBackground(bgFn: ((text: string) => string) | undefined): ThemeBg | undefined;
/** Theme foreground token of an ANSI colour styler, sampled with a probe string. */
export declare function sampleForeground(color: ((text: string) => string) | undefined): ThemeColor | undefined;
/** Card chrome derived from a background fill. */
export interface BackgroundChrome {
    tone?: TspTone;
    role?: string;
    selected?: boolean;
}
/** Map an omp background token to card tone/role. */
export declare function backgroundChrome(bg: ThemeBg | undefined): BackgroundChrome;
/**
 * Tone of an omp colour used as a severity or border colour; undefined for
 * colours that carry no tone (callers pick their own fallback).
 */
export declare function colorTone(color: ThemeColor | undefined): TspTone | undefined;
