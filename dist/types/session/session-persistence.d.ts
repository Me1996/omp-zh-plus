import { type BlobStore } from "./blob-store.js";
import type { FileEntry } from "./session-entries.js";
/** Detect strings damaged by an older persistence pass so loaders can migrate them safely. */
export declare function isPersistenceTruncatedString(value: unknown): value is string;
export declare function isImageBlock(value: unknown): value is {
    type: "image";
    data: string;
    mimeType?: string;
};
export declare function isImageDataPayload(value: unknown): value is {
    data: string;
    mimeType?: string;
};
/**
 * True when an image payload sits in a persistence position whose base64 is
 * externalized to the blob store instead of truncated as a generic string: a
 * `content` image block, an `images[]` entry, or a snapcompact frame under
 * `frames[]`. The eager load path uses the same position check but deliberately
 * leaves snapcompact frames as references for lazy context rebuilding.
 */
export declare function isExternalizableImagePosition(value: unknown, key: string | undefined): value is {
    data: string;
    mimeType?: string;
};
export declare function prepareEntryForPersistence(entry: FileEntry, blobStore: BlobStore): FileEntry;
