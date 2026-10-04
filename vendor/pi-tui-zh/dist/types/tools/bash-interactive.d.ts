import type * as XtermModule from "@oh-my-pi/pi-utils/vterm";
import type { Component } from "../tui.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import type { Theme } from "../theme/theme.js";
/** Resize-only backend exposed by an interactive PTY controller. */
export interface BashInteractiveTerminalBackend {
    resize(columns: number, rows: number): void;
}
/** Interactive terminal overlay driven by an external PTY controller. */
export declare class BashInteractiveOverlayComponent implements Component {
    #private;
    /** Native sheet: a full-pane glass overlay titled Console. */
    readonly nativeOverlay: {
        readonly role: "omp.overlay.console";
        readonly size: "full";
        readonly head: "Console";
    };
    constructor(command: string, uiTheme: Theme, getTerminalRows: () => number, terminalCtor: typeof XtermModule.Terminal, backend: BashInteractiveTerminalBackend);
    /** Connects normalized keyboard input and overlay lifecycle events to the controller. */
    setHandlers(onInput: (data: string) => void, onDismiss: () => void, onDispose: () => void): void;
    /** Queues a raw terminal output chunk for virtual-terminal rendering. */
    appendOutput(chunk: string): void;
    /** Resolves when the virtual terminal has processed all queued output. */
    flushOutput(): Promise<void>;
    /** Records process completion and stops forwarding keyboard input. */
    setComplete(result: {
        exitCode: number | undefined;
        cancelled: boolean;
        timedOut: boolean;
    }): void;
    handleInput(data: string): void;
    /** The Force kill button runs the Esc path. */
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * Native view: the command with its state badge, the PTY screen as an
     * `ansi` node (SGR kept, fixed to the PTY grid), and a footer with the
     * Force kill action while running.
     */
    describe(cx: DescribeContext): NativeNode;
    render(width: number): readonly string[];
    invalidate(): void;
    dispose(): void;
}
