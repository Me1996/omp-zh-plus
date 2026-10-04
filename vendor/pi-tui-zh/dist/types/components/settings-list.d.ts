import type { SgrMouseEvent } from "../mouse.js";
import type { TspPrefsControl, TspPrefsRow, TspPrefsSection } from "@oh-my-pi/pi-wire";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
import type { Component } from "../tui.js";
import { FormField, type FormFieldOptions, type FormFieldTheme } from "./form.js";
export interface SettingItem {
    /** Unique identifier for this setting */
    id: string;
    /** Display label (left side) */
    label: string;
    /** Optional description shown when selected */
    description?: string;
    /** Optional risk note shown in warning styling above the description, with a glyph on the row. */
    warning?: string;
    /** Current value to display (right side) */
    currentValue: string;
    /** If provided, Enter/Space cycles through these values */
    values?: string[];
    /** If provided, Enter opens this submenu. Receives current value and done callback. */
    submenu?: (currentValue: string, done: (selectedValue?: string) => void) => Component;
    /** True when the displayed setting differs from its default value. */
    changed?: boolean;
    /** The default, as a native settings page names it in the changed dot's title. */
    defaultLabel?: string;
    /** Render as a non-interactive section heading. Skipped by navigation and search. */
    heading?: boolean;
}
/** A row's open editor as a native settings page shows it (`TspPrefsProps.editing`). */
export interface PrefsEditing {
    row: string;
    draft?: string;
    cursor?: number;
    option?: string;
}
/** A submenu that reports the option it highlights (multiselect toggles) to a native settings page. */
export interface PrefsOptionSource {
    readonly prefsOption: string | undefined;
}
/** Where a setting row goes on a native settings page: its section and, for search results, its page. */
export interface PrefsSectionRef {
    id: string;
    title: string;
    page?: string;
}
/** The section id for a section title (`"Status Line"` → `"status-line"`). */
export declare function prefsSectionId(title: string): string;
/** A setting as a native settings row, given its typed control; `undefined` for headings. */
export declare function settingPrefsRow(item: SettingItem, control: TspPrefsControl): TspPrefsRow | undefined;
export interface SettingsListTheme {
    label: (text: string, selected: boolean, changed: boolean) => string;
    value: (text: string, selected: boolean, changed: boolean) => string;
    description: (text: string) => string;
    /** Style for risk notes and the row warning glyph. Falls back to `description` when omitted. */
    warning?: (text: string) => string;
    /** Glyph marking rows that carry a `warning`. Omitted hides the row marker. */
    warningMark?: string;
    cursor: string;
    hint: (text: string) => string;
    /** Style for section heading rows (dimmed when outside the active section). Falls back to `hint` when omitted. */
    heading?: (text: string, dimmed: boolean) => string;
    /** Style for sidebar section names in the split layout. Falls back to label/hint. */
    section?: (text: string, active: boolean) => string;
    /** Hover band applied to the full row under the mouse pointer. */
    hovered?: (text: string) => string;
}
/** Optional behavior overrides for {@link SettingsList}. */
export interface SettingsListOptions {
    /**
     * "auto" (default) renders the section sidebar layout when headings exist
     * and the width allows; "flat" always renders inline heading rows.
     */
    layout?: "auto" | "flat";
    /**
     * When false, printable input is ignored (no internal type-to-filter) and
     * the search status line is never rendered. Use when a parent component
     * owns the query. Default true.
     */
    typeToSearch?: boolean;
    /** Text shown when the list has no items at all. */
    emptyText?: string;
    /**
     * Footer hint line (hint-styled, replaces the default navigation hint).
     * An empty string removes the hint row and its leading blank entirely —
     * use when the host renders its own footer.
     */
    hint?: string;
    /** Fixed split-sidebar width (columns incl. indent+gap); default derives from section names. */
    sidebarWidth?: number;
}
/** Searchable text for a setting item: label, id, value, description, warning, and cycle values. */
export declare function getSettingItemFilterText(item: SettingItem): string;
export declare class SettingsList implements Component {
    #private;
    /** Fired when the selected item changes (navigation, filtering, or setItems). */
    onSelectionChange?: (item: SettingItem | undefined) => void;
    constructor(items: SettingItem[], maxVisible: number, theme: SettingsListTheme, onChange: (id: string, newValue: string) => void, onCancel: () => void, options?: SettingsListOptions);
    /** Return item, selection, filter, and submenu state for debug inspection. */
    debugState(): Record<string, unknown>;
    /** Expose the active submenu to the debug tree walker. */
    get debugChildren(): readonly Component[];
    /** The currently selected item, or undefined when empty or on a heading. */
    getSelectedItem(): SettingItem | undefined;
    /** Move selection to the item with `id`. Returns false when it is not visible. */
    selectItem(id: string): boolean;
    /** True while keyboard focus is on the section headings instead of the setting rows. */
    get sectionFocused(): boolean;
    /** Whether section focus has anywhere to go: 2+ derived sections in the current view. */
    hasSectionFocusTargets(): boolean;
    /**
     * Toggle keyboard focus between section headings and setting rows. While
     * focused, Up/Down jump whole sections and Enter/Esc return to the rows.
     * Engages only when {@link hasSectionFocusTargets}; returns the new state.
     */
    toggleSectionFocus(): boolean;
    /** True while an item submenu owns input. */
    hasOpenSubmenu(): boolean;
    /** The open submenu and the row that opened it, if any. */
    get openSubmenu(): {
        id: string;
        component: Component;
    } | undefined;
    /**
     * The visible settings as native page sections: rows in list order, each
     * in the section `sectionOf` (given the row and the heading above it) names,
     * sections in order of their first row (ranked search results gather
     * under their section). Rows `control` has no typed control for are left
     * out.
     */
    prefsSections(sectionOf: (item: SettingItem, heading: SettingItem | undefined) => PrefsSectionRef, control: (item: SettingItem) => TspPrefsControl | undefined): TspPrefsSection[];
    /** The row with keyboard focus, or while the section rail has focus the focused section's heading label. */
    prefsFocus(): {
        row?: string;
        section?: string;
    };
    /**
     * The open editor as a native page draws it: a choice's highlighted option
     * (when `inlineMenu(id)` says the row's choices fit its popup menu), a text
     * field's draft and cursor (dots when masked), a multiselect's highlighted
     * option; `null` when nothing is open or the editor has no native control
     * (the host shows that one itself).
     */
    prefsEditing(inlineMenu: (id: string) => boolean): PrefsEditing | null;
    /** Applies `value` to a cycling (boolean/enum) row the way Enter does: the row shows it and `onChange` runs. */
    applyValue(id: string, value: string): void;
    /** Opens row `id`'s submenu the way Enter does (leaving one already open for it); returns it. */
    openSubmenuFor(id: string): Component | undefined;
    /** Resize the visible viewport (fullscreen hosts call this every render). */
    setMaxVisible(rows: number): void;
    /** Move the selection one step for a wheel notch. */
    handleWheel(delta: -1 | 1): void;
    /** Move the selection one step for a wheel notch if the pointer is within the settings pane. */
    handleWheelAt(delta: -1 | 1, _line: number, col: number): boolean;
    /** Highlight the item under the pointer (null clears). */
    setHoverItem(id: string | null): void;
    /**
     * Resolve a pointer position against the last rendered frame. `line` is the
     * 0-based content-line index within this component's render output, `col`
     * the 0-based column. Sidebar rows resolve to the section's first item.
     */
    hitTest(line: number, col: number): string | undefined;
    /**
     * Like {@link hitTest}, but only rows the pointer is visually on: sidebar
     * jump targets are excluded so hovering section names does not light up
     * pane rows.
     */
    hoverTest(line: number, col: number): string | undefined;
    /**
     * Route a mouse event into an open submenu (coordinates are local to this
     * list's rendered lines). Returns false when no submenu is open; submenus
     * that do not implement {@link MouseRoutable} consume the event silently.
     */
    routeSubmenuMouse(event: SgrMouseEvent, line: number, col: number): boolean;
    getSearchQuery(): string;
    hasSearchQuery(): boolean;
    clearSearch(): void;
    /** Update an item's currentValue */
    updateValue(id: string, newValue: string): void;
    /**
     * Replace the entire items array. Selection is preserved by item id when
     * the previous selection still survives the active filter, otherwise
     * clamped to the last filtered item (or 0 if there are no matches).
     * An open submenu is left untouched — its lifetime is bounded by its own
     * done callback, and `#closeSubmenu` re-resolves the restored item on exit.
     */
    setItems(items: SettingItem[]): void;
    invalidate(): void;
    render(width: number): readonly string[];
    /**
     * A `list` of setting `item`s (label, current value on the right, risk note
     * and description as detail; headings as disabled items) keyed by setting id,
     * with the selection and search query, plus the footer hint. An open submenu
     * replaces the list and describes itself.
     */
    describe(_cx: DescribeContext): NativeNode;
    /**
     * Pointer actions do what a click does in the settings hosts: `select` moves
     * the selection to the row, or activates it (Enter) when it already is the
     * selection; `activate` selects and activates.
     */
    handleNativeEvent(event: NativeUiEvent): void;
    handleInput(data: string): void;
}
/** Construction options for a SettingsList composed as a form field. */
export interface SettingsFormFieldOptions extends Omit<FormFieldOptions, "theme"> {
    items: SettingItem[];
    maxVisible: number;
    settingsTheme: SettingsListTheme;
    fieldTheme: FormFieldTheme;
    onChange(id: string, newValue: string): void;
    onCancel(): void;
    listOptions?: SettingsListOptions;
}
/**
 * SettingsList adapter for detail forms. It retains the canonical list
 * implementation while sharing FormField label, description, hint, focus, and
 * input dispatch with text and selection fields.
 */
export declare class SettingsFormField extends FormField {
    readonly settingsList: SettingsList;
    constructor(options: SettingsFormFieldOptions);
}
