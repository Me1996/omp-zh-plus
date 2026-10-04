import { type SgrMouseEvent } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
/** Stored account identity rendered and matched by the session account picker. */
export interface SessionPinAccount {
    position: number;
    credentialId: number;
    accountId?: string;
    email?: string;
    projectId?: string;
    enterpriseUrl?: string;
    orgId?: string;
    orgName?: string;
    active: boolean;
    label: string;
}
/** Account picker opened by `/session pin` for the current model provider. */
export declare class SessionAccountSelectorComponent extends OverlayPanel {
    #private;
    constructor(providerName: string, accounts: readonly SessionPinAccount[], onSelect: (account: SessionPinAccount) => void, onCancel: () => void);
    /** Forward keyboard navigation and cancellation when the wrapper owns focus. */
    handleInput(keyData: string): void;
    /** Route mouse selection through the title rows into the account list. */
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
}
