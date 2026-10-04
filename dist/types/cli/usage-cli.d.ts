/**
 * Usage CLI command handler.
 *
 * Handles `omp usage` — fetches provider usage reports for every
 * authenticated account and prints a detailed per-account breakdown
 * (limits, windows, reset times, plan metadata). Accounts whose
 * credentials produced no usage report are listed too, so the output
 * always covers the full credential pool.
 */
import { type AuthAccountPolicy, type DisabledCredentialSummary, type OAuthAccountIdentity, type UsageHistoryEntry, type UsageReport } from "@oh-my-pi/pi-ai";
import type { ClientUsageClientSummary } from "@oh-my-pi/pi-ai/usage";
import { type UsageAccountIdentity } from "../slash-commands/helpers/usage-accounts.js";
export interface UsageCommandArgs {
    action?: string;
    json?: boolean;
    provider?: string;
    redact?: boolean;
    /** Show recorded usage-limit history instead of a live snapshot. */
    history?: boolean;
    /** History window in days (with `history` or the `clients` action). */
    days?: number;
    /** CLI `-e <path>` extension paths to load before fetching live reports. */
    extensions?: string[];
    /** Skip extension discovery; only load explicit `extensions`. */
    noExtensions?: boolean;
}
export interface UsagePolicyDiagnosticsOptions {
    /** Existing global fallback used when an account has no reserve override. */
    globalReservePct: number;
    /** Delegates selector matching to AuthStorage's authoritative policy matcher. */
    getAccountPolicy: (provider: string, identity: OAuthAccountIdentity) => AuthAccountPolicy | undefined;
}
/**
 * Minimal-reveal masks for identity strings (`--redact`).
 *
 * Every mask shows a two-character anchor. When two identities share the
 * anchor, the mask additionally reveals the shortest "middle-out"
 * differentiator — the shortest substring (closest to the string's middle on
 * ties) that no colliding identity contains — as `an*`, `ca*9*`, `ca*nb*`.
 * Prefix growth is deliberately avoided: it leaks the start of the local
 * part (`can.boluk@*`) when a couple of mid-string characters suffice.
 * Duplicate strings (same account on two providers) share a mask.
 */
export declare function buildRedactionMap(values: Iterable<string>): Map<string, string>;
/** Per-window capacity stat: how much account quota is burned and left. */
export interface ProviderWindowStat {
    /** Compact window label, e.g. "5h", "7d". */
    window: string;
    durationMs?: number;
    /** Meter identity when a provider keeps independent meters in one window. */
    meter?: string;
    /** Accounts reporting a limit in this window. */
    accounts: number;
    /** Sum of each account's binding used fraction - accounts' worth of quota burned. */
    usedAccounts: number;
    /** Accounts' worth of quota still available across reporting accounts. */
    remainingAccounts: number;
}
/**
 * Aggregate one provider's reports into per-window quota capacity stats.
 *
 * Limits are bucketed by window duration (5h, 7d, ...). Within a bucket each
 * account contributes its single highest used fraction. Limits that hold their
 * own pool inside a window keep their own bucket: a model-scoped tier cap, and
 * Codex chat versus Spark, which can share a window duration.
 */
export declare function computeProviderWindowStats(reports: UsageReport[]): ProviderWindowStat[];
/**
 * Render the full text breakdown: per provider, per account, every limit
 * with a bar, amounts, and reset times; unattributed credentials trail
 * each provider section as "no usage data" rows.
 */
export declare function formatUsageBreakdown(reports: UsageReport[], accounts: UsageAccountIdentity[], nowMs: number, redaction?: Map<string, string>, disabled?: DisabledCredentialSummary[], policyOptions?: UsagePolicyDiagnosticsOptions): string;
/**
 * Render recorded usage-limit history: per provider, per account, one
 * peak-per-bucket sparkline per limit window plus latest/peak percentages.
 */
export declare function formatUsageHistory(entries: UsageHistoryEntry[], sinceMs: number, nowMs: number, redaction?: Map<string, string>): string;
/**
 * Render per-client token burn: one section per install (hostname, short
 * install id, last-seen), one row per (app, provider) aggregate, plus a
 * per-client total. Data comes from broker `/v1/usage/clients` or the local
 * agent DB when this machine hosts the broker.
 */
export declare function formatClientUsage(clients: ClientUsageClientSummary[], sinceMs: number, nowMs: number): string;
export declare function runUsageCommand(cmd: UsageCommandArgs): Promise<void>;
