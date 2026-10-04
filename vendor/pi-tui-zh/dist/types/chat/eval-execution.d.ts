/**
 * Component for displaying user-initiated eval execution with streaming output.
 * Shares the same kernel session as the agent's eval tool.
 */
import { Container, type TUI } from "../tui.js";
import type { OutputArtifactError } from "../tools/streaming-output.js";
import type { TruncationMeta } from "../tools/output-meta.js";
import { type DescribeContext, type NativeNode, type NativeUiEvent } from "../native/node.js";
export type EvalExecutionLanguage = "python" | "js";
export declare class EvalExecutionComponent extends Container {
    #private;
    constructor(code: string, ui: TUI, excludeFromContext?: boolean, language?: EvalExecutionLanguage);
    /**
     * Transcript finalization contract (see `FinalizableBlock`): the collapsed
     * streaming preview rewrites its tail window every chunk, so the block must
     * stay out of native scrollback until the cell completes.
     */
    isTranscriptBlockFinalized(): boolean;
    getTranscriptBlockVersion(): number;
    setExpanded(expanded: boolean): void;
    invalidate(): void;
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * The agent's eval `tool` frame (role `omp.eval`) with a `you` badge: the
     * cell source in the head, its output as an `ansi` mini terminal. Terminals
     * without the `tool` kind get a `card` with the cell as `code` over the output.
     */
    describe(cx?: DescribeContext): NativeNode;
    appendOutput(chunk: string): void;
    setComplete(exitCode: number | undefined, cancelled: boolean, options?: {
        output?: string;
        truncation?: TruncationMeta;
        artifactError?: OutputArtifactError;
    }): void;
    getOutput(): string;
    getCode(): string;
}
