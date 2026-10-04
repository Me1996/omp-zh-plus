import type { AuthStorage, OAuthAccess } from "@oh-my-pi/pi-ai";
export declare const PERPLEXITY_CHAT_BASE_URL = "https://api.perplexity.ai";
export declare const PERPLEXITY_RESPONSES_BASE_URL = "https://api.perplexity.ai/v1";
export declare const OAUTH_EXPIRY_BUFFER_MS: number;
export interface ApiConfig {
    type: "api_key";
    apiKey: string;
    useResponses: boolean;
}
export type PerplexityAuth = ApiConfig | {
    type: "oauth";
    access: OAuthAccess;
} | {
    type: "cookies";
    cookies: string;
} | {
    type: "anonymous";
};
export interface PerplexityAuthOptions {
    signal?: AbortSignal;
    forceRefresh?: boolean;
}
/**
 * Decode a Perplexity JWT's `exp` claim, in ms. Returns `undefined` when the
 * token has no `exp` (which is the common case — Perplexity sessions are
 * server-side and effectively non-expiring from the client's POV).
 */
export declare function jwtExpiryMs(token: string): number | undefined;
/** Collect all available auth methods to try in priority order */
export declare function getAvailableAuthMethods(authStorage: AuthStorage, sessionId: string | undefined, options?: PerplexityAuthOptions): Promise<PerplexityAuth[]>;
