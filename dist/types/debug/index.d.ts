import { OverlayPanel } from "@oh-my-pi/pi-tui-zh/chrome/overlay-box";
import type { InteractiveModeContext } from "../modes/types.js";
/**
 * Debug selector component.
 */
export declare class DebugSelectorComponent extends OverlayPanel {
    #private;
    private ctx;
    constructor(ctx: InteractiveModeContext, onDone: () => void);
    handleInput(keyData: string): void;
}
/**
 * Show the debug selector.
 */
export declare function showDebugSelector(ctx: InteractiveModeContext, done: () => void): DebugSelectorComponent;
