import type { ImageContent } from "@oh-my-pi/pi-ai";
import type { CustomEditor } from "@oh-my-pi/pi-tui-zh/prompt/custom-editor";
import type { TuiSlashCommandRuntime } from "../types.js";
/** Clear only text still owned by this submission, never a newer detached draft. */
export declare function clearSubmittedText(runtime: TuiSlashCommandRuntime): void;
/**
 * Return a submission that already left the editor without replacing a draft
 * typed while it awaited dispatch: its attachments append after the newer
 * draft's, its `[Image #N]` markers shift to match, and its text goes first.
 */
export declare function restoreDetachedDraft(editor: CustomEditor, text: string, images?: ImageContent[], imageLinks?: (string | undefined)[]): void;
