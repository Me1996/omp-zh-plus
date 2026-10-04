import type { DescribeContext, NativeNode } from "../native/node.js";
import type { Theme, ThemeColor } from "../theme/theme.js";
import type { Component } from "../tui.js";
import { type StatusLineOptions } from "./status-line.js";
import type { State } from "./types.js";
/** Lifecycle distinctions shared by tool call and result cards. */
export type ToolCardPhase = "pending" | "running" | "partial" | "success" | "warning" | "error" | "info";
/** Fixed card topology. Framed cards own their border; plain cards flow inline. */
export type ToolCardVariant = "framed" | "plain";
/** Lazily rendered slot content. Components retain their own width caches. */
export type ToolCardContent = readonly string[] | Component | ((width: number) => readonly string[] | Component);
/** A labeled body section in a tool card. */
export interface ToolCardSection {
    label?: string;
    content: ToolCardContent;
    separator?: boolean;
}
/** Snapshot returned by a ToolCard builder on each render. */
export interface ToolCardSnapshot {
    /** Pre-rendered header. Prefer `status` for ordinary tool lifecycle rows. */
    header?: string;
    /** Structured status header, rendered by the shared status-line primitive. */
    status?: StatusLineOptions;
    headerMeta?: string;
    phase?: ToolCardPhase;
    body?: ToolCardContent;
    sections?: readonly ToolCardSection[];
    footer?: ToolCardContent;
    applyBg?: boolean;
    contentPaddingLeft?: number;
    contentPaddingRight?: number;
    borderColor?: ThemeColor;
}
/** Width information supplied to a ToolCard's lazy snapshot builder. */
export interface ToolCardBuildContext {
    width: number;
    /** Inner width for the default one-column framed padding. */
    contentWidth: number;
    /** Compute an inner width when this snapshot opts into custom frame padding. */
    contentWidthFor(contentPaddingLeft?: number, contentPaddingRight?: number): number;
}
/** Construction options whose topology remains fixed for a card's lifetime. */
export interface ToolCardOptions {
    variant: ToolCardVariant;
    paddingX?: number;
    paddingY?: number;
    ignoreTight?: boolean;
    onInvalidate?: () => void;
    onDispose?: () => void;
}
/** Map transcript lifecycle terminology onto the output frame's visual states. */
export declare function toolCardState(phase: ToolCardPhase | undefined): State | undefined;
/**
 * Cached tool-card layout with lazy body/section/footer children. The builder
 * may read mutable streaming state at render time; unchanged snapshots retain
 * their rendered array identity through CachedOutputBlock or Text.
 */
export declare class ToolCard implements Component {
    #private;
    constructor(theme: Theme, options: ToolCardOptions, build: (context: ToolCardBuildContext) => ToolCardSnapshot);
    render(width: number): readonly string[];
    /**
     * A `card` (flat `inset` for plain cards) with the state's tone and status
     * chip, head from the header/status line, and body slots: components as
     * children, pre-rendered rows as unwrapped text, labelled sections as
     * `section`s. The builder gets the surface width as its only width.
     */
    describe(cx: DescribeContext): NativeNode;
    get debugChildren(): readonly Component[];
    get wantsKeyRelease(): boolean;
    handleInput(data: string): void;
    setIgnoreTight(ignore: boolean): void;
    invalidate(): void;
    dispose(): void;
}
/** Construct a lazy framed tool card. */
export declare function framedToolCard(theme: Theme, build: (context: ToolCardBuildContext) => ToolCardSnapshot, options?: Omit<ToolCardOptions, "variant">): ToolCard;
/** Construct a lazy inline tool card, optionally state-tinted. */
export declare function plainToolCard(theme: Theme, build: (context: ToolCardBuildContext) => ToolCardSnapshot, options?: Omit<ToolCardOptions, "variant">): ToolCard;
