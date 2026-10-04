import type { TextReviewAnnotation, TextReviewSource } from "@oh-my-pi/pi-tui-zh/overlays/annotation-types";
export declare function shouldSummarizeTextReviewSource(source: TextReviewSource): boolean;
export declare function normalizeTextReviewContextSummary(text: string): string;
/** Build one paste-only text feedback prompt; empty annotations produce no prompt. */
export declare function buildTextReviewPrompt(source: TextReviewSource, annotations: readonly TextReviewAnnotation[], contextSummary?: string): string | undefined;
