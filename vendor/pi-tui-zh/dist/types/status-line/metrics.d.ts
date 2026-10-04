import type { Theme } from "../theme/index.js";
export { normalizePremiumRequests } from "@oh-my-pi/pi-utils";
/** Inputs whose differences are intentionally preserved between current status segments and the legacy footer. */
export interface BillingSummaryOptions {
    readonly cost: number;
    readonly usingSubscription: boolean;
    readonly premiumRequests: number;
    readonly fractionDigits: number;
    readonly pricingPeriod?: "peak" | "off-peak";
    /** Subagent-tree spend, rendered `(+…)` after the session's own spend; `cost` excludes it. */
    readonly subagentCost?: number;
    readonly advisor?: {
        readonly cost: number;
        readonly usingSubscription: boolean;
    };
}
/**
 * Shared billing metric presentation. Callers select precision explicitly so
 * the legacy footer keeps three decimals while current status segments keep two.
 * A unit symbol (`$` or the subscription mark) is printed at most once; later
 * amounts billed the same way render bare.
 */
export declare function formatBillingSummary(options: BillingSummaryOptions, uiTheme: Theme): string | undefined;
