/**
 * Terminal (readline) OAuth login primitives shared by `omp login` and
 * `omp auth-broker login`: a cancellable line prompt, a numbered provider
 * picker, and the stdout-driven OAuth flow itself.
 *
 * Callers own ONE `readline.Interface` for the whole command and pass it to
 * every step: readline buffers whole input chunks, so a second interface on
 * piped stdin never sees lines the first one already consumed.
 */
import * as readline from "node:readline";
import { type AuthStorage, type OAuthLoginIdentity, type OAuthProviderId, type OAuthProviderInfo } from "@oh-my-pi/pi-ai";
/**
 * Interactive `readline` prompt that cleanly tears down on Ctrl-C / Escape so
 * cancelling a half-finished login flow doesn't leave the terminal in raw mode.
 *
 * Rejects with "Login cancelled" on Ctrl-C / Escape or when stdin closes
 * before an answer, or with the signal's reason when `signal` aborts.
 */
export declare function promptLine(rl: readline.Interface, question: string, signal?: AbortSignal): Promise<string>;
/**
 * Numbered stdin picker over `labels`; resolves with the chosen index.
 *
 * @throws when the answer is not a listed number, or the prompt is cancelled.
 */
export declare function pickIndex(rl: readline.Interface, title: string, labels: readonly string[]): Promise<number>;
/**
 * Numbered picker over OAuth providers; resolves with the chosen provider id.
 *
 * @throws when `providers` is empty or the selection is invalid/cancelled.
 */
export declare function pickOAuthProvider(rl: readline.Interface, providers: readonly OAuthProviderInfo[]): Promise<string>;
/**
 * Run `provider`'s OAuth flow against `storage`, printing the auth URL and
 * progress to stdout and reading prompts from stdin. Resolves with the stored
 * identity (`undefined` when the flow stored nothing).
 *
 * `openBrowser` additionally opens the auth URL in the local default browser
 * (best-effort) — off for broker-host logins, which usually run headless.
 *
 * @throws when the provider flow fails or the user cancels a prompt.
 */
export declare function runTerminalOAuthLogin(rl: readline.Interface, storage: AuthStorage, provider: OAuthProviderId, options?: {
    openBrowser?: boolean;
}): Promise<OAuthLoginIdentity | undefined>;
/**
 * Human label for the account a login stored — `email (org)`, `email`, or
 * `org` — so a login landing on an unintended account/subscription is visible.
 * `undefined` for API-key logins and identity-less credentials.
 */
export declare function formatLoginIdentity(identity: OAuthLoginIdentity | undefined): string | undefined;
