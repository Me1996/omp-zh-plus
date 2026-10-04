import { type StoredOAuthRefreshResult } from "@oh-my-pi/pi-ai";
import type { OAuthCredentials } from "@oh-my-pi/pi-ai/oauth/types";
import type { AuthStorage } from "../session/auth-storage.js";
import { type MCPStoredOAuthCredential } from "./oauth-flow.js";
import type { MCPAuthConfig, MCPServerConfig } from "./types.js";
export interface MCPOAuthCredentialLookup {
    credentialId: string;
    credential: MCPStoredOAuthCredential;
}
export type MCPOAuthRefreshMaterial = MCPStoredOAuthCredential | MCPAuthConfig | undefined;
export declare function mcpOAuthCredentialIdsForServerUrl(serverUrl: string | undefined): string[];
export declare function hasMcpAuthorizationHeader(config: MCPServerConfig): boolean;
export declare function lookupMcpOAuthCredentialForServer(authStorage: AuthStorage | null | undefined, auth: MCPAuthConfig | undefined, serverUrl: string | undefined, options?: {
    allowUrlKeyedFallback?: boolean;
}): MCPOAuthCredentialLookup | undefined;
export declare function lookupMcpOAuthCredential(authStorage: AuthStorage | null | undefined, config: MCPServerConfig): MCPOAuthCredentialLookup | undefined;
export declare function selectMcpOAuthRefreshMaterial(credential: MCPStoredOAuthCredential, auth: MCPAuthConfig | undefined): MCPOAuthRefreshMaterial;
/**
 * Refresh a stored MCP OAuth credential via the standard `refresh_token` grant.
 *
 * Refresh material is taken from the credential itself (self-contained modern
 * credentials embed `tokenUrl`/`clientId`/`clientSecret`/`resource`) or, for
 * legacy credentials that carry none, the server's `auth` block. Shared by the
 * local MCP manager and the `omp auth-broker serve` refresh path so a broker
 * with no access to the MCP config can still refresh `mcp_oauth:*` credentials
 * from the vault.
 *
 * `serverUrl` supplies the RFC 8707 fallback resource indicator when neither
 * the credential nor the auth block advertised one; the manager passes the
 * configured server URL, the broker recovers it from the credential id via
 * {@link mcpOAuthServerUrlFromCredentialId}.
 *
 * @throws when no usable refresh token or token endpoint is available.
 */
export declare function refreshManagedMcpOAuthCredential(credential: MCPStoredOAuthCredential, opts?: {
    serverUrl?: string;
    auth?: MCPAuthConfig;
    signal?: AbortSignal;
}): Promise<OAuthCredentials>;
/**
 * Resolve and refresh one stored MCP OAuth row through the durable credential owner.
 *
 * Local rows use their embedded OAuth metadata; broker-redacted rows delegate the
 * grant to the broker. The MCP manager and standalone credential consumers share
 * this path so rotating refresh tokens are persisted before callers receive them.
 *
 * `serverUrl` supplies the RFC 8707 fallback resource indicator; the manager passes
 * the configured server URL for http/sse servers and `undefined` for stdio servers,
 * whose refresh must NOT advertise a resource. Standalone consumers that hold only
 * the credential id (`omp token`) set `recoverServerUrlFromCredentialId` to derive
 * the same fallback resource the http/sse client would use.
 */
export declare function refreshStoredManagedMcpOAuthCredential(authStorage: AuthStorage, provider: string, opts?: {
    credentialId?: number;
    serverUrl?: string;
    recoverServerUrlFromCredentialId?: boolean;
    auth?: MCPAuthConfig;
    forceRefresh?: boolean;
    keepCredentialOnRefreshFailure?: boolean;
    onRefreshFailure?: (error: unknown) => void;
}): Promise<StoredOAuthRefreshResult<MCPStoredOAuthCredential>>;
export declare function removeManagedMcpOAuthCredential(authStorage: AuthStorage, credentialId: string | undefined): Promise<boolean>;
export declare function removeManagedMcpOAuthCredentials(authStorage: AuthStorage, credentialIds: readonly (string | undefined)[]): Promise<boolean>;
