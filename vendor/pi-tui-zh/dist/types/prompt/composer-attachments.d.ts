/** Attachment chip kinds staged in the composer: images, video previews, and large text pastes. */
export type ChipKind = "image" | "video" | "paste";
/** Compact atomic composer token for an invoked skill in the active symbol preset. */
export declare function skillChipLabel(name: string): string;
/** Compact atomic composer token for a model mention in the active symbol preset. */
export declare function modelMentionChipLabel(name: string): string;
/** Canonical `/skill:<name>` token a skill chip expands to on submit. */
export declare function skillToken(name: string): string;
/**
 * Soft-pill styling for a skill chip: bold skill label color over the custom-message
 * tint. `restore` re-arms the surrounding foreground/background after the chip.
 */
export declare function skillChipStyle(label: string, restore?: string): string;
/** Soft-pill styling for a model mention, restoring the surrounding colors afterward. */
export declare function modelChipStyle(label: string, restore?: string): string;
/**
 * Replaces `/skill:<name>` tokens for known skills with compact chip labels and
 * registers each label's token as its atomic editor expansion. Leaves the text
 * untouched when skill tokens are not invocations in this draft (see
 * {@link allowsSkillTokens}).
 */
export declare function collapseSkillTokens(text: string, isKnown: (name: string) => boolean, register: (label: string, expansion: string) => void): string;
/**
 * Replaces mentionable model selectors with their display chips and registers
 * each chip's canonical selector as its atomic editor expansion.
 */
export declare function collapseModelMentions(text: string, labelFor: (selector: string) => string | undefined, register: (label: string, expansion: string) => void): string;
/** Compact atomic composer token for attachment `n` in the active symbol preset. */
export declare function chipLabel(kind: ChipKind, n: number): string;
/** Infers an attachment kind from a chip label emitted by any configured symbol preset. */
export declare function chipLabelKind(label: string): ChipKind;
/** Stable RGB color assigned to attachment `n`; each attachment type uses a distinct palette offset. */
export declare function attachmentRgb(kind: ChipKind, n: number): readonly [number, number, number];
/** ANSI truecolor foreground sequence for the color assigned by {@link attachmentRgb}. */
export declare function attachmentSgr(kind: ChipKind, n: number): string;
/** Matches expanded image, video, and paste markers, including optional marker metadata. */
export declare const PLACEHOLDER_REGEX: RegExp;
/** Matches an expanded attachment marker, a compact attachment chip, or a skill chip. */
export declare const COMPOSER_TOKEN_REGEX: RegExp;
/**
 * Attachment indices referenced by a composer buffer, per kind. Image/video count compact chips
 * and expanded markers; paste counts compact chips only, since `[Paste #N]` markers number the
 * base editor's separate paste buffer. Registered labels take precedence over theme glyphs so
 * tokens created before a theme switch keep their kind; full numbers prevent `#1` matching `#10`.
 */
export declare function referencedAttachments(text: string, recorded: ReadonlyMap<string, ChipKind>): Record<ChipKind, Set<number>>;
/** Add the registered model-chip labels to the composer placeholder matcher. */
export declare function composerTokenRegex(mentionLabels: Iterable<string>): RegExp;
/** Marker for the Nth attached image or video preview: `[Image #N, WxH]`, or `[Image #N]` without dims. */
export declare function formatVisionMarker(kind: "image" | "video", n: number, dims?: {
    width: number;
    height: number;
}): string;
/**
 * Offsets image marker indices, including matching `attachment://` references. With `imageCount`,
 * markers above it are left alone: like `compactImageMarkers`, they are not this text's attachments.
 */
export declare function shiftImageMarkers(text: string, offset: number, imageCount?: number): string;
/**
 * Replaces valid expanded image markers with compact tokens and registers each
 * token's original marker as its atomic editor expansion.
 */
export declare function collapseImageMarkers(text: string, imageCount: number, register: (label: string, expansion: string) => void): string;
/**
 * Drops unreferenced vision attachments from a submission and densely remaps
 * retained image/video markers. Returns `null` when no compaction is needed.
 * With `byAppearance`, retained markers are also renumbered in the order they first
 * appear, for editors whose images attach out of order (concurrent path loads).
 */
export declare function compactImageMarkers(text: string, imageCount: number, options?: {
    byAppearance?: boolean;
}): {
    text: string;
    keep: number[];
} | null;
/** Attachment kinds understood by placeholder renderers. */
export type PlaceholderKind = "image" | "video" | "paste";
/** Rendering callbacks for plain text and parsed attachment references. */
export interface PlaceholderRenderers {
    /** Renders text outside attachment references. */
    renderText: (text: string) => string;
    /** Renders one parsed marker or compact chip token. */
    renderReference: (label: string, kind: PlaceholderKind, index: number, form: "marker" | "chip") => string;
    /** Renders one skill chip (`<icon> <name>`). */
    renderSkill: (label: string, name: string) => string;
    /** Renders one registered model mention chip. */
    renderMention: (label: string) => string;
}
/** Renders text while treating expanded markers, attachment chips, skill chips, and model mentions as distinct references. */
export declare function renderPlaceholders(text: string, renderers: PlaceholderRenderers, tokenRegex?: RegExp): string;
