/**
 * Tightly scoped adapter for one-shot standalone TUI prompts.
 *
 * Owns the `ProcessTerminal`/`TUI` lifecycle (mount, idempotent finish,
 * teardown) so individual pickers only declare their form field. Styling goes
 * through {@link fgOrPlain} and {@link getSelectListTheme}, both of which are
 * safe before theme initialization, so standalone paths never initialize the
 * global theme.
 */
import type { SelectItem } from "../components/select-list.js";
import { type SelectPickerOptions } from "../native/picker.js";
import { TUI, type Component, type OverlayOptions } from "../tui.js";
/** Build context for a standalone prompt: the owned UI plus its resolver. */
export interface StandaloneTuiContext<T> {
    ui: TUI;
    /** Idempotent: stops the UI and resolves the runner promise with `value`. */
    finish: (value: T) => void;
}
/** Presentation controls for a standalone prompt. */
export interface StandaloneTuiOptions {
    /** Present the component as an overlay instead of a plain child. */
    overlay?: OverlayOptions;
}
/**
 * Run a one-shot TUI component built from `{ ui, finish }` until `finish` is
 * called, then tear the UI down and resolve with the finished value.
 */
export declare function runStandaloneTui<T>(build: (context: StandaloneTuiContext<T>) => Component, options?: StandaloneTuiOptions): Promise<T>;
/** Options for a standalone single-column item picker. */
export interface StandaloneSelectOptions {
    currentValue?: string;
    maxVisible?: number;
    /** How the native picker sheet names and marks its items (`noun`, `icon`). */
    picker?: Pick<SelectPickerOptions, "noun" | "icon" | "subtitle" | "confirm">;
}
/**
 * Show a single-column item picker and resolve with the chosen item's value,
 * or `null` if the user cancelled.
 */
export declare function selectStandaloneItem(title: string, items: SelectItem[], options?: StandaloneSelectOptions): Promise<string | null>;
/**
 * Show a one-shot text prompt and resolve with the trimmed input, or `null`
 * when cancelled or left empty.
 */
export declare function promptStandaloneText(title: string): Promise<string | null>;
