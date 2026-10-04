import type { CustomCommandContext } from "../../../../extensibility/custom-commands/types.js";
import type { CodeReviewOverlayResult, TextReviewOverlayResult, TextReviewSource } from "@oh-my-pi/pi-tui-zh/overlays/annotation-types";
import type { ResolvedReviewTarget } from "../review/target.js";
/** Mount the frozen diff in the TUI overlay surface owned by the command host. */
export declare function showCodeReviewOverlay(ctx: CustomCommandContext, target: ResolvedReviewTarget): Promise<CodeReviewOverlayResult | undefined>;
/** Mount a frozen text source in the same annotation overlay UX. */
export declare function showTextReviewOverlay(ctx: CustomCommandContext, source: TextReviewSource): Promise<TextReviewOverlayResult | undefined>;
