import type { AuthStorage, UsageReport } from "@oh-my-pi/pi-ai";
/** Identity slice of a stored credential, for "every account" coverage. */
export interface UsageAccountIdentity {
    provider: string;
    type: "api_key" | "oauth";
    email?: string;
    accountId?: string;
    projectId?: string;
    enterpriseUrl?: string;
    /** Organization/workspace the credential is scoped to (Anthropic multi-subscription). */
    orgId?: string;
    orgName?: string;
    /** Epoch ms of the interactive login that minted the OAuth grant (see `OAuthCredentials.authorizedAt`). */
    authorizedAt?: number;
}
/** Flatten every stored credential (OAuth and API key) into identity rows for unreported-account detection. */
export declare function collectStoredAccounts(authStorage: AuthStorage): UsageAccountIdentity[];
/**
 * Keep only accounts worth a usage row: those whose provider has a usage
 * provider, so a missing report is a real gap rather than the absence of any
 * usage concept. Providers with no usage endpoint (web-search keys, local /
 * keyless servers, inference providers without a usage API) would only ever
 * render as noise, so they are dropped.
 *
 * `hasUsageProvider` is injected (in practice {@link AuthStorage.usage.providerFor})
 * so custom/broker resolvers stay authoritative — no provider list is duplicated
 * here. An explicit `--provider` request bypasses the cull, so
 * `omp usage --provider xai` can still confirm the stored credential has no
 * usage endpoint.
 */
export declare function selectReportableAccounts(accounts: UsageAccountIdentity[], hasUsageProvider: (provider: string) => boolean, explicitProvider?: string): UsageAccountIdentity[];
/**
 * Stored credentials that no usage report could be attributed to.
 *
 * Conservative on purpose: when a provider's reports carry no identity at
 * all (or the credential is an API key alongside existing reports), we
 * can't attribute, so we don't claim the account is missing.
 */
export declare function collectUnreportedAccounts(reports: UsageReport[], accounts: UsageAccountIdentity[]): UsageAccountIdentity[];
/** Compose the account label from parts, masking each part individually so `--redact` cannot be bypassed by the composite string. */
export declare function accountIdentityLabel(account: UsageAccountIdentity, redaction?: Map<string, string>): string;
