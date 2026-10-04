import type { OAuthAccountIdentity, StoredAuthCredential } from "../../session/auth-storage.js";
import type { LogoutAccount } from "@oh-my-pi/pi-tui-zh/overlays/logout-account-selector";
interface LogoutAccountOptions {
    activeIdentity?: OAuthAccountIdentity;
    activeApiKey?: boolean;
}
export declare function toLogoutAccounts(provider: string, credentials: StoredAuthCredential[], options?: LogoutAccountOptions): LogoutAccount[];
export {};
