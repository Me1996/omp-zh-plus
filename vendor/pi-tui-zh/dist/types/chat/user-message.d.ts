import { type Component, Container } from "../tui.js";
import type { ImageContent } from "@oh-my-pi/pi-ai";
import type { ReactionTarget } from "./reaction.js";
import { type NativeNode, type NativeUiEvent } from "../native/node.js";
/** How a user bubble styles its prose and chips (see {@link userBubbleColor}). */
export interface UserBubbleOptions {
    /** Materialized `file://` targets per attached image, indexed by chip number. */
    imageLinks?: readonly (string | undefined)[];
    /** The message's attached images in chip order (`#1` first); a native bubble shows them. */
    images?: readonly ImageContent[];
    /** Agent-attributed input: dim, flat prose. */
    synthetic?: boolean;
    /** Delivered into the response that was streaming; marked `*` at the bubble's top-left. */
    liveSteered?: boolean;
    /** SKILL.md path for a skill chip by name; `undefined` leaves the chip unlinked. */
    skillPath?: (name: string) => string | undefined;
    /** When the message was sent (ms); shown beside the native hover toolbar. */
    timestamp?: number;
}
/**
 * Foreground styling for prose inside a user bubble: the bubble text color with the
 * magic-keyword glow, attachment chips in their composer identity color, and skill
 * chips as soft pills (linked to their SKILL.md) — each token restoring the bubble's
 * own foreground after it. Shared by {@link UserMessageComponent} and the skill
 * callout so both read as one turn.
 */
export declare function userBubbleColor(options?: UserBubbleOptions, tokenRegex?: RegExp): (value: string) => string;
/**
 * Component that renders a user message. Accepts an agent reaction badge
 * (see {@link ReactionTarget}) drawn right-aligned in the bubble's top padding row;
 * a live-steered message carries a `*` marker left-aligned in the same row.
 */
export declare class UserMessageComponent extends Container implements ReactionTarget {
    #private;
    constructor(text: string, options?: UserBubbleOptions);
    setReaction(emoji: string): void;
    /**
     * A head-less user-toned frame with the prompt as markdown under its
     * attached images (titled `#N` like their chips, opening the materialized
     * file on click): the fill says "you". A quiet toolbar (time, Copy, Rewind) fades in on hover when the
     * host handles transcript actions. The live-steering marker and the
     * agent's reaction are chips at the bottom-right, so a reaction landing
     * later updates the frame in place, even deep in scrollback.
     */
    describe(): NativeNode;
    /** Hover toolbar clicks: omp's own copy and rewind commands. */
    handleNativeEvent(event: NativeUiEvent): void;
    render(width: number): readonly string[];
}
/**
 * Collapsed placeholder for a synthetic (agent-attributed) user input in the
 * file/remote-backed transcript viewer — chiefly the advisor's `Session update`
 * replay dumps, which can each be hundreds of KiB of Markdown and, on cold open,
 * blocked the TUI for tens of seconds while every historical body was laid out
 * before the viewport clip (issue #6308).
 *
 * Collapsed by default: renders one dim summary row (label · size · line count ·
 * expand hint) and builds NO Markdown. The heavy {@link UserMessageComponent} is
 * constructed lazily only when expanded via `ctrl+o`, so blocks above the
 * viewport never pay layout cost until the reader asks to see them. The raw
 * observability data stays intact in `__advisor.jsonl`.
 */
export declare class CollapsedSyntheticMessageComponent implements Component {
    #private;
    constructor(text: string, imageLinks?: readonly (string | undefined)[]);
    /** ctrl+o toggle: reveal/hide the full Markdown body. */
    setExpanded(expanded: boolean): void;
    /**
     * A muted collapsible card whose head is the one-line summary. The
     * (potentially huge) markdown body is only described while expanded, so
     * collapsed history costs no layout on either side; a native toggle
     * expands it through {@link handleNativeEvent}.
     */
    describe(): NativeNode;
    handleNativeEvent(event: NativeUiEvent): void;
    setIgnoreTight(ignore: boolean): this;
    invalidate(): void;
    dispose(): void;
    render(width: number): readonly string[];
}
