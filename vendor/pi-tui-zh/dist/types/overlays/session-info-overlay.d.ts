import { type Component } from "../index.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import type { ContextUsage } from "../status-line/types.js";
/** Terminal surface needed to size the session info viewport. */
export interface SessionInfoOverlayHost {
    readonly terminal: {
        readonly rows: number;
    };
}
/** Focused, dismissible `/session` information panel. */
export declare class SessionInfoOverlay implements Component {
    #private;
    /** The terminal draws the sheet: a centred `md` glass sheet titled Session info. */
    readonly nativeOverlay: {
        readonly role: "omp.overlay.sessionInfo";
        readonly size: "md";
        readonly anchor: "center";
        readonly head: "Session info";
    };
    /** `context` adds a context-window meter to the native sheet. */
    constructor(host: SessionInfoOverlayHost, info: string, onClose: () => void, context?: ContextUsage);
    handleInput(data: string): void;
    invalidate(): void;
    setIgnoreTight(ignore: boolean): this;
    dispose(): void;
    /**
     * The sheet body (the overlay is the frame): the session id in mono
     * (click copies), each report heading as a section of key/value rows, a
     * context meter after the leading block, and a Close button (Esc).
     */
    describe(cx: DescribeContext): NativeNode;
    /** The Close button runs Esc's path. */
    handleNativeEvent(event: NativeUiEvent): void;
    render(width: number): readonly string[];
}
