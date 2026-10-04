import type { NativeNode } from "../native/node.js";
import { Container } from "../tui.js";
/**
 * A transient status notice (`showStatus`: "Thinking blocks: hidden", "Copied
 * to clipboard"). The ANSI render appends a blank row and the dim line to the
 * transcript; a native terminal shows it as a toast instead, so notices never
 * pile up in the history. Updating the text re-shows the toast.
 */
export declare class StatusNotice extends Container {
    #private;
    constructor(message: string, styleFn?: (text: string) => string);
    setMessage(message: string, styleFn?: (text: string) => string): void;
    describe(): NativeNode;
}
