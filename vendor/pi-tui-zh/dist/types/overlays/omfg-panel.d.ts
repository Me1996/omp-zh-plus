import { type TUI } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { NativeNode } from "../native/node.js";
export type OmfgPanelState = "generating" | "validating" | "confirming" | "saving" | "saved" | "rejected" | "aborted" | "error";
interface OmfgPanelComponentOptions {
    complaint: string;
    tui: TUI;
}
export declare class OmfgPanelComponent extends OverlayPanel {
    #private;
    constructor(options: OmfgPanelComponentOptions);
    appendDraft(delta: string): void;
    setRule(text: string): void;
    setStatus(state: OmfgPanelState, status: string): void;
    markSaved(path: string): void;
    markRejected(): void;
    markAborted(): void;
    markError(message: string): void;
    close(): void;
    invalidate(): void;
    describe(): NativeNode;
}
export {};
