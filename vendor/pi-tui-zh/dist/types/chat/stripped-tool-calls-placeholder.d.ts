import { Text } from "../components/text.js";
import type { NativeNode } from "../native/node.js";
/**
 * Dim transcript marker for tool calls stripped from the resolved branch
 * (failed/retried turns, results on sibling branches). It is tool activity,
 * so it hides and reappears with the `display.hideToolActivity` toggle.
 */
export declare class StrippedToolCallsPlaceholder extends Text {
    #private;
    constructor(strippedToolCalls: number, toolActivityVisible: boolean);
    setToolActivityVisible(visible: boolean): void;
    /** A dim italic note, mounted but hidden while tool activity is hidden. */
    describe(): NativeNode;
    render(width: number): readonly string[];
}
