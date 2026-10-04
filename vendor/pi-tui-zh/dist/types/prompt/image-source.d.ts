/**
 * File source carried on image attachments backed by a file on disk:
 * path-pasted/drag-and-dropped images, clipboard images the coding agent commits
 * to the session's `local://` root, and generated video contact-sheet previews.
 * Symbol metadata stays out of serialized/model-bound image data while traveling
 * with the draft object, until AgentSession creates the hidden companion message
 * that tells the model the path (and link materialization prefers it over a blob copy).
 */
import type { ImageContent } from "@oh-my-pi/pi-ai";
/** How an image attachment's backing file entered the session. */
export type ImageAttachmentSourceKind = "image" | "video";
/** Local file backing an image attachment. */
export interface ImageAttachmentSource {
    /** Absolute filesystem path, or a session-relative `local://` URL for images committed to the session. */
    readonly path: string;
    readonly kind: ImageAttachmentSourceKind;
}
declare const kImageAttachmentSource: unique symbol;
/** An image attachment tagged with the original local file it came from. */
export type SourceTaggedImage = ImageContent & {
    readonly [kImageAttachmentSource]: ImageAttachmentSource;
};
/** Create a model-ready image tagged with the local file it was loaded from. */
export declare function tagImageAttachmentSource(image: ImageContent, path: string, kind: ImageAttachmentSourceKind): SourceTaggedImage;
/** Return the local file backing an image attachment, or undefined for payloads with no file on disk. */
export declare function imageAttachmentSource(image: ImageContent): ImageAttachmentSource | undefined;
export {};
