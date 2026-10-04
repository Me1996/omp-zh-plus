import { type Component, type Focusable, Input } from "../index.js";
import { type BtwHistoryRecord } from "./btw-history.js";
import type { SpaceHoldHandler } from "../space-hold.js";
import type { NativeNode, NativeUiEvent } from "../native/node.js";
interface BtwHistoryPanelOptions {
    records: readonly BtwHistoryRecord[];
    onClose: () => void;
    onCopy: (record: BtwHistoryRecord) => void;
    onCancel: (record: BtwHistoryRecord) => void;
    canFollowUp?: (record: BtwHistoryRecord) => boolean;
    onFollowUp?: (record: BtwHistoryRecord, question: string, signal: AbortSignal) => Promise<boolean>;
    /** Space-bar push-to-talk for a follow-up composer: dictates into `input` while Space is held. */
    spaceHold?: (input: Input) => SpaceHoldHandler;
    requestRender: () => void;
    getHeight: () => number;
}
/** Session-local side questions. Selecting or copying never promotes them into chat. */
export declare class BtwHistoryPanel implements Component, Focusable {
    #private;
    constructor(options: BtwHistoryPanelOptions);
    get focused(): boolean;
    set focused(value: boolean);
    update(records: readonly BtwHistoryRecord[]): void;
    /** Visual confirmation that `c` copied this record's answer to the clipboard. */
    markCopied(recordId: string, text: string): void;
    invalidate(): void;
    openFollowUp(recordId: string): boolean;
    /** Enhanced clipboard pastes belong only to the active composer. */
    pasteText(text: string): void;
    handleInput(data: string): void;
    /** A large glass sheet titled "BTW history". */
    readonly nativeOverlay: {
        readonly role: "omp.overlay.btwHistory";
        readonly size: "lg";
        readonly head: "BTW history";
    };
    describe(): NativeNode;
    handleNativeEvent(event: NativeUiEvent): void;
    render(width: number): readonly string[];
}
export {};
