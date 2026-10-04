import { type ResetCreditAccountStatus, type ResetCreditTarget, type UsageReport } from "@oh-my-pi/pi-ai";
import { type CodexResetTrigger } from "./codex-auto-reset.js";
/** Why an account or grant is unsafe or unhelpful for automatic redemption. */
export type ClaudeResetSkipReason = "disabled" | "wrong-provider" | "no-identity" | "no-report" | "stale-report" | "credits-unknown" | "ineligible" | "no-credits" | "no-selected-credit" | "credit-unusable" | "credit-expired" | "provider-cooldown" | "reserve" | "no-blocked-window" | "unsupported-window" | "incomplete-coverage" | "no-reset-time" | "reset-too-soon" | "reset-implausible" | "no-expiring-credit" | "unsupported-program" | "window-mostly-free" | "already-attempted" | "deferred" | "cooldown";
/** Live grant eligibility and usage evidence for one deterministic planning pass. */
export interface ClaudeResetPlanInput {
    nowMs: number;
    trigger: CodexResetTrigger;
    provider: string;
    modelId: string;
    settings: {
        enabled: boolean;
        minBlockedMinutes: number;
        keepCredits: number;
        salvageHorizonMs: number;
    };
    /** Fresh usage for every stored Claude account. */
    reports: UsageReport[] | null;
    /** Authoritative live Cedar/Juniper eligibility for every stored account. */
    statuses: readonly ResetCreditAccountStatus[];
    attemptedKeys: ReadonlySet<string>;
    deferredUntilByKey: ReadonlyMap<string, number>;
    lastAttemptAtByAccount: ReadonlyMap<string, number>;
    /** Provider retry hint for the active account, captured at the 429. */
    activeBlockUnblockAtMs?: number;
}
/** One server-selected Claude grant to redeem for an exact stored credential. */
export interface ClaudeResetAction {
    reason: "blocked-account" | "expiring-credit";
    target: ResetCreditTarget;
    accountKey: string;
    attemptKey: string;
    label: string;
    availableCount: number;
    remainingMs?: number;
    blockedWindows?: string[];
    expiresInMs?: number;
    salvageWindow?: string;
    salvageUsedFraction?: number;
    active: boolean;
    program: string;
    title?: string;
    requiresLimit: boolean;
}
/** Account-scoped diagnostic explaining why a planning rule did not spend. */
export interface ClaudeResetSkip {
    accountKey: string;
    rule: "blocked-account" | "expiring-credit" | "account";
    reason: ClaudeResetSkipReason;
}
/** At most one blocked-account restore followed by independent expiry salvages. */
export interface ClaudeResetPlan {
    actions: ClaudeResetAction[];
    skipped: ClaudeResetSkip[];
}
/**
 * Pure Claude Cedar/Juniper auto-spend planner. The live listing is the sole
 * authority for eligibility and grant selection: an absent/failed status never
 * falls back to a cached report or guesses a different grant.
 */
export declare function planClaudeResetRedemptions(input: ClaudeResetPlanInput): ClaudeResetPlan;
