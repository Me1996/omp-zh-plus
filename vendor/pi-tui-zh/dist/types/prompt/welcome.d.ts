import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Component } from "../tui.js";
/** Pick a tip from `tips`, biased toward "[NEW]" tips by {@link NEW_TIP_WEIGHT};
 *  `r` is a uniform sample in [0, 1). Returns "" when `tips` is empty.
 *  Exported for tests. */
export declare function pickWeightedTip(tips: readonly string[], r: number): string;
/**
 * The welcome tip as lines of at most `width` columns: `Tip:` and the body
 * wrapped together, with no indent, so the banner can center each line.
 * `[]` when `width` leaves no room for a useful line.
 */
export declare function renderWelcomeTip(tip: string, width: number, phase?: number): string[];
/**
 * The session's welcome banner. In a terminal: the gradient logo beside the
 * `omp` wordmark with the version under it (the logo alone when the lockup does
 * not fit) and the tip of the session (dropped below {@link TIP_MIN_COLUMNS}
 * columns). Natively: a card with the same logo, wordmark, version and tip
 * ({@link WelcomeComponent.describe}).
 */
export declare class WelcomeComponent implements Component {
    #private;
    private version;
    constructor(version: string);
    get tip(): string | undefined;
    invalidate(): void;
    /**
     * A `card` (`omp.welcome`) mirroring the terminal banner: the lockup
     * (`omp.welcome.lockup`: the terminal's builtin `omp` mark, which it animates,
     * beside the wordmark with the version under it) and the tip of the session.
     * Roles carry the look (gradient logo, type scale); a "[NEW]" tip
     * carries a terminal-clocked shimmering tag.
     */
    describe(_cx: DescribeContext): NativeNode;
    /** The intro keeps the welcome block mutable; settling lets it retire to history. */
    isTranscriptBlockFinalized(): boolean;
    /**
     * Play a one-shot intro that sweeps the gradient through every phase
     * before settling on the resting frame. Safe to call multiple times —
     * subsequent calls reset and replay.
     */
    playIntro(requestRender: () => void): void;
    /**
     * Redirect a running intro's render callback to a new target when a host
     * remounts this component mid-animation.
     * Returns true while the intro is still animating; false = no-op (settled).
     */
    retargetIntro(requestRender: () => void): boolean;
    /** Stop the intro immediately and settle on the resting frame. Safe when idle. */
    stopIntro(): void;
    /** Update the version embedded in the welcome border title. */
    setVersion(version: string): void;
    render(termWidth: number): readonly string[];
}
/** Block-grid brand mark shared by the welcome and setup surfaces. */
export declare const PI_LOGO: string[];
/** The block-grid brand mark as accent lines; `shimmer` declares the terminal-clocked shine sweep. */
export declare function logoNode(lines: readonly string[], shimmer: boolean): NativeNode;
export interface ShineConfig {
    /** Overall opacity of the shine overlay, in [0, 1]. */
    strength: number;
    /** Center of the shine band along the diagonal, in [0, 1]. */
    pos: number;
}
/**
 * Resolve the gradient SGR foreground escape for a normalized position `t`
 * (0..1) along the diagonal, compositing the optional sliding shine highlight.
 * Shared by {@link gradientLogo} and the setup splash so both stay
 * color-identical (truecolor when available, 256-color ramp otherwise).
 */
export declare function gradientEscape(t: number, shine?: ShineConfig): string;
/**
 * Apply a multi-stop diagonal gradient (top-left → bottom-right) plus an
 * optional sliding shine band across multi-line art. `phase` (0..1) shifts the
 * gradient along the diagonal, wrapping at 1. When `shine` is provided, a soft
 * white highlight is composited on top, centered at `shine.pos`.
 */
export declare function gradientLogo(lines: readonly string[], phase?: number, shine?: ShineConfig): string[];
