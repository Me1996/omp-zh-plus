import type { CustomCommand, CustomCommandAPI } from "../../../../extensibility/custom-commands/types.js";
import type { HookCommandContext } from "../../../../extensibility/hooks/types.js";
import { type LocalReviewKind, type ResolvedReviewTarget } from "./target.js";
interface ParsedReviewArgs {
    prRef: ReviewPrRef | undefined;
    extraInstructions: string;
}
export interface ReviewPrRef {
    repo: string;
    number: number;
    raw: string;
    kind: "github-url" | "pr-url";
}
/** A diff the reviewer can target: a detected PR or one local diff kind. */
export type ReviewTargetChoice = {
    label: string;
    kind: "pr";
    ref: ReviewPrRef;
} | {
    label: string;
    kind: LocalReviewKind;
};
export type ReviewChoice = ReviewTargetChoice | {
    label: string;
    kind: "custom";
};
export declare function parseReviewPrRef(text: string): ReviewPrRef | undefined;
export declare function extractReviewPrRefFromArgs(args: string[]): ParsedReviewArgs;
/** Fetch one PR patch and freeze it before any overlay or LLM prompt is built. */
export declare function resolvePrReviewTarget(cwd: string, ctx: HookCommandContext, ref: ReviewPrRef): Promise<ResolvedReviewTarget | undefined>;
export declare function findRecentPrRefs(ctx: HookCommandContext, limit: number): ReviewPrRef[];
/**
 * Review target menu shared by `/review` and `/annotate code-review`. Picking
 * "Review a specific PR" opens the open-PR picker and resolves to a `pr`
 * choice, so callers never see the picker step.
 */
export declare function selectReviewChoice(ctx: HookCommandContext, cwd: string): Promise<ReviewTargetChoice | undefined>;
export declare function selectReviewChoice(ctx: HookCommandContext, cwd: string, options: {
    includeCustom: boolean;
}): Promise<ReviewChoice | undefined>;
/**
 * `api.cwd` freezes at command-load time; after /move or /wt the live session
 * cwd comes from the session manager (issue #12501).
 */
export declare function liveCommandCwd(api: CustomCommandAPI, ctx: HookCommandContext): string;
export declare class ReviewCommand implements CustomCommand {
    private readonly api;
    name: string;
    description: string;
    constructor(api: CustomCommandAPI);
    execute(args: string[], ctx: HookCommandContext): Promise<string | undefined>;
}
export default ReviewCommand;
