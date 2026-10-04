import { OverlayPanel } from "../chrome/overlay-box.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
export interface LogoutAccount {
    credentialId: number;
    provider: string;
    label: string;
    detail: string;
    type: "api_key" | "oauth";
    active: boolean;
}
/** Account picker for `/logout` after the provider has been selected. */
export declare class LogoutAccountSelectorComponent extends OverlayPanel {
    #private;
    constructor(providerName: string, accounts: LogoutAccount[], onSelect: (account: LogoutAccount) => void, onCancel: () => void);
    handleInput(keyData: string): void;
    describe(cx: DescribeContext): NativeNode;
    /** A click (or double-click) on an account highlights it and logs it out, like Enter. */
    handleNativeEvent(event: NativeUiEvent): void;
}
