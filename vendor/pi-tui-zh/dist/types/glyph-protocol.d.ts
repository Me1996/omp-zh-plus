/** One bundled outline: base64 simple-glyph record plus its scale policy. */
export interface GlyphBundleEntry {
    /** Base64 OpenType `glyf` simple-glyph record (§8.2 subset). */
    glyf: string;
    /** Fill the cell edge to edge (`size=stretch`, powerline); otherwise `size=contain`. */
    stretch?: boolean;
}
/** Generated icon bundle: shared design metrics plus outlines keyed by lowercase hex codepoint. */
export interface GlyphBundle {
    upm: number;
    /** Authored advance width — identical for every glyph of a Mono face. */
    aw: number;
    /** Authored line height (ascender − descender); outlines are lifted so y=0 is the descender line. */
    lh: number;
    glyphs: Record<string, GlyphBundleEntry>;
}
export declare const GLYPH_BUNDLE: GlyphBundle;
/**
 * Codepoint the handshake queries after registration to confirm the bundle
 * was accepted: the omp mark (`icon.omp`), which the status line always shows.
 */
export declare const GLYPH_CONFIRMATION_CODEPOINT = 986455;
/** Terminal reply to any Glyph Protocol verb, decoded from its APC body. */
export type GlyphProtocolReply = {
    verb: "s";
    formats: string[];
} | {
    verb: "q";
    cp: number;
    coverage: string[];
} | {
    verb: "r";
    cp: number;
    status: number;
    reason?: string;
} | {
    verb: "c";
    status: number;
    reason?: string;
};
/** Whether `cp` lies in one of the three Private Use Areas the protocol accepts. */
export declare function isPrivateUseCodepoint(cp: number): boolean;
/** `s` verb: doubles as the protocol-detection ping (any reply confirms support). */
export declare function encodeGlyphSupportQuery(): string;
/** `q` verb: ask which sources (system font, session glossary) render `cp`. */
export declare function encodeGlyphCoverageQuery(cp: number): string;
/**
 * `r` verb for one bundled outline at `cp`. Layout hints follow the bundle's
 * design metrics; `reply=0` suppresses the acknowledgement so bulk startup
 * registration leaves nothing on stdin to drain.
 */
export declare function encodeGlyphRegistration(cp: number, entry: GlyphBundleEntry, metrics?: GlyphBundle): string;
/** Every bundled icon as one contiguous write. */
export declare function encodeBundledGlyphRegistrations(metrics?: GlyphBundle): string;
/** Whether `sequence` is a complete Glyph Protocol APC message. */
export declare function isGlyphProtocolSequence(sequence: string): boolean;
/**
 * Decode a terminal reply. Returns null for anything that is not a well-formed
 * Glyph Protocol message; unknown keys are ignored per §11 so future
 * parameters never break detection.
 */
export declare function parseGlyphProtocolReply(sequence: string): GlyphProtocolReply | null;
