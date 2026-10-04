import type { Component } from "../../tui.js";
import { type ScrollRangeAnchor } from "../../components/scroll-view.js";
/** One complete debug-viewer frame. */
export interface DebugViewerFrameContent {
    readonly header: readonly string[];
    readonly body: {
        readonly lines: readonly string[];
        readonly anchor?: ScrollRangeAnchor;
    };
    readonly footer: readonly string[];
}
/** Dimensions supplied while a debug viewer prepares its domain rows. */
export interface DebugViewerFrameContext {
    /** Panel content width with one column reserved for an overflowing viewport's scrollbar. */
    readonly contentWidth: number;
    readonly bodyHeight: number;
}
export interface DebugViewerFrameOptions {
    readonly title: string;
    readonly getHeight: () => number;
    readonly headerRows: number;
    readonly footerRows: number;
    readonly frame: (context: DebugViewerFrameContext) => DebugViewerFrameContent;
    readonly minimumBodyRows?: number;
    readonly followTail?: boolean;
}
/**
 * Debug-local adapter for the fullscreen viewers' common rounded panel and viewport.
 * Domain controllers retain filtering, selection, formatting, copy, and live data;
 * this component owns chrome sizing, persistent scroll state, selection reveal, and
 * frame-row to logical-body translation.
 */
export declare class DebugViewerFrame implements Component {
    #private;
    constructor(options: DebugViewerFrameOptions);
    get debugChildren(): readonly Component[];
    getBodyHeight(): number;
    isFollowingTail(): boolean;
    setFollowTail(follow: boolean): void;
    /** Manual viewport movement suspends append-follow, including at the current tail. */
    scroll(delta: number): void;
    setScrollOffset(offset: number): void;
    /** Whether a 0-based rendered frame row lies inside the last rendered body region. */
    isBodyFrameRow(frameRow: number): boolean;
    /** Map a 0-based rendered frame row into the complete logical body buffer. */
    toBodyRow(frameRow: number): number | undefined;
    /** Map a 0-based rendered frame row into the fixed header region. */
    toHeaderRow(frameRow: number): number | undefined;
    invalidate(): void;
    dispose(): void;
    render(width: number): readonly string[];
}
