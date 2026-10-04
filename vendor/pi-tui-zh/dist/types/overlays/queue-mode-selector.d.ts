import { SelectList, type SgrMouseEvent } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
/**
 * Component that renders a queue mode selector with borders
 */
export declare class QueueModeSelectorComponent extends OverlayPanel {
    #private;
    constructor(currentMode: "all" | "one-at-a-time", onSelect: (mode: "all" | "one-at-a-time") => void, onCancel: () => void);
    describe(cx: DescribeContext): NativeNode | null;
    /** Picker pointer events drive the list exactly as its keys do. */
    handleNativeEvent(event: NativeUiEvent): void;
    getSelectList(): SelectList;
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
}
