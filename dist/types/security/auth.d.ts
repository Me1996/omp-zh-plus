import type { AgentOptions } from "@oh-my-pi/pi-agent-core";
import type { OAuthAccessResolution } from "@oh-my-pi/pi-ai";
import type { AuthStorage } from "../session/auth-storage.js";
import type { SecurityAccountRef, SecurityAuthRef } from "./contracts/index.js";
/** Inputs required to resolve one immutable OAuth account reference. */
export interface ExactSecurityOAuthOptions {
    authStorage: AuthStorage;
    account: SecurityAccountRef;
}
/** Model identity fields used to select a supported scan authentication route. */
export interface SecurityAuthModel {
    provider: string;
    api: string;
}
/** Inputs required to enforce a scan authentication reference at request time. */
export interface SecurityAuthResolverOptions {
    authStorage: AuthStorage;
    auth: SecurityAuthRef;
    providerResolver: NonNullable<AgentOptions["getApiKey"]>;
}
/** Rejects changes to any durable OAuth identity field captured by preflight. */
export declare function assertSecurityIdentityMatches(account: SecurityAccountRef, resolution: {
    credentialId?: number;
    accountId?: string;
    email?: string;
    orgId?: string;
    orgName?: string;
}): void;
/** Selects one exact OAuth row for native or Codex Security cloud scans. */
export declare function selectSecurityOAuthAccount(authStorage: AuthStorage, provider: string, requestedCredentialId?: number, sessionId?: string): SecurityAccountRef;
/** Selects either one exact OAuth row or an explicitly supported provider-owned auth route. */
export declare function selectSecurityAuth(authStorage: AuthStorage, model: SecurityAuthModel, requestedCredentialId?: number, sessionId?: string): SecurityAuthRef;
/** Resolves one pinned OAuth row and verifies that its durable identity has not changed. */
export declare function resolveExactSecurityOAuthAccess(authStorage: AuthStorage, account: SecurityAccountRef, options: {
    forceRefresh: boolean;
    signal?: AbortSignal;
}): Promise<Extract<OAuthAccessResolution, {
    ok: true;
}>>;
/**
 * Build a request credential resolver pinned to one durable OAuth row.
 *
 * Initial resolution and refresh both target the same row. The auth driver's
 * final sibling-rotation step returns `undefined`, so an unavailable account
 * fails the scan rather than crossing an account/workspace boundary.
 */
export declare function createExactSecurityOAuthResolver(options: ExactSecurityOAuthOptions): NonNullable<AgentOptions["getApiKey"]>;
/**
 * Builds the scan resolver while preserving either its exact OAuth row or provider-owned auth boundary.
 */
export declare function createSecurityAuthResolver(options: SecurityAuthResolverOptions): NonNullable<AgentOptions["getApiKey"]>;
