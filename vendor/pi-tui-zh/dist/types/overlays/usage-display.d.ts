import type { UsageLimit, UsageReport, UsageResetCredits } from "@oh-my-pi/pi-ai";
/** Include the usage tier in a limit title unless its label already names it. */
export declare function formatLimitTitle(limit: UsageLimit): string;
/** Human-readable quota scope for a normalized saved-reset window ID. */
export declare function formatUsageResetWindow(windowId: string): string;
/** Saved inventory and current eligibility shared by every usage display. */
export interface UsageResetSummary {
    bankedCount: number;
    redeemableCount: number;
    soonestExpiry?: string;
    unavailableReason?: string;
}
/**
 * Normalize old count-only and current provider reset metadata for display.
 * `availableCount` is banked inventory; `redeemableCount` is the subset that
 * may be spent now. Older providers used `availableCount` for both.
 */
export declare function summarizeUsageResetCredits(reset: UsageResetCredits | undefined, nowMs?: number): UsageResetSummary | undefined;
/** Collapse routing-specific copies of a shared quota for user-facing usage views. */
export declare function collapseSharedUsageReports(reports: UsageReport[]): UsageReport[];
