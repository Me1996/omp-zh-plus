import { type Theme } from "../theme/theme.js";
import type { NativeNode } from "../native/node.js";
/** Title-case a provider id for display (`openai-codex` → `Openai Codex`). */
export declare function formatProviderName(provider: string): string;
/** Format a millisecond duration as a coarse-grained human label. */
export declare function formatCoarseDuration(ms: number): string;
type ProgressBarTheme = Pick<Theme, "bold" | "fg" | "getFgAnsi">;
/**
 * Native {@link renderAsciiBar}: a terminal-drawn progress bar with the same
 * percent label; `undefined` is indeterminate.
 */
export declare function describeAsciiBar(fraction: number | undefined): NativeNode;
/**
 * Render an ASCII progress bar with a trailing percent label.
 * `fraction` is clamped to `[0, 1]`. `undefined` renders a dotted placeholder.
 */
export declare function renderAsciiBar(fraction: number | undefined, width?: number, uiTheme?: ProgressBarTheme): string;
export {};
