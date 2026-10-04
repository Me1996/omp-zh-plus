/**
 * Simple text input component for hooks.
 */
import { type TUI } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { DescribeContext, NativeNode } from "../native/node.js";
export interface HookInputOptions {
    tui?: TUI;
    timeout?: number;
    onTimeout?: () => void;
}
export declare class HookInputComponent extends OverlayPanel {
    #private;
    constructor(title: string, _placeholder: string | undefined, onSubmit: (value: string) => void, onCancel: () => void, opts?: HookInputOptions);
    handleInput(keyData: string): void;
    /** Route non-bracketed paste transports (e.g. kitty's OSC 5522 enhanced clipboard)
     *  into the inner field, mirroring bracketed-paste semantics. Pasting counts as
     *  interaction, so the timeout countdown resets like any keystroke. */
    pasteText(text: string): void;
    dispose(): void;
    /** A card over the form, headed by the title plus the countdown `elapsed` while a timeout runs. */
    describe(_cx: DescribeContext): NativeNode;
}
