/**
 * Shared engine for the ephemeral fullscreen transcript selectors (esc-esc
 * rewind, `/copy`): replay session entries through {@link ChatTranscriptBuilder},
 * map each rendered turn to a selectable target, and compose gutter-prefixed
 * columns with a dotted outline around the selected target.
 */
import { type Component } from "../tui.js";
import { type TranscriptEntryLike as TranscriptEntry } from "./transcript-entry.js";
import type { SessionMessageEntryLike as SessionMessageEntry } from "./transcript-entry.js";
import { type ThemeColor } from "../theme/index.js";
import type { ChatTranscriptBuilder } from "./chat-transcript-builder.js";
/** One selectable transcript item: a message entry plus its rendered block range. */
export interface OutlineTarget {
    /** Entry the selection resolves to; extended over trailing componentless tool results. */
    entryId: string;
    /** Entry that opened this turn (pre-fold) — anchor for tree lookups. */
    turnId: string;
    /** Real user prompt — drives user-turn jumps and role-specific actions. */
    isUserTurn: boolean;
    /** First transcript-container child rendered by this entry. */
    start: number;
    /** One past the last child rendered by this entry. */
    end: number;
    /** Entries this target spans: the turn plus any folded tool results. */
    entries: TranscriptEntry[];
}
/** Composed rows of one column plus the outline's line range within them. */
export interface ComposedColumn {
    lines: string[];
    selStart: number;
    selEnd: number;
}
/** Presentation of the dotted outline: stroke color and an optional caption inset into the top rule. */
export interface OutlineStyle {
    color?: ThemeColor;
    /** Short affordance label (e.g. "3 blocks →") drawn into the top rule's right end. */
    caption?: string;
}
/** Copy-on-write removal of OSC 133 spans from a rendered row array. */
export declare function stripPromptZones(rows: readonly string[]): readonly string[];
/**
 * Prompt-zone-stripped rows for one selector column.
 *
 * The selectors recompose their whole column on every keystroke, and stripping
 * every child's rows again per frame is pure waste on a long session. Per the
 * {@link Component} render contract a child returns the same array while its
 * rows are unchanged, so the stripped copy is keyed on that array: a child that
 * repaints itself asynchronously (Kitty image conversion, todo strike frames)
 * hands back a new array and is stripped again.
 */
export declare class OutlineRowCache {
    #private;
    rows(children: readonly Component[], width: number): Array<readonly string[]>;
}
/**
 * Append `entries` to `builder`, returning the selectable targets they
 * produce. Tool results fold into the previous target (so a turn's rewind
 * and `/copy` keep its output, including lazily created children such as
 * the grouped-read card); notices and hidden messages that render nothing
 * are skipped. Usage rows flushed at the head of an append are attributed
 * to the turn above.
 */
export declare function appendOutlineEntries(builder: ChatTranscriptBuilder, entries: TranscriptEntry[]): OutlineTarget[];
/** Per-target "renders at least one non-blank row" flags at the given rows. */
export declare function outlineVisibility(childRows: readonly (readonly string[])[], targets: readonly OutlineTarget[]): boolean[];
/** Dotted horizontal rule with rounded corners, spanning the outline width. */
export declare function outlineRule(left: string, right: string, innerWidth: number, color?: ThemeColor, caption?: string): string;
/** Wrap pre-rendered rows in the dotted outline (rules above/below, `┆` sides). */
export declare function outlineRows(rows: readonly string[], innerWidth: number, style?: OutlineStyle): string[];
/**
 * Compose one column: gutter-prefixed rows for `childRows[from, to)` with a
 * dotted outline around `targets[selected]`. `header` rows, when given, lead
 * the column.
 */
export declare function composeOutlineColumn(childRows: readonly (readonly string[])[], from: number, to: number, targets: readonly OutlineTarget[], selected: number, columnWidth: number, header: string[] | undefined, style?: OutlineStyle): ComposedColumn;
/** Centered position rail for horizontally windowed content: `… ○ ◉ ○ …`. */
export declare function positionRail(count: number, active: number, moreLeft: boolean, moreRight: boolean, width: number): string;
/**
 * A turn the user can rewind past and re-edit: a user message with prompt
 * text, or a user-initiated custom message (skill / collab prompt).
 */
export declare function isUserTurnEntry(entry: TranscriptEntry): boolean;
/** Single-line label for a user turn: its prompt text, or the custom message's draft. */
export declare function userTurnLabel(entry: TranscriptEntry): string | undefined;
/** Whether a user message carries prompt text (string or text blocks). */
export declare function userMessageHasText(message: SessionMessageEntry["message"]): boolean;
