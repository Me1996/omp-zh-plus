/**
 * True when a first user message is too low-signal to title (greeting, ack,
 * bare number, or empty once code/punctuation/emoji are stripped).
 *
 * Deterministic pre-filter: the default tiny title model (~350M local) cannot
 * reliably follow a "respond with none" instruction and tends to hallucinate a
 * title for trivial input, so we never ask it — the caller defers titling to
 * the next message instead.
 */
export declare function isLowSignalTitleInput(message: string): boolean;
/**
 * True when a first message only points at an attachment ("fix [Image #1]",
 * "why do i get this? [Image #1]"): the text-only title model sees no task and
 * either echoes the placeholder or invents the image contents, so titling waits
 * for the assistant to describe it.
 */
export declare function isAttachmentOnlyTitleInput(message: string): boolean;
/**
 * Sentinel a capable title model may emit when a message carries no concrete
 * task. Treated as "no title yet" so the caller can defer titling. Backstop for
 * the deterministic {@link isLowSignalTitleInput} filter; kept in sync with the
 * `<title/>` instruction in `prompts/system/title-system.md`.
 */
export declare const NO_TITLE_SENTINEL = "none";
export declare function normalizeGeneratedTitle(value: string | null | undefined, sourceText?: string): string | null;
