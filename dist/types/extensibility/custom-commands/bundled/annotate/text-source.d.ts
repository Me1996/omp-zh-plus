import { type CopyPickSource } from "@oh-my-pi/pi-tui-zh/overlays/copy-selector";
import type { CustomCommandContext } from "../../../../extensibility/custom-commands/types.js";
import type { TextReviewSource } from "@oh-my-pi/pi-tui-zh/overlays/annotation-types";
export type AnnotationSourceKind = "code-review" | "last" | "session" | "file" | "prompt";
export declare const ANNOTATION_SOURCE_CHOICES: readonly [{
    readonly kind: "code-review";
    readonly label: "Code review";
    readonly description: "Annotate a local diff before review";
}, {
    readonly kind: "last";
    readonly label: "Latest assistant reply";
    readonly description: "Annotate the latest non-empty assistant reply on this branch";
}, {
    readonly kind: "session";
    readonly label: "Session message or block";
    readonly description: "Choose a message, code block, quote, or command from this session";
}, {
    readonly kind: "file";
    readonly label: "File";
    readonly description: "Read a regular text file from the current working directory";
}, {
    readonly kind: "prompt";
    readonly label: "Text prompt";
    readonly description: "Enter text directly for annotation";
}];
export declare function selectAnnotationSourceKind(ui: Pick<CustomCommandContext["ui"], "select">): Promise<AnnotationSourceKind | undefined>;
/** Exact picked content plus the transcript entry/block it came from. */
export interface SessionPick extends CopyPickSource {
    content: string;
    label: string;
}
/** Choose exact content through the native copy selector without copying it. */
export declare function selectSessionTextReviewSource(ctx: CustomCommandContext, options?: {
    autoSelect?: "latest-assistant";
}): Promise<TextReviewSource | undefined>;
