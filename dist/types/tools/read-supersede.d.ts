import type { ToolResultMessage } from "@oh-my-pi/pi-ai";
/**
 * Whether a successful `read` result shows its whole file, so a bare-path read
 * may supersede earlier range reads of that file (`supersedeComplete` for
 * `pruneSupersededToolResults`). Complete needs positive proof: a scanned line
 * count or a returned image, with no summary, truncation, or column cap.
 * Summaries, partial pages, and notices (binary file, directory, metadata) are
 * not complete.
 */
export declare function isCompleteReadResult(message: ToolResultMessage): boolean;
