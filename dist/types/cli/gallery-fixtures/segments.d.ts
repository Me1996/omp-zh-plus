import type { StatusLineSegmentId } from "@oh-my-pi/pi-tui-zh/status-line/schema";
import type { SegmentContext } from "@oh-my-pi/pi-tui-zh/status-line/types";
import type { GallerySessionOptions } from "./preview-session.js";
import type { GalleryPreviewEntry } from "./types.js";
/** Production status-segment registry in display order. */
export declare function getSegmentGalleryInventory(): readonly StatusLineSegmentId[];
/** Deterministic full context for isolated status-segment previews and tests. */
export declare function createGallerySegmentContext(sessionOptions?: GallerySessionOptions): SegmentContext;
/** Every registered segment rendered directly through its production implementation. */
export declare function getSegmentGalleryEntries(): readonly GalleryPreviewEntry[];
