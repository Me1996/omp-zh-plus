/** Recorded merge-conflict region. */
export interface ConflictBlock {
    /** 1-indexed line of the `<<<<<<<` marker. */
    startLine: number;
    /** 1-indexed line of the `=======` separator. */
    separatorLine: number;
    /** 1-indexed line of the `>>>>>>>` marker. */
    endLine: number;
    /** 1-indexed line of the `|||||||` base marker (diff3 only). */
    baseLine?: number;
    oursLabel?: string;
    baseLabel?: string;
    theirsLabel?: string;
    oursLines: string[];
    baseLines?: string[];
    theirsLines: string[];
}
/** Recorded merge-conflict identity and paths. */
export interface ConflictEntry extends ConflictBlock {
    id: number;
    absolutePath: string;
    displayPath: string;
}
/** A selectable side of a recorded conflict. */
export type ConflictScope = "ours" | "theirs" | "base";
/**
 * Materialise a conflict block for `conflict://<N>` reads (and their
 * `/ours` / `/theirs` / `/base` scopes).
 *
 * Returns:
 * - `lines`: the lines to render, ordered top-to-bottom.
 * - `startLine`: the 1-indexed file line number `lines[0]` corresponds
 *   to, so the read formatter can label hashline anchors with the
 *   original file positions.
 *
 * Bare (no scope) returns the full block including marker lines. A
 * scoped view returns only that side's body — `base` throws when the
 * recorded conflict is a 2-way merge with no base section.
 */
export declare function renderConflictRegion(entry: ConflictEntry, scope: ConflictScope | undefined): {
    lines: string[];
    startLine: number;
};
