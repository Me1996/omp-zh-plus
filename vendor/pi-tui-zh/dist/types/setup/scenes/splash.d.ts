import type { NativeNode } from "../../native/node.js";
export declare const SETUP_SPLASH_MS = 2600;
export declare const SETUP_TICK_MS = 33;
export declare function renderStarfield(width: number, height: number, frame: number): string[];
/**
 * Animated setup splash, in the spirit of the omp landing page: the brand π
 * mark rendered with the live diagonal gradient + shine sweep, rising out of a
 * rippling, gradient-lit water surface, under a faint twinkling starfield. The
 * mark and water share one continuous gradient so the sweep reads across the
 * whole scene; the water surface drifts each frame.
 */
export declare function renderSetupSplash(width: number, height: number, elapsedMs: number): string[];
/**
 * Native splash: the 2x brand mark with a terminal-clocked shimmer, the
 * wordmark, and the skip hint pinned to the bottom. The water and starfield
 * are cell paintings with no semantic counterpart. A click on the splash
 * sends the `skip` action.
 */
export declare function describeSetupSplash(): NativeNode;
