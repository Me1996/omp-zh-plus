import type { ReviewDiffFile } from "@oh-my-pi/pi-tui-zh/overlays/annotation-types";
export interface ExcludedReviewFile {
    path: string;
    reason: string;
    linesAdded: number;
    linesRemoved: number;
}
export interface ReviewDiffSnapshot {
    files: ReviewDiffFile[];
    excluded: ExcludedReviewFile[];
    totalAdded: number;
    totalRemoved: number;
}
/** Parses a frozen git-format patch into independently addressable file occurrences. */
export declare function parseReviewDiffSnapshot(rawDiff: string): ReviewDiffSnapshot;
export declare function getRecommendedReviewAgentCount(snapshot: ReviewDiffSnapshot): number;
/** Returns content rows only, preserving the patch's original row ordering. */
export declare function getReviewDiffPreview(rawDiff: string, maxLines: number): string;
