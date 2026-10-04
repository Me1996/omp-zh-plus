import type { TspText } from "@oh-my-pi/pi-wire";
import type { NativeChild, NativeNode } from "../native/node.js";
/** A scope row shared by fullscreen hubs, with hub-specific kinds and metadata. */
export interface SidebarEntry<TKind extends string> {
    id: string;
    kind: TKind;
    label: string;
    annotation?: string;
}
/** A pre-styled footer choice carrying a hub-specific action. */
export interface StripChip<TAction> {
    label: string;
    styled: string;
    action: TAction;
}
/** Shared selection state for a hub's chip-bearing strip variants. */
export interface StripState<TChip extends StripChip<unknown>> {
    chips: TChip[];
    index: number;
}
/** A chip hit range in frame-relative columns. */
export interface ChipRange {
    start: number;
    end: number;
    index: number;
}
/** Hub-specific sidebar decoration, independent of viewport and row layout. */
export interface SidebarStyle {
    icon: string;
    annotation: string;
    muted?: boolean;
    hovered?: boolean;
    padTruncated?: boolean;
}
/** Cycle a strip's selection for directional and tab input, returning whether it handled the key. */
export declare function moveStripSelection(strip: StripState<StripChip<unknown>>, data: string): boolean;
/**
 * Native sidebar: a `list` whose `item`s are keyed by entry id (the `item` of
 * `select`/`activate` events), separators as `rule`s. Scrolling and clipping
 * are the terminal's; `style` supplies icon, annotation and muting.
 */
export declare function describeHubSidebar<TEntry extends SidebarEntry<string>>(entries: readonly TEntry[], selectedId: string, style: (entry: TEntry, index: number) => Pick<SidebarStyle, "icon" | "annotation" | "muted">, key?: string): NativeNode;
/**
 * Native footer chip strip: a `tabs` node whose tab ids are the chip indices
 * (`select` events carry the index as `item`), with an optional prefix label.
 */
export declare function describeHubChips(strip: StripState<StripChip<unknown>>, prefix?: TspText, key?: string): NativeNode;
/**
 * Native fullscreen hub: a root card titled `title` over a sidebar/body row and
 * a footer. The split geometry, ring and dividers are the terminal's.
 */
export declare function describeHubFrame(role: string, title: TspText, sidebar: NativeChild, body: NativeChild, footer: NativeChild): NativeNode;
/** Persistent fullscreen split frame, sidebar viewport, and footer chip renderer. */
export declare class HubFrame {
    #private;
    /** Current sidebar viewport offset, shared with the hub's navigation. */
    sidebarScroll: number;
    /** Chip hit ranges from the last footer render. */
    chipRanges: ChipRange[];
    /** Compose hub-specific sidebar and body renderers into a persistent frame. */
    constructor(title: string, sidebarBounds: {
        min: number;
        max: number;
    }, renderSidebar: (width: number, rows: number) => string[], renderBody: (width: number, height: number | undefined) => readonly string[], options?: {
        bodyMinWidth?: number;
        preserveSidebar?: boolean;
    });
    /** Invalidate the composed layout. */
    invalidate(): void;
    /** Measure labels and annotations within this hub's sidebar width bounds. */
    sidebarWidth(entries: readonly SidebarEntry<string>[]): number;
    /** Pan the sidebar within the current viewport's bounds. */
    scrollSidebar(delta: number, rows: number, entryCount: number): void;
    /** Select a footer chip at a frame-relative column, if one was painted there. */
    selectChipAt(strip: StripState<StripChip<unknown>>, col: number): boolean;
    /** Render the sidebar viewport while retaining each hub's follow and clipping policy. */
    renderSidebar<TEntry extends SidebarEntry<string>>(entries: readonly TEntry[], width: number, rows: number, selection: {
        id: string;
        focused: boolean;
        follow: boolean;
        clamp: boolean;
    }, style: (entry: TEntry, index: number) => SidebarStyle): string[];
    /** Render footer hints or a hub-specific strip, resetting stale mouse ranges. */
    renderFooter(width: number, hint: string, renderStrip?: () => string): string;
    /** Render footer chips from a hub-selected horizontal window and record their hit ranges. */
    renderChips(width: number, prefix: string, strip: StripState<StripChip<unknown>>, start?: number): string;
    /** Translate a mouse position into footer, sidebar, and body coordinates. */
    locate(row: number, col: number): {
        footerColumn: number | undefined;
        bodyHeight: number;
        contentLine: number;
        overSidebar: boolean;
        overBody: boolean;
        bodyLine: number;
    };
    /** Paint a complete fullscreen hub with its title, width bounds, and contextual footer. */
    render(width: number, height: number, entries: readonly SidebarEntry<string>[], footer: string): readonly string[];
}
