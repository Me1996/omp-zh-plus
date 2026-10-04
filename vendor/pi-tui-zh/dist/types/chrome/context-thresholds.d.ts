import type { TspTone } from "@oh-my-pi/pi-wire";
import type { ThemeColor } from "../theme/index.js";
export type ContextUsageLevel = "normal" | "warning" | "purple" | "error";
export declare function getContextUsageLevel(contextPercent: number, contextWindow: number): ContextUsageLevel;
/**
 * `meter` tone switches matching {@link getContextUsageLevel}: warning from the
 * warning level, error from the error level, as shares of `contextWindow`.
 */
export declare function getContextMeterThresholds(contextWindow: number): {
    warn: number;
    bad: number;
};
/**
 * Format context usage as `<percent>%/<window>` when the model window is known.
 * Unknown windows render as `<tokens>/?`, because `0.0%/0` suggests a real
 * empty context instead of missing provider metadata.
 */
export declare function formatContextUsage(contextPercent: number | null | undefined, contextWindow: number, usedTokens?: number): string;
/** Chrome tone for a context-usage level; undefined while usage is normal. */
export declare function getContextUsageTone(level: ContextUsageLevel): TspTone | undefined;
export declare function getContextUsageThemeColor(level: ContextUsageLevel): ThemeColor;
