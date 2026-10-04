import { type Api, type Model } from "@oh-my-pi/pi-ai";
import { ModelRegistry } from "../config/model-registry.js";
export type AuthGatewayAction = "serve" | "stdio" | "token" | "status" | "check";
export interface AuthGatewayCommandArgs {
    action: AuthGatewayAction;
    flags: {
        json?: boolean;
        bind?: string;
        regenerate?: boolean;
        trustProxyHeaders?: boolean;
        /**
         * Disable bearer-token auth on inbound requests. Useful when the gateway
         * is bound to loopback (the default `127.0.0.1:4000`) and you don't want
         * to wire token-paste plumbing into every local client.
         */
        noAuth?: boolean;
        /**
         * Strict mode for `check` — additionally exercise every credential
         * against its provider's chat-completion endpoint. The usage probe (run
         * unconditionally) can pass while the chat endpoint still 401s the same
         * bearer, so strict mode is the definitive "is this credential
         * actually usable" signal. Slower and consumes a tiny amount of quota.
         */
        strict?: boolean;
    };
}
declare const ACTIONS: readonly AuthGatewayAction[];
/** Every registry model of a kind the gateway can route, bundled catalog order within each kind. */
export declare function gatewayRoutableModels(registry: ModelRegistry): Model<Api>[];
/**
 * Index resolvable models by the request ids clients may send: the
 * provider-qualified `provider/id` (always) and the bare `id` (first-write-wins
 * fallback for legacy clients). Scoped to providers the gateway holds broker
 * credentials for, since only those are routable.
 */
export declare function indexModelsByRequestId(models: readonly Model<Api>[], providersWithCreds: ReadonlySet<string>): Map<string, Model<Api>>;
/**
 * Serialize catalog rebuilds so `registry.refresh()` passes never overlap,
 * while guaranteeing a forced rebuild requested mid-flight runs a forced pass
 * afterward. Without the follow-up pass a credential change arriving during a
 * weaker cached rebuild would piggyback on it and miss an account-scoped
 * catalog change. Non-forced requests during an in-flight rebuild simply
 * coalesce onto it. Returns `rebuild(force?)`; its promise resolves once the
 * catalog reflects that call's requirement.
 */
export declare function createSerializedRebuilder(run: (force: boolean) => Promise<void>): (force?: boolean) => Promise<void>;
export declare function runAuthGatewayCommand(cmd: AuthGatewayCommandArgs): Promise<void>;
export { ACTIONS as AUTH_GATEWAY_ACTIONS };
