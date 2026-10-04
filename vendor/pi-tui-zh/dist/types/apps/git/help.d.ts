import type { NativeNode } from "../../native/node.js";
import type { Component } from "../../tui.js";
/** The shortcuts overlay; any of `?`, escape or `q` closes it. */
export declare class GitHelpSheet implements Component {
    #private;
    readonly nativeOverlay: {
        readonly role: "omp.overlay.hotkeys";
        readonly head: "Keyboard shortcuts";
        readonly size: "lg";
    };
    constructor(close: () => void);
    handleInput(data: string): void;
    describe(): NativeNode;
    render(width: number): readonly string[];
    invalidate(): void;
}
