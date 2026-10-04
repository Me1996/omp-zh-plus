/**
 * Decode Windows console win32-input-mode key records into the key sequences
 * the rest of the TUI already understands.
 *
 * Hosts without the kitty keyboard protocol (Windows Terminal before 1.25)
 * deliver Shift+Enter as a bare `\r` (indistinguishable from Enter) and
 * Ctrl+Enter as `\n`. Enabling `CSI ? 9001 h` makes the console host serving
 * this process report every key as `CSI Vk ; Sc ; Uc ; Kd ; Cs ; Rc _`, which
 * carries the full modifier state. Mouse reports and terminal replies keep
 * arriving as plain VT. Pasted text mostly does too, but the console host
 * re-encodes some pasted characters (line breaks) as key records inside the
 * bracketed paste; {@link Win32InputModeDecoder.decodePaste} turns those back
 * into text.
 *
 * Unmodified and legacy-expressible keys translate to the bytes a legacy
 * terminal sends; chords legacy encoding loses (modified Enter/Tab/Escape,
 * Ctrl+Shift+letter, …) translate to kitty CSI-u, which key matching already
 * parses.
 *
 * A host terminal that writes VT instead of key records (any ConPTY host
 * besides Windows Terminal's native path) reaches us as one `Vk = 0` text
 * record per byte: Alt+Up arrives as `ESC`, `[`, `1`, `;`, `3`, `A`. Those
 * bytes are reassembled into the escape sequence they spell; delivering them
 * one at a time turns every such key into a bare Escape plus typed garbage.
 */
/**
 * Stateful decoder: joins UTF-16 surrogate halves that arrive as separate
 * records, and reassembles VT escape sequences relayed as text records.
 */
export declare class Win32InputModeDecoder {
    #private;
    /** Whether relayed VT text is held waiting for the rest of its sequence. */
    get hasPendingSequence(): boolean;
    /**
     * Release held VT text as-is. The caller invokes this once no further bytes
     * arrived in time, so a lone relayed ESC still acts as the Escape key.
     */
    flushPendingSequence(): string[];
    /**
     * Translate one stdin sequence. Returns `undefined` when `data` is not a
     * win32-input-mode record (pass it through unchanged), otherwise the key
     * events it produces — empty for key releases and bare modifier presses.
     */
    decode(data: string): string[] | undefined;
    /**
     * Replace the key records embedded in bracketed paste `content` with the
     * text they type, so a pasted line break stays a line break instead of
     * acting as Enter. Key-downs yield their character (`\r` for Enter);
     * releases and keys without text yield nothing. Text that merely looks like
     * a record without ESC is left alone.
     */
    decodePaste(content: string): string;
}
/**
 * Restores paste delimiters that a Windows console host emitted as individual
 * win32-input-mode key records before StdinBuffer searches for the delimiters.
 * Non-matching records remain untouched for normal key and paste decoding.
 */
export declare class Win32PasteMarkerNormalizer {
    #private;
    /**
     * `onExpired` runs after held records are released because their wait timed
     * out, so a downstream holder can treat the same wait as already elapsed.
     */
    constructor(onInput: (data: string) => void, onExpired?: () => void);
    process(data: string): void;
    /** Release an incomplete marker as its original key records. */
    flush(): void;
}
