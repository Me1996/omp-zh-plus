import { type UsageLimit } from "@oh-my-pi/pi-ai/usage";
export declare function isUsedOnlyAbsoluteAmount(limit: UsageLimit): boolean;
export declare function isRemainingOnlyAbsoluteAmount(limit: UsageLimit): boolean;
/**
 * Total the prepaid headroom a set of limits actually represents.
 *
 * A `scope.shared` limit is one account-wide pool observed once per stored
 * credential, so N keys on the same account yield N identical rows that must
 * collapse to a single value — summing them would claim several times the
 * credits a single request can draw on. Limits without the flag are genuinely
 * per-account and do add up. Returns `undefined` unless every limit is
 * remaining-only and agrees on a unit, so mixed buckets fall through to the
 * caller's own handling.
 */
export declare function totalRemainingOnly(limits: readonly UsageLimit[]): {
    value: number;
    unit: UsageLimit["amount"]["unit"];
} | undefined;
/** `"100 credits left"` for a bucket of remaining-only limits, else `undefined`. */
export declare function formatRemainingOnlyTotal(limits: readonly UsageLimit[]): string | undefined;
/**
 * Text for a bucket no quota bar can draw: spend-to-date or prepaid headroom.
 * Used-only limits report the worst (highest) spend; remaining-only limits go
 * through {@link totalRemainingOnly} so shared pools are not double-counted.
 */
export declare function formatAbsoluteOnlyAmount(limits: readonly UsageLimit[]): string | undefined;
