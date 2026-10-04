/**
 * Overlay chrome for `describe()`: root cards, key-hint footers, selectable
 * lists and annotation callouts.
 *
 * The overlay frame itself (glass, ring, placement) is the terminal's: the
 * engine wraps every overlay-stack component in an `overlay` node. An overlay
 * component's root is a `card` whose `head` carries the title.
 */
import type { TspProps, TspSpan, TspText } from "@oh-my-pi/pi-wire";
import type { KeyName } from "../key-hint-format.js";
import { type Keybinding } from "../keybindings.js";
import type { NativeChild, NativeNode } from "./node.js";
/** One footer hint: the keys that trigger it and what it does. */
export interface NativeHint {
    /** Key ids (`"ctrl+o"`, `"escape"`); alternatives render side by side. */
    readonly keys: readonly KeyName[];
    readonly label: string;
}
/**
 * A hint for the primary keys of one or more keybinding actions
 * (`actionHint(["tui.select.up", "tui.select.down"], "navigate")`);
 * `undefined` when every action is unbound.
 */
export declare function actionHint(actions: Keybinding | readonly Keybinding[], label: string): NativeHint | undefined;
/**
 * A wrapping row of `kbd` keycaps with muted labels: the footer hint strip of
 * a selector. `undefined` entries (unbound actions) are skipped. Build it once
 * per hint-set change and reuse the node (memoization contract).
 */
export declare function hintsRow(hints: readonly (NativeHint | undefined)[], key?: string): NativeNode;
/** A wrapping footer: a status line (`✓ Clean`, `⚠ Cancelled`) followed by key hints. */
export declare function statusHintsRow(status: TspText, hints: readonly (NativeHint | undefined)[]): NativeNode;
/**
 * Root card of an overlay. `head` is the overlay title (whitespace runs
 * collapse; empty means no head); `role` is `omp.overlay.<name>`.
 */
export declare function overlayCard(role: string, head: TspText | undefined, children: readonly NativeChild[], props?: Omit<TspProps<"card">, "head" | "role">): NativeNode;
/** A selectable list: click selects, double-click activates. */
export declare function selectList(key: string, items: readonly NativeChild[], p: TspProps<"list">): NativeNode;
/** The index encoded in an item key built as `<prefix><index>`, or -1 when it isn't one. */
export declare function itemIndex(item: string, prefix: string): number;
/** Options of an {@link actionButton}. */
export interface ActionButtonOptions {
    /** Sibling identity key (defaults to the action id); `leafKey(event.key)` reports it back. */
    readonly key?: string;
    /** Key id of the keyboard path the button mirrors, drawn as a keycap inside it (`"r"`, `"ctrl+g"`). */
    readonly keys?: string;
    /** `accent` = the view's hero action, `error` = destructive. */
    readonly tone?: "accent" | "error";
    /** Tooltip; defaults to the label plus the keycap (`"Refresh  r"`). */
    readonly title?: string;
    /** Target of an `open` action (URL or `file://` path). */
    readonly href?: string;
}
/**
 * A native button (role `omp.btn`): a label plus an optional keycap. A click
 * sends `act` back as an `action` event (or runs a terminal-local `open`/`copy`),
 * which the component routes to the same code path as the key.
 */
export declare function actionButton(label: string, act: string, options?: ActionButtonOptions): NativeNode;
/** A row of {@link actionButton}s (role `omp.actions`); `null` entries become the spacer that end-aligns what follows. */
export declare function actionBar(buttons: readonly (NativeNode | null)[], key?: string): NativeNode;
/** Spans of an annotation callout: a dim `label:` then the note. */
export declare function noteSpans(label: string, note: string): TspSpan[];
