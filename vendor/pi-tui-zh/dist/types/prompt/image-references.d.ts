import type { ImageContent } from "@oh-my-pi/pi-ai";
/** Materialized image destination returned by the host blob writer. */
interface ImageBlobResult {
    displayPath: string;
}
/** Cached probe result for a draft image: dimensions, `null` (probe failed), or `undefined`
 *  (never probed). */
export declare function cachedImageDimensions(image: ImageContent): {
    width: number;
    height: number;
} | null | undefined;
/** Record a probe result for a draft image (see {@link cachedImageDimensions}). */
export declare function setCachedImageDimensions(image: ImageContent, dims: {
    width: number;
    height: number;
} | null): void;
type ImageBlobWriter = (data: Buffer, options?: {
    extension?: string;
}) => Promise<ImageBlobResult>;
type ImageBlobWriterSync = (data: Buffer, options?: {
    extension?: string;
}) => ImageBlobResult;
export declare function imageReferenceHyperlink(label: string, index: number, imageLinks: readonly (string | undefined)[] | undefined, renderLabel: (text: string) => string): string;
export declare function materializeImageReferenceLinks(images: readonly ImageContent[] | undefined, putBlob: ImageBlobWriter): Promise<(string | undefined)[] | undefined>;
export declare function materializeImageReferenceLinksSync(images: readonly ImageContent[] | undefined, putBlob: ImageBlobWriterSync): (string | undefined)[] | undefined;
export {};
