import type { ImageContent } from "@oh-my-pi/pi-ai";
import { type SourceTaggedImage } from "./image-source.js";
/** True when the path names a video container we handle through ffmpeg. */
export declare function isVideoPath(filePath: string): boolean;
/** A contact-sheet image tagged with the original local video path. */
export type VideoPreviewImage = SourceTaggedImage;
/** Create a model-ready contact-sheet image tagged with its original video path. */
export declare function createVideoPreviewImage(preview: ImageContent, sourcePath: string): VideoPreviewImage;
/**
 * Return the original video path associated with a generated contact-sheet
 * image, via the shared attachment-source tag (see {@link tagImageAttachmentSource}).
 * Returns undefined for untagged images and for image-file (non-video) sources.
 */
export declare function videoPreviewSource(preview: ImageContent): string | undefined;
