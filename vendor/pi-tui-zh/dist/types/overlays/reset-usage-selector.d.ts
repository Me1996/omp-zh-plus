import type { UsageResetCreditDetail } from "@oh-my-pi/pi-ai";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { NativeNode, NativeUiEvent } from "../native/node.js";
/** One account row with its redeemable rate-limit reset credits. */
export interface ResetUsageAccount {
    label: string;
    provider: string;
    providerLabel: string;
    /** Banked resets, including grants that cannot be spent right now. */
    availableCount: number;
    /** Resets the provider currently permits this account to spend. */
    redeemableCount: number;
    target: {
        credentialId: number;
        provider: string;
        creditId?: string;
        accountId?: string;
        email?: string;
        orgId?: string;
    };
    active: boolean;
    error?: string;
    unavailableReason?: string;
    expiresAt?: string;
    credit?: UsageResetCreditDetail;
}
/**
 * Account picker for `/usage reset`. Lists provider accounts with their saved
 * rate-limit reset counts; selecting one redeems a reset. Because a reset is a
 * scarce, irreversible credit, Enter requires a second press to confirm.
 */
export declare class ResetUsageSelectorComponent extends OverlayPanel {
    #private;
    constructor(accounts: ResetUsageAccount[], onSelect: (account: ResetUsageAccount) => void, onCancel: () => void);
    handleInput(keyData: string): void;
    describe(): NativeNode;
    /**
     * A click (or double-click) on an account highlights it and presses Enter:
     * moving to another account drops a pending confirmation, so spending a
     * reset still takes a second activation of the same account.
     */
    handleNativeEvent(event: NativeUiEvent): void;
}
