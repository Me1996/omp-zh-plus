/**
 * Shared rendering for extension/hook custom message frames.
 *
 * `CustomMessageComponent` and `HookMessageComponent` share one behavior-owning
 * frame: it tries a user-supplied renderer first and falls back to a label plus
 * markdown body when the renderer returns nothing or throws. Hook messages
 * collapse to the first N lines when not expanded; extension messages render
 * in full.
 */
import type { TextContent } from "@oh-my-pi/pi-ai";
import { type Component, Container } from "../tui.js";
import { type Theme, type ThemeColor } from "../theme/index.js";
import { type NativeNode, type NativeUiEvent } from "../native/node.js";
/** Message shape consumed by the shared frame. */
export interface FramedMessage {
    customType: string;
    content: string | (TextContent | {
        type: string;
    })[];
}
/**
 * Callable signature shared by `MessageRenderer` (extensions) and
 * `HookMessageRenderer` (hooks). Both narrow `message` to their own type;
 * this signature is the structural intersection callers can hand off here.
 */
export type FramedRenderer<M extends FramedMessage> = (message: M, options: {
    expanded: boolean;
}, theme: Theme) => Component | undefined;
/** Presentation and extension-renderer policy for a framed custom message. */
export interface FramedMessageOptions<M extends FramedMessage> {
    readonly message: M;
    /** Theme-aware icon glyph shown before the custom type. */
    readonly icon?: string | (() => string);
    /** Hide the default type header while retaining the message body. */
    readonly hideHeader?: boolean | (() => boolean);
    /** Semantic color for the outline, defaulting to the muted border. */
    readonly borderColor?: ThemeColor;
    /** Collapse the markdown body to this many lines when `expanded` is false. Omit to never collapse. */
    readonly collapseAfterLines?: number;
    readonly customRenderer?: FramedRenderer<M>;
    /** Semantic role of the native card. */
    readonly role: string;
}
/**
 * Behavior-owning custom message frame. It retries extension renderers whenever
 * expansion or theme state changes and falls back to the shared card when a
 * renderer returns nothing or throws.
 */
export declare class FramedMessageComponent<M extends FramedMessage> extends Container {
    #private;
    constructor(options: FramedMessageOptions<M>);
    setExpanded(expanded: boolean): void;
    invalidate(): void;
    dispose(): void;
    /**
     * The extension renderer's component when it supplied one; otherwise a
     * card with the type tag as its head and the markdown body, clamped by the
     * terminal while collapsed.
     */
    describe(): NativeNode;
    handleNativeEvent(event: NativeUiEvent): void;
}
