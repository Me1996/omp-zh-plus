import { SelectList, type SgrMouseEvent } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import { type SelectPickerOptions } from "../native/picker.js";
/**
 * Picker options for a theme list (this selector and the settings theme
 * submenu): a swatch `mark` seeded by the theme id, the current theme dotted,
 * `Apply ⏎`. Moving the selection previews through the list's `onSelectionChange`.
 */
export declare function themePickerOptions(title: string, current: string): SelectPickerOptions;
/**
 * Component that renders a theme selector.
 * Themes must be pre-loaded and passed to the constructor.
 */
export declare class ThemeSelectorComponent extends OverlayPanel {
    #private;
    constructor(currentTheme: string, themes: string[], onSelect: (themeName: string) => void, onCancel: () => void, onPreview: (themeName: string) => void);
    describe(cx: DescribeContext): NativeNode | null;
    /** Picker pointer events drive the list exactly as its keys do. */
    handleNativeEvent(event: NativeUiEvent): void;
    getSelectList(): SelectList;
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
}
