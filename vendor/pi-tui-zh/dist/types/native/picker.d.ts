/**
 * Builders for the data-first `picker` kind (Stencil repo,
 * `crates/tern/NATIVE_REDESIGN.md` §4): the model hub, session selector,
 * rewind, tree, copy, history search and the small selectors send their data
 * and Tern draws the sheet (head, scopes, tabs, fact columns, rows, preview,
 * action bar).
 *
 * A picker is its own sheet: the component returns `nativeSheet(cx)` true
 * (usually `cx.supports("picker")`) so the backend puts it directly in
 * `layer`, and `describe()` returns {@link picker}. When the terminal lacks
 * the kind, components keep describing their generic composition.
 *
 * Keys stay the program's: a search field is an {@link Input} (every editor
 * text binding works), sent through {@link pickerQuery} with its caret.
 * Pointer events arrive as `select`/`activate` with
 * the item id and `action` with an action id (plus `value` for
 * `scope`/`tab`/`strip`). {@link pickerEvent} folds them into one shape.
 */
import type { TspPickerAction, TspPickerItem, TspPickerProps } from "@oh-my-pi/pi-wire";
import type { KeyName } from "../key-hint-format.js";
import { type Keybinding } from "../keybindings.js";
import type { Input } from "../components/input.js";
import type { SelectItem, SelectList } from "../components/select-list.js";
import type { NativeChild, NativeNode, NativeUiEvent } from "./node.js";
/** The picker sheet; `preview` children fill its preview pane. */
export declare function picker(p: TspPickerProps, preview?: readonly NativeChild[]): NativeNode;
/**
 * A picker's search field from the {@link Input} that edits it: the text and
 * its caret. `null` hides the field. Memoized pickers MUST key on the caret
 * too, or motion keys (word jumps, line start) never reach the screen.
 */
export declare function pickerQuery(input: Input | null): Pick<TspPickerProps, "query" | "cursor">;
/** Key of the picker child a dock/editor-mounted selector describes; its events arrive at this keypath. */
export declare const PICKER_KEY = "picker";
/**
 * The root a selector mounted in the editor slot describes: a column holding
 * the picker as child {@link PICKER_KEY}, which the reconciler hoists into
 * `layer`. Route its events with `pickerEvent(event, PICKER_KEY)`.
 */
export declare function dockedPicker(p: TspPickerProps, preview?: readonly NativeChild[]): NativeNode;
/** Keycap names for one key id (`"alt+enter"` → `["alt", "enter"]`, `"escape"` → `["esc"]`). */
export declare function pickerKeys(key: KeyName | string): string[];
/** The keycaps of a keybinding's primary key, empty when unbound. */
export declare function bindingKeys(binding: Keybinding): string[];
/** An action-bar button; `keys` is a key id (`"alt+enter"`), a keybinding's keycaps, or none. */
export declare function pickerAction(id: string, label: string, keys?: KeyName | string | readonly string[], opts?: Omit<TspPickerAction, "id" | "label" | "keys">): TspPickerAction;
/** The right-aligned `Close esc` every picker ends with; Tern's backdrop and head `esc` send it too. */
export declare const CLOSE_ACTION: TspPickerAction;
/** A `time` fact: the compact age of `at` (`now`, `5m`, `2h`, `3d`, `2w`, `6mo`, `1y`). */
export declare function pickerAge(at: Date | number, now?: number): string;
/**
 * Search `hits` for a label: disjoint, ordered UTF-16 ranges of every
 * case-insensitive occurrence of any of the (lowercase) `tokens`.
 */
export declare function pickerHits(label: string, tokens: readonly string[]): [number, number][];
/** The absolute local time behind a `time` fact, for its tooltip (`28 Sep 2026, 18:02`). */
export declare function pickerDate(at: Date | number): string;
/** A picker pointer event, folded: which item, or which action with its value. */
export type PickerEvent = {
    readonly kind: "select" | "activate";
    readonly item: string;
} | {
    readonly kind: "action";
    readonly act: string;
    readonly value: string | undefined;
};
/**
 * The picker event `event` carries, or undefined when it is not for the
 * picker at keypath `key`: `""` for a root picker, else the picker child's
 * key (a hoisted child's keypath carries a `^` marker, ignored here).
 */
export declare function pickerEvent(event: NativeUiEvent, key?: string): PickerEvent | undefined;
/**
 * {@link pickerHits} for fuzzy-filtered lists: each whitespace token of
 * `query` marks its first case-insensitive substring, else its characters as
 * a greedy in-order subsequence (the fuzzy matcher's shape). Undefined when
 * nothing matches.
 */
export declare function pickerFuzzyHits(label: string, query: string): [number, number][] | undefined;
/** The `md` sheet a short {@link SelectList} selector becomes (thinking level, hook options, queue mode, …). */
export interface SelectPickerOptions {
    readonly title: string;
    readonly subtitle?: string;
    readonly icon?: string;
    readonly noun?: string;
    /** Show omp's filter text as the search field (lists that filter as you type). */
    readonly searchable?: boolean;
    /** Per-item extras (a thinking-level dot, a swatch mark, a budget fact). */
    readonly decorate?: (item: SelectItem) => Partial<Omit<TspPickerItem, "id">> | undefined;
    readonly columns?: TspPickerProps["columns"];
    /** Values in use now (the current theme, the current level). */
    readonly current?: readonly string[];
    /** The primary action's label (`Apply`, `Select`). */
    readonly confirm?: string;
}
/**
 * Picker props for a {@link SelectList}: its filtered items in order, the
 * selection, the pending-confirmation strip, and `Select ⏎` / `Close esc`.
 * Memoize on {@link SelectList.pickerView}'s parts: the builder allocates.
 */
export declare function selectListPicker(list: SelectList, o: SelectPickerOptions): TspPickerProps;
/**
 * Routes a picker event to a {@link SelectList}: a row click selects (and
 * previews, through `onSelectionChange`), a second click or `confirm`
 * activates, `close`/`cancel` cancels. Returns whether it handled the event.
 */
export declare function routeSelectListPicker(list: SelectList, event: NativeUiEvent, key?: string): boolean;
/**
 * A {@link SelectList} described as a picker, memoized: the node is rebuilt
 * only when the list's filtered items, selection, pending confirmation or
 * query change (or {@link invalidate} is called after `options` inputs move).
 */
export declare class SelectListSheet {
    #private;
    readonly list: SelectList;
    constructor(list: SelectList, options: SelectPickerOptions | (() => SelectPickerOptions), { docked }?: {
        docked?: boolean;
    });
    /** Drop the memo (decorations or options changed outside the list). */
    invalidate(): void;
    describe(): NativeNode;
    /** Route a picker event onto the list; see {@link routeSelectListPicker}. */
    handle(event: NativeUiEvent): boolean;
}
