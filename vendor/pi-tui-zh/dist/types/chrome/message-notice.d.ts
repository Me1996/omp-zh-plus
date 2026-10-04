import type { TspPreview, TspText } from "@oh-my-pi/pi-wire";
import { type Component, Container } from "../tui.js";
import { type ThemeColor } from "../theme/index.js";
import { type NativeChild, type NativeNode, type NativeUiEvent } from "../native/node.js";
/** Render-time state supplied to a notice presentation. */
export interface MessageNoticeContext {
    readonly expanded: boolean;
}
/** Header and optional detail rows rendered inside a notice box. */
export interface MessageNoticePresentation {
    readonly header: string;
    readonly icon?: string;
    readonly body?: Component | readonly Component[];
}
/** Semantic notice content for native terminals: the card head and body, never pre-styled rows. */
export interface MessageNoticeNativePresentation {
    readonly head: TspText;
    readonly body?: readonly NativeChild[];
    /** Body clamp while collapsed; set to make the notice collapsible. */
    readonly preview?: TspPreview;
    /**
     * Draw as an inline notice (a named icon and one line, the body a
     * disclosure below it) instead of a toned card.
     */
    readonly inline?: {
        readonly icon: string;
    };
}
/** Presentation policy for a transcript notice. */
export interface MessageNoticeOptions {
    readonly presentation: (context: MessageNoticeContext) => MessageNoticePresentation;
    /** Card content for native terminals; the full content, since collapse is the terminal's. */
    readonly nativePresentation: () => MessageNoticeNativePresentation;
    /** Semantic role of the native card (`omp.notice.<name>`). */
    readonly role: string;
    readonly severity?: ThemeColor;
    readonly background?: (text: string) => string;
    readonly leadingSpace?: boolean;
}
/**
 * Shared transcript notice shell with expansion and tool-activity visibility.
 * Domain controllers own their state and call {@link refresh} after mutations.
 */
export declare class MessageNoticeComponent extends Container {
    #private;
    constructor(options: MessageNoticeOptions);
    setExpanded(expanded: boolean): void;
    isExpanded(): boolean;
    setToolActivityVisible(visible: boolean): void;
    /** Rebuild the presentation after controller-owned state changes. */
    refresh(): void;
    invalidate(): void;
    dispose(): void;
    render(width: number): readonly string[];
    /** A severity-toned card; collapse is local to the terminal and mirrored through {@link handleNativeEvent}. */
    describe(): NativeNode;
    handleNativeEvent(event: NativeUiEvent): void;
}
