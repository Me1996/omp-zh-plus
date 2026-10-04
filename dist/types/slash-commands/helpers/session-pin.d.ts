import type { OAuthAccountSummary } from "../../session/auth-storage.js";
import type { SessionPinAccount } from "@oh-my-pi/pi-tui-zh/overlays/session-account-selector";
/** Add stable user-facing labels to provider account summaries. */
export declare function toSessionPinAccounts(accounts: readonly OAuthAccountSummary[]): SessionPinAccount[];
/** Match a `/session pin` selector by 1-based position or exact account identity. */
export declare function matchSessionPinAccounts(accounts: readonly SessionPinAccount[], selector: string): SessionPinAccount[];
