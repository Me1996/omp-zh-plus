import type { Component } from "../../tui.js";
import type { NativeNode, NativeScreen, NativeUiEvent } from "../../native/node.js";
import { type RawSseDebugBuffer } from "./raw-sse-buffer.js";
/** @internal Exported for tests. */
export declare function expandPrettyDataLines(raw: readonly string[]): string[];
/** Host clipboard capability for the raw event viewer. */
export interface RawSseViewerDeps {
    copyToClipboard(text: string): void;
}
/** Raw event viewer content, callbacks, and host capabilities. */
export interface RawSseViewerOptions {
    deps: RawSseViewerDeps;
    buffer: RawSseDebugBuffer;
    terminalRows: number;
    onExit: () => void;
    onStatus?: (message: string) => void;
    onUpdate?: () => void;
}
/** Scrollable live view of captured provider events. */
export declare class RawSseViewerComponent implements Component {
    #private;
    constructor(options: RawSseViewerOptions);
    dispose(): void;
    handleInput(keyData: string): void;
    invalidate(): void;
    render(width: number): readonly string[];
    /** The action bar's buttons run the same code as their keys. */
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * The stream as a page of its own: the capture counters over the wire
     * text, one `ansi` block that fills the page, scrolls itself and follows
     * its tail until the user scrolls away (Tern-local, so no follow state
     * here; the scroll keys reach it as `scroll` requests). The copy status
     * and the buttons are this component's own node, docked under the page
     * so they never scroll away.
     */
    describeScreen(): NativeScreen;
    /** The docked bar under the stream page: the copy status and the buttons. */
    describe(): NativeNode;
}
