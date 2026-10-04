import type { CustomCommandContext } from "../../../../extensibility/custom-commands/types.js";
type SummaryContext = Pick<CustomCommandContext, "model" | "modelRegistry" | "sessionManager">;
/** Generate grounding context with the selected session model, never a hidden fallback model. */
export declare function generateTextReviewContextSummary(ctx: SummaryContext, sourceText: string, signal?: AbortSignal): Promise<string | undefined>;
export {};
