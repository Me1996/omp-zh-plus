import { type ReviewDiffSnapshot } from "./diff.js";
export type LocalReviewKind = "base-branch" | "uncommitted" | "commit";
/** One frozen diff: the annotation view and the reviewer prompt both read this snapshot. */
export interface ResolvedReviewTarget {
    kind: LocalReviewKind | "pr";
    mode: string;
    rawDiff: string;
    snapshot: ReviewDiffSnapshot;
    emptyMessage: string;
    filteredMessage?: string;
    diffInstruction?: string;
    contextInstruction?: string;
}
export interface ReviewTargetUI {
    select(title: string, options: string[]): Promise<string | undefined>;
    notify(message: string, type?: "info" | "warning" | "error"): void;
}
export declare const LOCAL_REVIEW_CHOICES: ReadonlyArray<{
    label: string;
    kind: LocalReviewKind;
}>;
export declare function createResolvedReviewTarget(kind: ResolvedReviewTarget["kind"], mode: string, rawDiff: string, emptyMessage: string, options?: Pick<ResolvedReviewTarget, "filteredMessage" | "diffInstruction" | "contextInstruction">): ResolvedReviewTarget;
export declare function getReviewTargetIssue(target: ResolvedReviewTarget): string | undefined;
/** Read staged + unstaged (or jj working-copy) changes; throws when no repository is available. */
export declare function readUncommittedReviewTarget(cwd: string): Promise<ResolvedReviewTarget>;
export declare function resolveLocalReviewTarget(kind: LocalReviewKind, cwd: string, ui: ReviewTargetUI): Promise<ResolvedReviewTarget | undefined>;
