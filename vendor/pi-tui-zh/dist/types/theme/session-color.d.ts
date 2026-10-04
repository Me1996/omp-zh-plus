/** Theme-derived inputs for {@link getSessionAccentHex}; see `Theme.sessionAccentInputs`. */
export interface SessionAccentTheme {
    /** Theme accent hex; the session accent adopts its OKLCH lightness and chroma. */
    readonly accentHex: string;
    /** Major theme color hexes checked for hue collision. */
    readonly colorHexes: readonly string[];
    /** WCAG luminance of the status-line surface on light themes; undefined on dark themes. */
    readonly surfaceLuminance?: number;
}
/**
 * Derive a stable CSS hex accent color from a session name and the active theme.
 *
 * The session name hash picks only the **hue**, from a dark/light-specific
 * hue arc so the accent feels natural for the theme type: the full wheel on
 * dark minus hues whose vividness peak is unreachable under the dark
 * lightness cap (see {@link DARK_HUE_INTERVALS}); cool on light. **Lightness and chroma are carried over from the theme's own accent
 * color**, normalized to the sRGB gamut cusp of each hue: the lightness at
 * which a hue peaks in chroma varies wildly (yellow ≈ 0.97, blue ≈ 0.45), so
 * absolute OKLCH lightness cannot transfer between hues — a pink accent's
 * l≈0.67 re-hued to yellow is mustard, not vivid yellow. Instead the
 * accent's position relative to its own hue's cusp (lightness side and
 * chroma fraction) is re-applied at the target hue's cusp, so the session
 * accent inherits the theme's vividness at every hue. The hue is checked against all
 * theme color hues and shifted if it lands within {@link MIN_HUE_DISTANCE}
 * of one, but the shift walks along the admissible arc so it never drifts
 * into an unrelated or excluded part of the spectrum.
 *
 * On dark themes (`surfaceLuminance` undefined) the carried lightness is
 * clamped to stay visible on dark surfaces. On light themes it is reduced
 * until the accent's luminance clears {@link ACCENT_MIN_CONTRAST} against
 * the actual surface it renders on — legible on near-white *and* mid-light
 * backgrounds.
 *
 * @param name — session name for per-session uniqueness.
 * @param theme — accent hex, collision colors, and surface luminance of the active theme.
 */
export declare function getSessionAccentHex(name: string, theme: SessionAccentTheme): string;
/**
 * Convert a hex accent color to an ANSI foreground escape sequence matching
 * the detected terminal color depth.
 * Returns `undefined` if `hex` is nullish or Bun.color conversion fails.
 */
export declare function getSessionAccentAnsi(hex: string | undefined): string | undefined;
