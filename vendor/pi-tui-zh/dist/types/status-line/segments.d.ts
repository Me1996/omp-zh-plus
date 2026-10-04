import type { StatusLineSession } from "./host.js";
import type { RenderedSegment, SegmentContext, SegmentView, StatusLineSegment, StatusLineSegmentId } from "./types.js";
export type { SegmentContext } from "./types.js";
/**
 * The thinking-effort word (`high`, `off`; `auto` until auto thinking resolves
 * a level), or undefined when the model has no thinking. Drives the native
 * model segment and the composer's effort chip.
 */
export declare function thinkingLevelWord(session: Pick<StatusLineSession, "state" | "isAutoThinking" | "autoResolvedThinkingLevel">): string | undefined;
export declare const SEGMENTS: Record<StatusLineSegmentId, StatusLineSegment>;
export declare function renderSegment(id: StatusLineSegmentId, ctx: SegmentContext): RenderedSegment;
/** Native description of one segment; null when it is hidden or unknown. */
export declare function describeSegment(id: StatusLineSegmentId, ctx: SegmentContext): SegmentView | null;
export declare const ALL_SEGMENT_IDS: StatusLineSegmentId[];
