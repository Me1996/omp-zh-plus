import type { NativeNode } from "../native/node.js";
import { type ThemeColor } from "../theme/index.js";
import { TranscriptBlock } from "./transcript-container.js";
/** One themed run of a status row. */
export interface TranscriptStatusPart {
    readonly text: string;
    readonly color: ThemeColor;
    /** Glyph art (tree connectors) drawn only in rows; native terminals draw their own structure. */
    readonly rowsOnly?: boolean;
}
/** One compact transcript status row assembled from themed parts, joined by single spaces. */
export interface TranscriptStatusRow {
    readonly parts: readonly (TranscriptStatusPart | undefined)[];
    readonly indent?: number;
}
/** Shared compact status-pill block used by notices and background activity. */
export declare class TranscriptStatusBlock extends TranscriptBlock {
    #private;
    constructor(rows: readonly TranscriptStatusRow[]);
    /** Append a supplemental line such as an artifact warning. */
    addLine(parts: readonly (TranscriptStatusPart | undefined)[], indent?: number): void;
    /** One wrapped text line per status row. */
    describe(): NativeNode;
}
