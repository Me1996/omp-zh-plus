/**
 * Shared helpers for the `/usage reset` command (TUI selector + ACP): turn the
 * live per-account reset-credit status into selector rows, and map a redeem
 * outcome code to a human message.
 */
import type { ResetCreditAccountStatus, ResetCreditRedeemOutcome } from "../../session/auth-storage.js";
import type { ResetUsageAccount } from "@oh-my-pi/pi-tui-zh/overlays/reset-usage-selector";
/** Provider name shown beside each exact saved-reset account option. */
export declare function formatResetProviderName(provider: string): string;
/**
 * Map live per-account reset status to selector rows. Sorted with the active
 * account first, then most-credits, then label.
 */
export declare function toResetUsageAccounts(statuses: ResetCreditAccountStatus[]): ResetUsageAccount[];
/** Human-facing summary of a redeem outcome for status lines and ACP output. */
export declare function describeRedeemOutcome(outcome: ResetCreditRedeemOutcome, label: string): string;
