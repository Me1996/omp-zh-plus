/** Decode a hex color into RGB channels. */
export declare function hexChannels(hex: string): [number, number, number];
/** Linear blend of two hex colors (`t` = 0 → `a`, 1 → `b`). */
export declare function mixHex(a: string, b: string, t: number): string;
/** Encode a truecolor background escape sequence. */
export declare function bgAnsiHex(hex: string): string;
/** Encode a truecolor foreground escape sequence. */
export declare function fgAnsiHex(hex: string): string;
/** True when the theme sits on a dark surface. */
export declare function isDark(): boolean;
/** The theme's canvas color: the surface diff tints and pills blend toward. */
export declare function canvasHex(): string;
/** The theme's default text color, used as the "bright" mix pole. */
export declare function textHex(): string;
/** Perceptual luminance of a hex color (0..1). */
export declare function luminance(hex: string): number;
/**
 * Re-assert a background after any reset inside syntax-highlighted text so a
 * row tint survives token boundaries emitted by the highlighter.
 */
export declare function withBg(text: string, bg: string): string;
/**
 * Filled pill button with half-block end caps (`▐ label ▌`), colored from a
 * theme hex. Label contrast follows the fill's luminance. Visible width is
 * `label.length + 2`.
 */
export declare function pill(label: string, hex: string, options?: {
    selected?: boolean;
    dim?: boolean;
}): string;
/**
 * Flat filled chip with a contrast-computed label — readable on any theme,
 * unlike accent-on-selection combinations that can collapse (e.g. dark blue
 * on light blue).
 */
export declare function chipFill(label: string, hex: string): string;
/**
 * Selection-row background: a canvas-adjacent surface (canvas nudged toward
 * the text color) so every theme foreground stays readable on it — unlike
 * `selectedBg`, which some themes define as a saturated color.
 * `dim` renders a fainter band for cursors in unfocused panes.
 */
export declare function selectionBgAnsi(dim?: boolean): string;
/** Tinted chip: faint fill of a theme color with the full color as label. */
export declare function tintChip(label: string, hex: string): string;
/** Subtle toggle chip: accent fill when active, neutral surface otherwise. */
export declare function softPill(label: string, options?: {
    active?: boolean;
}): string;
