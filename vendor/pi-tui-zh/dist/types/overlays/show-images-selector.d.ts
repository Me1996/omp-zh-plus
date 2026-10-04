import { SelectList, type SgrMouseEvent } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
/**
 * Component that renders a show images selector with borders
 */
export declare class ShowImagesSelectorComponent extends OverlayPanel {
    #private;
    constructor(currentValue: boolean, onSelect: (show: boolean) => void, onCancel: () => void);
    describe(cx: DescribeContext): NativeNode | null;
    /** Picker pointer events drive the list exactly as its keys do. */
    handleNativeEvent(event: NativeUiEvent): void;
    getSelectList(): SelectList;
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
}
