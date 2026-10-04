import type { CustomCommandContext } from "../../../../extensibility/custom-commands/types.js";
import type { TextReviewSource } from "@oh-my-pi/pi-tui-zh/overlays/annotation-types";
/** Read one regular text file without trimming or otherwise rewriting its bytes. */
export declare function acquireFileTextReviewSource(ctx: CustomCommandContext, inputPath: string): Promise<TextReviewSource | undefined>;
/** Create a prompt-backed source while preserving the supplied text exactly. */
export declare function createPromptTextReviewSource(ctx: CustomCommandContext, text: string): TextReviewSource | undefined;
