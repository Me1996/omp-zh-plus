export type PasteResult = {
    handled: false;
} | {
    handled: true;
    pasteContent?: string;
    remaining: string;
};
/**
 * Decode tmux's re-encoded control bytes (both `extended-keys-format` variants) inside a
 * bracketed-paste payload back to their literal byte (e.g. Ctrl+J → "\n"). Leaves the rest of
 * the text untouched. Call before any control-character stripping so newlines/tabs survive
 * instead of leaking the printable escape tail into the buffer.
 */
export declare function decodeReencodedPasteControls(text: string): string;
/**
 * Options for {@link BracketedPasteHandler}.
 */
export type BracketedPasteHandlerOptions = {
    /**
     * Byte cap for buffered paste content (default: 64 MiB). When exceeded,
     * paste mode is aborted and the accumulated content is delivered as
     * `pasteContent` on the same `process()` call so a lost/corrupted end
     * marker cannot consume unbounded memory. Mirrors `StdinBuffer#abortPaste`
     * — defense in depth for callers that bypass `StdinBuffer` (issue #4073
     * case B). The normal `ProcessTerminal` path re-wraps `StdinBuffer`'s
     * bounded paste with both markers, so this cap only fires on alternate
     * callers.
     */
    byteLimit?: number;
};
/**
 * Handles bracketed paste mode buffering for terminal input components.
 *
 * Bracketed paste mode wraps pasted content between start (\x1b[200~) and
 * end (\x1b[201~) markers, which may arrive split across multiple chunks.
 * This class buffers incoming data and assembles complete paste payloads.
 */
export declare class BracketedPasteHandler {
    #private;
    constructor(options?: BracketedPasteHandlerOptions);
    /**
     * Process incoming terminal data for bracketed paste sequences.
     *
     * @returns `{ handled: false }` if the data contains no paste sequence and
     *          should be processed normally. `{ handled: true }` if the data was
     *          consumed by paste buffering — `pasteContent` is set when a complete
     *          paste has been assembled (or the byte cap has aborted a runaway
     *          buffer); omitted when still buffering.
     */
    process(data: string): PasteResult;
}
