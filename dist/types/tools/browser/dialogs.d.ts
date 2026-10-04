import type { Page } from "puppeteer-core";
/** Automatic JavaScript-dialog policy. */
export type DialogPolicy = "accept" | "dismiss";
/** JSON-safe description of the currently pending JavaScript dialog. */
export interface DialogState {
    /** Whether a confirm or prompt is waiting for a decision. */
    open: boolean;
    /** Browser dialog kind. */
    type?: string;
    /** Page-provided dialog message. */
    message?: string;
    /** Page-provided prompt default. */
    defaultValue?: string;
}
/** Runtime controller for automatic and explicitly handled JavaScript dialogs. */
export declare class RuntimeDialogController {
    #private;
    constructor(page: Page, logFailure: (message: string, details: Record<string, unknown>) => void);
    /** Install the page listeners exactly once. */
    observe(): void;
    /** Remove listeners and forget any dialog that can no longer be handled. */
    dispose(): void;
    /** Return the current runtime dialog policy. */
    get policy(): DialogPolicy | undefined;
    /** Return a JSON-safe snapshot of the pending dialog. */
    state(): DialogState;
    /** Change the automatic policy and settle an already-pending decision when enabled. */
    setPolicy(policy: DialogPolicy | null): Promise<void>;
    /** Explicitly accept or dismiss the pending confirm or prompt. */
    handle(options: {
        accept: boolean;
        text?: string;
    }): Promise<void>;
}
