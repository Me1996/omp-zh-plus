import { Container, type TUI } from "../index.js";
import type { Theme } from "../theme/theme.js";
import type { NativeNode } from "../native/node.js";
/** Loader wrapped with borders for hook UI */
export declare class BorderedLoader extends Container {
    #private;
    constructor(tui: TUI, theme: Theme, message: string);
    get signal(): AbortSignal;
    set onAbort(fn: (() => void) | undefined);
    invalidate(): void;
    describe(): NativeNode;
    handleInput(data: string): void;
    dispose(): void;
}
