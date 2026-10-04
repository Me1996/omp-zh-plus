import type { Component } from "../tui.js";
import type { NativeNode } from "../native/node.js";
/**
 * Dynamic border component that adjusts to viewport width.
 *
 * Note: the module-level `theme` may be `undefined` — when loaded through jiti
 * (separate module cache) or from a second `src` module graph in npm-package
 * installs, where the host bundle assigns `theme` but this copy never sees it
 * (issue #5366). Both the default color and `render()` degrade to plain,
 * unstyled output instead of crashing the TUI.
 */
export declare class DynamicBorder implements Component {
    #private;
    constructor(color?: (str: string) => string);
    invalidate(): void;
    /** Native terminals draw their own chrome; a border rule describes nothing. */
    describe(): NativeNode;
    render(width: number): readonly string[];
}
