/**
 * `/move` overlay: a path input with live directory autocomplete.
 *
 * Rendered as a centered modal via `showHookCustom(..., { overlay: true })`.
 * The user types a path, Tab autocompletes the highlighted directory, and Enter
 * confirms — yielding the resolved directory string (or `undefined` on cancel).
 */
import { type Component, type Focusable } from "../index.js";
import type { NativeNode, NativeUiEvent } from "../native/node.js";
export interface MoveOverlayResult {
    directory: string;
}
/** Directory suggestion displayed by the move dialog. */
export interface MoveDirectoryEntry {
    /** Full absolute path. */
    value: string;
    /** Display label (basename + trailing slash). */
    label: string;
}
/** Directory autocomplete supplied by the host. */
export interface MoveDirectorySource {
    search(prefix: string, cwd: string, max: number): MoveDirectoryEntry[];
}
/**
 * Overlay component for `/move`: a single-line path input with a live-filtered
 * list of matching directories. Tab accepts the highlighted suggestion; Enter
 * confirms the current input (or the highlighted suggestion if the input is
 * empty); Escape cancels.
 */
export declare class MoveOverlay implements Component, Focusable {
    #private;
    constructor(cwd: string, done: (result: MoveOverlayResult | undefined) => void, source: MoveDirectorySource);
    get focused(): boolean;
    set focused(value: boolean);
    setUseTerminalCursor(useTerminalCursor: boolean): void;
    pasteText(text: string): void;
    handleInput(data: string): void;
    render(width: number): readonly string[];
    describe(): NativeNode;
    handleNativeEvent(event: NativeUiEvent): void;
    invalidate(): void;
}
