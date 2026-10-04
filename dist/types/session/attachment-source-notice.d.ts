import type { ImageContent } from "@oh-my-pi/pi-ai";
import { IMAGE_ATTACHMENT_TYPE, VIDEO_ATTACHMENT_TYPE } from "./queued-messages.js";
/** Structured copy of the notice's attachment index and source path for transcript renderers. */
export interface AttachmentSourceNoticeDetails {
    index: number;
    path: string;
}
/** Model-facing notice naming the file behind an image or video attachment. */
export interface AttachmentSourceNotice {
    customType: typeof IMAGE_ATTACHMENT_TYPE | typeof VIDEO_ATTACHMENT_TYPE;
    content: string;
    details: AttachmentSourceNoticeDetails;
}
/**
 * Render the notice for attachment `[Image #index]` / `[Video #index]` so the model can `read`,
 * copy, or upload its file. Undefined when no file backs the attachment.
 */
export declare function renderAttachmentSourceNotice(image: ImageContent, index: number, options?: {
    askAnswer?: boolean;
}): AttachmentSourceNotice | undefined;
