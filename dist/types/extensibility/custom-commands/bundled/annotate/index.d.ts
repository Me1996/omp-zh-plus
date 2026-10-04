import type { CustomCommand, CustomCommandAPI, CustomCommandContext } from "../../../../extensibility/custom-commands/types.js";
import type { AutocompleteItem } from "@oh-my-pi/pi-tui-zh";
import type { CodeReviewOverlayResult } from "@oh-my-pi/pi-tui-zh/overlays/annotation-types";
import { type ReviewPrRef } from "../review/index.js";
import { type LocalReviewKind, type ResolvedReviewTarget, type ReviewTargetUI } from "../review/target.js";
import { acquireFileTextReviewSource, createPromptTextReviewSource } from "./direct-source.js";
import { showTextReviewOverlay } from "./fullscreen.js";
import { selectAnnotationSourceKind, selectSessionTextReviewSource } from "./text-source.js";
import { generateTextReviewContextSummary } from "./text-summary.js";
interface CodeReviewDependencies {
    resolveLocalReviewTarget(kind: LocalReviewKind, cwd: string, ui: ReviewTargetUI): Promise<ResolvedReviewTarget | undefined>;
    resolvePrReviewTarget(cwd: string, ctx: CustomCommandContext, ref: ReviewPrRef): Promise<ResolvedReviewTarget | undefined>;
    showCodeReviewOverlay(ctx: CustomCommandContext, target: ResolvedReviewTarget): Promise<CodeReviewOverlayResult | undefined>;
}
interface TextAnnotationDependencies {
    selectAnnotationSourceKind: typeof selectAnnotationSourceKind;
    selectSessionTextReviewSource: typeof selectSessionTextReviewSource;
    acquireFileTextReviewSource: typeof acquireFileTextReviewSource;
    createPromptTextReviewSource: typeof createPromptTextReviewSource;
    showTextReviewOverlay: typeof showTextReviewOverlay;
    generateTextReviewContextSummary: typeof generateTextReviewContextSummary;
}
/** Run `/annotate code-review`, freezing one target before the overlay opens. */
export declare function runCodeReviewCommand(api: CustomCommandAPI, args: string, ctx: CustomCommandContext, dependencies?: Partial<CodeReviewDependencies>): Promise<string | undefined>;
/** Run `/annotate` text sources; all resulting feedback is pasted, never submitted. */
export declare function runAnnotateCommand(api: CustomCommandAPI, args: string, ctx: CustomCommandContext, dependencies?: Partial<TextAnnotationDependencies & CodeReviewDependencies>): Promise<string | undefined>;
export declare class AnnotateCommand implements CustomCommand {
    #private;
    private readonly api;
    name: string;
    description: string;
    constructor(api: CustomCommandAPI);
    getArgumentCompletions(argumentPrefix: string, cwd: string): Promise<AutocompleteItem[] | null>;
    execute(args: string[], ctx: CustomCommandContext, rawArgs?: string): Promise<string | undefined>;
}
export default AnnotateCommand;
