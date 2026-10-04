import type { Model } from "@oh-my-pi/pi-ai";
import type { ModelKind } from "@oh-my-pi/pi-catalog/types";
import type { Component } from "../tui.js";
import type { SgrMouseEvent } from "../mouse.js";
import { type ConfiguredThinkingLevel } from "../thinking.js";
import { type ThemeColor } from "../theme/theme.js";
import type { TspPickerColumn, TspPickerGroup, TspPickerItem } from "@oh-my-pi/pi-wire";
import type { NativeChild, NativeNode, NativeUiEvent } from "../native/node.js";
/** Canonical display ordering of built-in model roles. */
export type ModelRole = "default" | "smol" | "slow" | "vision" | "plan" | "commit" | "tiny" | "memory" | "task" | "advisor" | "image" | "web" | "speech" | "dictation" | "judge";
export declare const MODEL_ROLE_IDS: ModelRole[];
export declare const CHAT_MODEL_ROLE_IDS: ModelRole[];
export declare const KIND_ROLE_IDS: ModelRole[];
/** Measured model performance shown in browser rows. */
export interface ModelBrowserPerf {
    samples: number;
    tps: number;
    ttftMs: number | null;
}
/** Role metadata shown in model selectors. */
export interface ModelBrowserRoleInfo {
    tag?: string;
    name: string;
    color?: ThemeColor;
    hidden?: boolean;
    section: "chat" | "kind";
    accepts(model: Model): boolean;
}
/** Role lookup used for scoped model resolution. */
export interface ModelRoleLookup {
    getModelRole(role: string): string | undefined;
}
/** Resolved selector metadata required by model overlays. */
export interface ResolvedModelRoleValue {
    model: Model | undefined;
    thinkingLevel?: ConfiguredThinkingLevel;
    explicitThinkingLevel: boolean;
    warning?: string;
}
/** Host-provided preferences and model-role resolution for the browser. */
export interface ModelBrowserSource extends ModelRoleLookup {
    /**
     * Changes whenever any preference this source reads or resolves against changes,
     * except the storage-backed `mruOrder` and `modelPerf`. Keys derived-scope caches.
     */
    readonly revision: number;
    readonly defaultThinkingLevel: string;
    readonly modelProviderOrder: readonly string[];
    readonly knownRoleIds: readonly string[];
    readonly mruOrder: readonly string[];
    readonly modelPerf: ReadonlyMap<string, ModelBrowserPerf>;
    getRoleInfo(role: string): ModelBrowserRoleInfo;
    defaultRoleChain(role: string): string[];
    resolveRoleValue(value: string | undefined, models: Model[], roleLookup?: ModelRoleLookup): ResolvedModelRoleValue;
}
/** Read-only catalog surface consumed by model browsers. */
export interface ModelBrowserRegistry {
    getError(): unknown;
    getAvailable(kind?: ModelKind | "all"): Model[];
    getAll(kind?: ModelKind | "all"): Model[];
}
/** One selectable row. `selector` is a canonical model key or host-specific virtual key. */
export interface ModelBrowserItem {
    provider: string;
    id: string;
    model: Model;
    selector: string;
    /** Optional foreground color for the row label. */
    labelColor?: ThemeColor;
}
/** Resolved role assignment as displayed by the browser and the hub. */
export interface RoleAssignment {
    model: Model;
    thinkingLevel: ConfiguredThinkingLevel;
    /** True when the role has no configured value and fell back to auto-selection. */
    autoSelected: boolean;
}
/** Map of role id to its resolved assignment (absent roles are unresolved). */
export type RoleAssignments = Record<string, RoleAssignment | undefined>;
/**
 * Resolve every known role to its display assignment: configured role values
 * resolve against `allModels`; unconfigured roles fall back to auto-selection
 * over `autoCandidates` (skipped when empty). Shared by the /models hub and
 * the alt+p session picker.
 */
export declare function resolveRoleAssignments(settings: ModelBrowserSource, allModels: ReadonlyArray<Model>, autoCandidates: ReadonlyArray<Model>): RoleAssignments;
/** Wrap raw models into browser items. */
export declare function buildBrowserItems(models: ReadonlyArray<Model>): ModelBrowserItem[];
/** Options for {@link sortModelItems}. */
export interface SortModelItemsOptions {
    roles?: RoleAssignments;
    mruOrder?: ReadonlyArray<string>;
    /**
     * When a search query is narrowing the list, role assignments should NOT
     * promote a weakly-matching default model above a perfect text match —
     * defer to MRU/version instead so user affinity drives the order.
     */
    skipRoleRank?: boolean;
}
/**
 * Order models for display: role-assigned first, then most-recently-used,
 * then per provider by priority, version, and recency.
 */
export declare function sortModelItems(items: ModelBrowserItem[], options?: SortModelItemsOptions): void;
/** Picker candidates and ordering inputs shared with composer model mentions. */
export interface SessionModelScope {
    items: ModelBrowserItem[];
    roles: RoleAssignments;
    mruOrder: ReadonlyArray<string>;
    error: string | undefined;
}
/** Build the session picker's current scope without creating an interactive browser. */
export declare function buildSessionModelScope(settings: ModelBrowserSource, registry: ModelBrowserRegistry, scopedModels: ReadonlyArray<Model>): SessionModelScope;
/**
 * {@link buildSessionModelScope} for per-keystroke callers: returns the same
 * scope until the source revision, MRU order, scoped models, or the registry's
 * available models, catalog, or load error change.
 */
export declare class SessionModelScopeCache {
    #private;
    constructor(settings: ModelBrowserSource, registry: ModelBrowserRegistry);
    get(scopedModels: ReadonlyArray<Model>): SessionModelScope;
}
/** User affinity used to order search matches within one relevance tier. */
export interface SearchAffinity {
    /** `provider/id` (lowercased) → rank; configured-role models first, then MRU. */
    models: Map<string, number>;
    /** provider (lowercased) → rank; explicit order, then role providers, then MRU providers. */
    providers: Map<string, number>;
}
/**
 * Build model and provider affinity from explicit configuration, configured
 * role assignments, and recent model use. Auto-selected roles are catalog
 * policy, not evidence of user preference.
 */
export declare function buildSearchAffinity(providerOrder: ReadonlyArray<string>, roles: RoleAssignments, mruOrder: ReadonlyArray<string>): SearchAffinity;
/** Rank picker and mention candidates by text relevance, user affinity, and MRU/version order. */
export declare function rankModelItems(query: string, items: ReadonlyArray<ModelBrowserItem>, options: {
    roles: RoleAssignments;
    mruOrder: ReadonlyArray<string>;
    affinity: SearchAffinity;
}): ModelBrowserItem[];
/**
 * A slim role chip: `● default ◉` — solid dot for configured assignments,
 * hollow for auto-selected fallbacks, thinking glyph attached when set.
 *
 * The space after the status glyph is load-bearing. Under the `nerd` preset
 * these are Nerd Font private-use icons (U+F111 / U+F10C) whose glyphs are
 * drawn two cells wide, while `visibleWidth` counts them as one
 * (`ambiguousIsNarrow: true` in tui/utils.ts — the PUA block is
 * East_Asian_Width=Ambiguous). Without a separator the icon overhangs and
 * eats the label's first character (`● default` renders as `●efault`).
 * Mirrors the spacing already used for `status.success` in model-hub.
 */
export declare function formatRoleChip(role: string, assignment: RoleAssignment, settings: ModelBrowserSource): string;
/** Fact columns of a model picker (Stencil `NATIVE_REDESIGN.md` §4.7); the lowest priority hides first. */
export declare const MODEL_PICKER_COLUMNS: readonly TspPickerColumn[];
/** The omp theme token of a thinking level's dot (`thinkingHigh`); none for inherit and auto. */
export declare function thinkingDotToken(level: ConfiguredThinkingLevel): string | undefined;
/**
 * The fuzzy haystack for a model row: the displayed `provider/id`, plus `free`
 * for zero-cost models so the cost column's own word is searchable even when
 * the id never says it (openrouter suffixes `:free`; nvidia does not).
 *
 * Must stay a pure function of the item — never of the query. `fuzzyRank`
 * caches match indices keyed on this string and stops admitting new entries
 * past its cap, so a query-dependent haystack would thrash that cache.
 */
export declare function modelSearchText({ provider, id, model }: ModelBrowserItem): string;
/** A model browser's visible rows as picker `order` plus the query's hit ranges. */
export interface ModelPickerOrder {
    readonly order: readonly (string | TspPickerGroup)[];
    readonly hits: Readonly<Record<string, readonly (readonly [number, number])[]>> | undefined;
    /** Selectable rows in `order`. */
    readonly count: number;
}
/**
 * A model picker's catalogue props: `items` as last sent whole, plus the
 * rows changed or added since (`itemsAdd`) and the ids gone (`itemsDel`), so
 * a discovery refresh that touches a few rows does not resend a thousand.
 */
export interface ModelPickerCatalogue {
    readonly items: readonly TspPickerItem[];
    readonly itemsAdd?: readonly TspPickerItem[];
    readonly itemsDel?: readonly string[];
}
/** How {@link ModelBrowser.pickerOrder} heads its rows. */
export interface ModelPickerGrouping {
    /** One group per provider after the Recent block (the unfiltered All models view). */
    readonly providers: boolean;
    /** Label of the rows after the Recent block when they are not split by provider; null drops every head. */
    readonly rest: string | null;
}
/** Behavior switches for {@link ModelBrowser}. */
export interface ModelBrowserOptions {
    /** Render the dim `provider/` prefix before model ids. Default true. */
    showProvider?: boolean;
    /** Session token count used to flag models whose context window is exceeded. */
    currentContextTokens?: number;
    /** When true, over-context rows render grayed; picking one compacts first (session-switch mode). */
    markOverContext?: boolean;
    /** Host-provided empty-state text (e.g. provider discovery status). */
    emptyText?: () => string | undefined;
}
/**
 * The reusable browser component. Renders a fixed-height block
 * (`maxVisible + LIST_ROW_START + DETAIL_ROWS` rows) so host mouse geometry
 * stays stable across renders.
 */
export declare class ModelBrowser implements Component {
    #private;
    /** Enter or click-on-selected. */
    onActivate?: (item: ModelBrowserItem) => void;
    onSelectionChange?: (item: ModelBrowserItem | undefined) => void;
    onQueryChange?: (query: string) => void;
    /** Cancel key with an empty query (a non-empty query is cleared first). */
    onCancel?: () => void;
    constructor(settings: ModelBrowserSource, options?: ModelBrowserOptions);
    /** Mark `selector` as the session's active model (undefined clears the mark). */
    setCurrentSelector(selector: string | undefined): void;
    /** Replace the scope's base items; the live query re-applies and selection is pinned by selector. */
    setItems(items: ModelBrowserItem[]): void;
    setRoles(roles: RoleAssignments): void;
    setMruOrder(order: ReadonlyArray<string>): void;
    /** Measured TPS/TTFT averages keyed by `provider/id` selector (see AgentStorage.getModelPerf). */
    setPerfStats(perf: ReadonlyMap<string, ModelBrowserPerf>): void;
    setMaxVisible(rows: number): void;
    setShowProvider(show: boolean): void;
    /** Keep the source order after fuzzy filtering instead of applying model-specific ranking. */
    setPreserveQueryOrder(preserve: boolean): void;
    /** Allow hosts to toggle context-window flagging between browser modes. */
    setMarkOverContext(mark: boolean): void;
    /** Focused: accent cursor + selected-row background band. Unfocused: dim cursor, no band. */
    setFocused(focused: boolean): void;
    /** Total rendered height for the current `maxVisible` (host layout budgeting). */
    get renderedRows(): number;
    get query(): string;
    /** Caret into {@link query} (UTF-16 offset), for native picker `cursor`. */
    get cursor(): number;
    setQuery(query: string): void;
    getSelected(): ModelBrowserItem | undefined;
    get visibleCount(): number;
    /** Move selection to `selector`; false when it is not in the current view. */
    selectSelector(selector: string): boolean;
    /** True when `item`'s context window is smaller than the live session token count (grayed row; hosts compact before switching). */
    isOverContext(item: ModelBrowserItem): boolean;
    /**
     * Move the selection by `delta` rows, skipping disabled rows. Single steps
     * wrap at the ends; `wrap: false` (page/home/end jumps) clamps instead.
     */
    moveSelection(delta: number, options?: {
        wrap?: boolean;
    }): void;
    handleInput(data: string): void;
    /** Cancel-key ladder: clear a non-empty query first, then bubble to the host. */
    handleCancel(): void;
    /**
     * Route a mouse event. `line` is relative to the browser's first rendered
     * row (the search row).
     */
    routeMouse(event: SgrMouseEvent, line: number): void;
    /** Drop the hover band. Hosts call this when the pointer leaves the browser pane. */
    clearHover(): void;
    render(width: number): string[];
    invalidate(): void;
    /**
     * `col[search row, list, detail]`: the query field (the embedded `Input`),
     * every visible model as a keyed `item` (the terminal virtualizes and
     * scrolls), and the selection's facts and role chips.
     */
    describe(): NativeNode;
    /** List `select`/`activate` on a model = highlight it, then Enter. */
    handleNativeEvent(event: NativeUiEvent): void;
    /** Base rows of the current scope, before the query (the head's "of N"). */
    get baseCount(): number;
    /** The selected row's selector, null when nothing selectable is selected. */
    get pickerSelected(): string | null;
    /**
     * Picker rows for `catalogue`: the same object while the catalogue, roles
     * and row inputs are unchanged, so typing and scope hops never resend it.
     * A rebuilt catalogue that differs in a few rows (a provider refresh, a
     * role moving) keeps the last whole `items` and patches it.
     */
    pickerItems(catalogue: readonly ModelBrowserItem[]): ModelPickerCatalogue;
    /**
     * The visible rows as picker `order`: the Recent block (recent and
     * role-assigned models, the ANSI separator's upper side) under "Recent",
     * then the rest per provider or under `grouping.rest`. Memoized per
     * result list and query, so selection moves reuse it.
     */
    pickerOrder(grouping: ModelPickerGrouping): ModelPickerOrder;
    /**
     * Preview children for the selection. `full` (the model hub's side pane):
     * title, copyable id, badges, a fact grid, every role the model can fill
     * (held ones on) and the description. `compact` (the quick picker's strip
     * below the list): one inline fact line and the held-role chips.
     */
    pickerPreview(mode: "full" | "compact", current?: string): readonly NativeChild[];
    /** Preview children for any model row (the hub's Roles view previews assigned models with it); unmemoized. */
    modelPreview(item: ModelBrowserItem, mode: "full" | "compact", current: string | undefined): NativeChild[];
    /** A picker row click: `select` highlights it, `activate` also runs Enter's path. False when not a visible row. */
    routePickerItem(selector: string, activate: boolean): boolean;
}
