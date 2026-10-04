import { type Component, Container } from "../tui.js";
import { type NativeNode, type NativeUiEvent } from "../native/node.js";
/** One file's worth of late LSP diagnostics, as carried on the transcript message. */
export interface LateDiagnosticsFile {
    path?: string;
    summary?: string;
    errored?: boolean;
    messages?: string[];
}
/**
 * Native terminals append late diagnostics into the edit/write frame they
 * belong to: each file goes to the most recent tool component in `blocks`
 * that accepts it. Returns the files no frame took (all of them on the ANSI
 * path), for the standalone {@link LateDiagnosticsMessageComponent}.
 */
export declare function routeLateDiagnostics(blocks: readonly Component[], files: readonly LateDiagnosticsFile[]): LateDiagnosticsFile[];
/**
 * Renders late LSP diagnostics (arrived after edit/write returned) in the
 * transcript, reusing the same tree renderer the edit/write tools use so the
 * styling stays consistent. Supports the global tool-output expand toggle.
 */
export declare class LateDiagnosticsMessageComponent extends Container {
    #private;
    constructor(files: LateDiagnosticsFile[]);
    setExpanded(expanded: boolean): void;
    setToolActivityVisible(visible: boolean): void;
    render(width: number): readonly string[];
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * A severity-toned card (role `omp.diagnostics.late`) with one wrapped line
     * per diagnostic, clamped by the terminal while collapsed.
     */
    describe(): NativeNode;
    invalidate(): void;
}
