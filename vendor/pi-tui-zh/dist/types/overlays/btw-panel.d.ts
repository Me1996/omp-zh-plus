import { type TUI } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { NativeNode } from "../native/node.js";
interface BtwPanelComponentOptions {
    question: string;
    tui: TUI;
    canBranch?: () => boolean;
    canFollowUp?: () => boolean;
}
export declare class BtwPanelComponent extends OverlayPanel {
    #private;
    constructor(options: BtwPanelComponentOptions);
    appendText(delta: string): void;
    setAnswer(text: string): void;
    markComplete(): void;
    /** Visual confirmation that `c` copied the answer to the clipboard. */
    markCopied(): void;
    /** Shows that the completed answer is being promoted into the chat session. */
    markBranching(): void;
    markAborted(): void;
    markError(message: string): void;
    isBranchable(): boolean;
    isCopyable(): boolean;
    getCopyText(): string | undefined;
    close(): void;
    invalidate(): void;
    describe(): NativeNode;
}
export {};
