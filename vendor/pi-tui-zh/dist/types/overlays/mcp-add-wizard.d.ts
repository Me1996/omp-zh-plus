import { OverlayPanel } from "../chrome/overlay-box.js";
import { type DescribeContext, type NativeNode, type NativeUiEvent } from "../native/node.js";
type Scope = "user" | "project";
/** Authentication fields produced by the wizard. */
interface MCPAddWizardAuth {
    type: "oauth";
    credentialId: string;
    tokenUrl?: string;
    clientId?: string;
    clientSecret?: string;
    resource?: string;
}
interface MCPAddWizardConfigBase {
    timeout?: number;
    auth?: MCPAddWizardAuth;
}
interface MCPAddWizardStdioConfig extends MCPAddWizardConfigBase {
    type: "stdio";
    command: string;
    args?: string[];
    env?: Record<string, string>;
}
interface MCPAddWizardRemoteConfig extends MCPAddWizardConfigBase {
    type: "http" | "sse";
    url: string;
    headers?: Record<string, string>;
}
/** Server configuration fields produced for testing and persistence. */
export type MCPAddWizardConfig = MCPAddWizardStdioConfig | MCPAddWizardRemoteConfig;
interface MCPAddWizardOAuthEndpoints {
    authorizationUrl: string;
    tokenUrl: string;
    issuerUrl?: string;
    clientId?: string;
    registrationUrl?: string;
    scopes?: string;
    resource?: string;
}
interface MCPAddWizardAuthDetection {
    requiresAuth: boolean;
    authType?: "oauth" | "apikey" | "unknown";
    oauth?: MCPAddWizardOAuthEndpoints;
    authServerUrl?: string;
    resourceMetadataUrl?: string;
    scopes?: string;
}
/** Host-owned validation and OAuth discovery capabilities. */
export interface MCPAddWizardDeps {
    validateServerName(name: string): string | undefined;
    analyzeAuthError(error: Error, serverUrl?: string): MCPAddWizardAuthDetection;
    discoverOAuthEndpoints(serverUrl: string, authServerUrl?: string, resourceMetadataUrl?: string, options?: {
        protectedScopes?: string;
    }): Promise<MCPAddWizardOAuthEndpoints | null>;
    fetchResourceMetadataScopes(resourceMetadataUrl: string): Promise<string | undefined>;
}
/**
 * Result of the wizard's OAuth callback. `credentialId` is mandatory;
 * `clientId` is populated when the OAuth provider performed dynamic client
 * registration (or when the caller pre-supplied it) so the wizard can fold it
 * into the final `mcp.json` entry. Refresh material (including any DCR client
 * secret) is embedded in the stored credential, never written to config files.
 */
export interface MCPAddWizardOAuthResult {
    credentialId: string;
    clientId?: string;
    resource?: string;
}
interface MCPAddWizardOAuthOptions {
    serverUrl?: string;
    resource?: string;
    stripSameOriginResource?: boolean;
    registrationUrl?: string;
    issuerUrl?: string;
    /**
     * External cancellation source. Aborting it tears down the in-flight OAuth
     * flow and surfaces a neutral cancellation error. The wizard wires its own
     * controller here so Esc cancels the OAuth wait instead of stepping back
     * through the form (the wizard is focused, so the editor's Esc hook does
     * not fire).
     */
    abortSignal?: AbortSignal;
}
export declare class MCPAddWizard extends OverlayPanel {
    #private;
    constructor(deps: MCPAddWizardDeps, onComplete: (name: string, config: MCPAddWizardConfig, scope: Scope) => void, onCancel: () => void, onOAuth?: (authUrl: string, tokenUrl: string, clientId: string, clientSecret: string, scopes: string, options?: MCPAddWizardOAuthOptions) => Promise<MCPAddWizardOAuthResult>, onTestConnection?: (config: MCPAddWizardConfig) => Promise<void>, onRender?: () => void, initialName?: string);
    describe(_cx: DescribeContext): NativeNode;
    /** A click on a choice is Enter on it, exactly as highlighting it with the arrows and pressing Enter. */
    handleNativeEvent(event: NativeUiEvent): void;
    handleInput(keyData: string): void;
}
export {};
