import type { Component, TUI } from "@oh-my-pi/pi-tui-zh";
import type { SttTarget } from "./stt-controller.js";
/** The cursor surface of a text input that push-to-talk paints its mic glyph onto. */
export interface MicCursorTarget extends Component {
    cursorOverride: string | undefined;
    getUseTerminalCursor(): boolean;
    setUseTerminalCursor(useTerminalCursor: boolean): void;
}
/** A text input push-to-talk dictates into: the text the STT controller writes and the cursor the
 *  mic glyph replaces. */
export type DictationTarget = SttTarget & MicCursorTarget;
/** Replaces a text input's cursor with a hue-cycling mic glyph while speech is recorded, holds it
 *  grey while the recording is transcribed, and restores the cursor state it found on {@link dispose}. */
export declare class MicCursor {
    #private;
    constructor(ui: TUI, target: MicCursorTarget);
    /** Stop cycling and hold the glyph grey while the recording is transcribed. */
    showTranscribing(): void;
    dispose(): void;
}
