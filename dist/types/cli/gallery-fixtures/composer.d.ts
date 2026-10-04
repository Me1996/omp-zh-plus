import type { GalleryPreviewEntry } from "./types.js";
/** Production composer registry in selector order. */
export declare function getComposerGalleryInventory(): readonly string[];
/** Every registered composer style, rendered through the production preview. */
export declare function getComposerGalleryEntries(): readonly GalleryPreviewEntry[];
