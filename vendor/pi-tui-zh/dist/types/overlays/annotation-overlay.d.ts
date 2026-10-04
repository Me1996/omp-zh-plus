import { type Component, type TUI } from "../index.js";
import { type KeybindingsManager } from "../app-keybindings.js";
import { type Theme } from "../theme/theme.js";
import type { CodeReviewAnnotation, CodeReviewOverlayResult, ReviewDiffFile, TextReviewAnnotation, TextReviewOverlayResult, TextReviewSource } from "./annotation-types.js";
import { type NativeNode, type NativeUiEvent } from "../native/node.js";
export declare const CONTINUE_CODE_REVIEW_ACTION = "Continue with LLM review";
export declare const PASTE_CODE_REVIEW_ACTION = "Paste annotations into prompt";
export interface AnnotationOverlayCallbacks {
    onComplete(result: CodeReviewOverlayResult | TextReviewOverlayResult | undefined): void;
    onWarning?(message: string): void;
    /** Open the draft in the host's editor and invoke `commit` with its result. */
    onAnnotationExternalEditor?(draft: string, commit: (text: string | null) => void): void | Promise<void>;
}
export interface CodeReviewOverlayCallbacks extends AnnotationOverlayCallbacks {
    onComplete(result: CodeReviewOverlayResult | undefined): void;
}
export interface TextReviewOverlayCallbacks extends AnnotationOverlayCallbacks {
    onComplete(result: TextReviewOverlayResult | undefined): void;
}
/** A fullscreen, annotated diff picker that only relies on public OMP APIs. */
export declare class AnnotationOverlay implements Component {
    #private;
    constructor(tui: TUI, theme: Theme, keybindings: KeybindingsManager, files: readonly ReviewDiffFile[], mode: string, callbacks: CodeReviewOverlayCallbacks);
    constructor(tui: TUI, theme: Theme, keybindings: KeybindingsManager, source: TextReviewSource, callbacks: TextReviewOverlayCallbacks);
    invalidate(): void;
    dispose(): void;
    getAnnotations(): CodeReviewAnnotation[];
    getTextAnnotations(): TextReviewAnnotation[];
    handleInput(data: string): void;
    describe(): NativeNode;
    handleNativeEvent(event: NativeUiEvent): void;
    render(width: number): readonly string[];
}
