import { type KeybindingsManager } from "./app-keybindings.js";
import type { NativeNode, NativeUiEvent } from "./native/node.js";
import type { Component } from "./tui.js";
/** Effective keybinding operations used to render the hotkey reference. */
export interface HotkeysMarkdownBindings {
    keybindings: Pick<KeybindingsManager, "getDisplayString" | "getKeys" | "matchesCanonical">;
}
/** Build the platform-aware Markdown reference for effective application hotkeys. */
export declare function buildHotkeysMarkdown(bindings: HotkeysMarkdownBindings): string;
/**
 * `/hotkeys` under a native terminal: a large sheet "Keyboard shortcuts" with
 * one section per group, each a two-column table whose key cells carry `key`
 * spans (Tern draws them as keycaps). Esc (or Close) dismisses it. Terminals
 * without the native surface get the transcript markdown panel instead.
 */
export declare class HotkeysSheetComponent implements Component {
    #private;
    readonly nativeOverlay: {
        readonly role: "omp.overlay.hotkeys";
        readonly size: "lg";
        readonly head: "Keyboard shortcuts";
    };
    constructor(bindings: HotkeysMarkdownBindings, onClose: () => void);
    describe(): NativeNode;
    /** The markdown reference, for a terminal that falls back to rows. */
    render(width: number): readonly string[];
    invalidate(): void;
    handleInput(data: string): void;
    /** Close runs what Esc runs. */
    handleNativeEvent(event: NativeUiEvent): void;
}
