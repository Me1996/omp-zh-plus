import * as native from "@oh-my-pi/pi-natives";
import type { EditorInlineReplacement, EditorTextAssistProvider, EditorWordReplacements } from "../components/editor.js";
import { type SpellingDecorationContext } from "./prose-gate.js";
/** Independently switchable macOS prose-assistance features. */
export interface MacOSSpellingFeatures {
    typoDetection: boolean;
    autocorrect: boolean;
}
/** Native spelling operations used by {@link MacOSSpellingProvider}. */
export interface SpellingBackend {
    isAvailable(): boolean;
    checkSpelling(text: string): Promise<readonly native.SpellingRange[]>;
    autocorrectWord(text: string, start: number, length: number): Promise<string | null>;
    spellingGuesses(text: string, start: number, length: number): Promise<readonly string[]>;
}
/**
 * Bridges Apple's spelling service into the editor's typo and autocorrection
 * paths. Word completion is the cross-platform `WordCompletionProvider`
 * (`word-completion.ts`).
 */
export declare class MacOSSpellingProvider implements EditorTextAssistProvider {
    #private;
    private readonly backend;
    /** Invoked when an asynchronous spelling result can change rendered output. */
    onUpdate: (() => void) | undefined;
    constructor(backend?: SpellingBackend, styledUnderlines?: boolean);
    /** Apply both independent feature gates and invalidate rendered typo ranges. */
    setFeatures(features: MacOSSpellingFeatures): void;
    /** Add red undercurls to misspellings while preserving visible text width. */
    decorateTypos(text: string, context: SpellingDecorationContext, decorate?: (span: string) => string): string;
    /**
     * Misspelled prose ranges in `text` (offsets into it), in order and
     * non-overlapping. Schedules the verification check for uncached text; its
     * result arrives through {@link onUpdate}.
     */
    typoRanges(text: string, context: SpellingDecorationContext): readonly native.SpellingRange[];
    /** Return the confident macOS correction after a completed prose word. */
    tryAutocorrect(lines: string[], cursorLine: number, cursorCol: number): Promise<EditorInlineReplacement | null>;
    /** Return macOS replacement guesses for the misspelled word at the cursor. */
    getWordReplacements(lines: string[], cursorLine: number, cursorCol: number): Promise<EditorWordReplacements | null>;
}
