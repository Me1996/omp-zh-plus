/**
 * Component for displaying bash command execution with streaming output.
 */
import type { ImageContent } from "@oh-my-pi/pi-ai";
import { Container, type TUI } from "../tui.js";
import type { OutputArtifactError } from "../tools/streaming-output.js";
import type { TruncationMeta } from "../tools/output-meta.js";
import { type DescribeContext, type NativeNode, type NativeUiEvent } from "../native/node.js";
/** PTY size for `!` commands: the execution frame's inner content area. */
export declare function bashPtyViewport(ui: TUI): {
    cols: number;
    rows: number;
};
export declare class BashExecutionComponent extends Container {
    #private;
    constructor(command: string, ui: TUI, excludeFromContext?: boolean);
    /**
     * Transcript finalization contract (see `FinalizableBlock`): the collapsed
     * streaming preview rewrites its tail window every chunk, so the block must
     * stay out of native scrollback until the command completes.
     */
    isTranscriptBlockFinalized(): boolean;
    getTranscriptBlockVersion(): number;
    /**
     * Set whether the output is expanded (shows full output) or collapsed (preview only).
     */
    setExpanded(expanded: boolean): void;
    invalidate(): void;
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * The agent's bash `tool` frame (role `omp.bash`) with a `you` badge: the
     * command in the head, the output as an `ansi` mini terminal following its
     * tail. Terminals without the `tool` kind get a `card` headed by the
     * command.
     */
    describe(cx?: DescribeContext): NativeNode;
    appendOutput(chunk: string): void;
    /** Switch to PTY rendering and feed raw terminal bytes through the vterm replay. */
    appendPtyChunk(chunk: string): void;
    setComplete(exitCode: number | undefined, cancelled: boolean, options?: {
        output?: string;
        truncation?: TruncationMeta;
        artifactError?: OutputArtifactError;
        images?: readonly ImageContent[];
        showImages?: boolean;
    }): void;
    render(width: number): readonly string[];
    /**
     * Get the raw output for creating BashExecutionMessage.
     */
    getOutput(): string;
    /**
     * Get the command that was executed.
     */
    getCommand(): string;
}
