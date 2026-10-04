import type { CodeReviewAnnotation } from "@oh-my-pi/pi-tui-zh/overlays/annotation-types";
import type { ResolvedReviewTarget } from "./target.js";
export interface FormatCodeReviewAnnotationsOptions {
    forReviewer: boolean;
    supplementalInstructions?: string;
}
/** Formats exact annotations for a reviewer prompt or editor paste. */
export declare function formatCodeReviewAnnotations(annotations: readonly CodeReviewAnnotation[], options: FormatCodeReviewAnnotationsOptions): string | undefined;
/** Renders a review request from one frozen target snapshot. */
export declare function buildReviewPrompt(target: ResolvedReviewTarget, additionalInstructions?: string): string;
