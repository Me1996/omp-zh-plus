/**
 * Fullscreen `/advisor configure` overlay: a mouse- and keyboard-driven editor
 * for the `WATCHDOG.yml` advisor roster at project or user level.
 *
 * It paints the entire alternate screen from row 0 (so SGR mouse rows index
 * directly into the rendered frame) using the shared {@link ./overlay-box} chrome.
 * The list screen is a two-pane split (the `/extensions` idiom): a clickable
 * advisor/action sidebar on the left, and a scrollable preview of the highlighted
 * advisor's model / tools / instructions on the right, filling the free space.
 *
 * Each screen is backed by a proven primitive — {@link SelectList} (list / detail
 * / tools / thinking), {@link Input} (name), {@link ModelSelectorComponent} (the
 * same rich `/model` picker, in direct-select mode), and {@link HookEditorComponent}
 * (multiline instructions; Ctrl+G opens `$EDITOR`). The overlay edits an in-memory
 * {@link WatchdogConfigDoc} and only touches disk + the live advisors via the host
 * `save` callback.
 */
import type { ThinkingLevel } from "@oh-my-pi/pi-agent-core";
import { type Model, type UsageLimit, type UsageReport } from "@oh-my-pi/pi-ai";
import { type Component, type TUI } from "../index.js";
import { type ModelBrowserSource } from "./model-browser.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
export declare const ADVISOR_REVIEW_MODES: readonly ["turn", "agent-end"];
export declare const ADVISOR_SYNC_BACKLOG_MODES: readonly ["off", "1", "3", "5", "strict"];
export type AdvisorReviewMode = (typeof ADVISOR_REVIEW_MODES)[number];
export type AdvisorSyncBacklog = (typeof ADVISOR_SYNC_BACKLOG_MODES)[number];
/** One advisor declared in `WATCHDOG.yml`; its instructions specialize the shared baseline. */
export interface AdvisorConfig {
    name: string;
    /** Model selector with an optional `:level` thinking suffix, resolved like any other model override. */
    model?: string;
    /** Built-in tool names, including mutating tools; omitted uses read/grep/glob plus available recall, empty grants none. */
    tools?: string[];
    instructions?: string;
    /** Defaults to true; false retains the advisor in the roster and status displays without building its runtime. */
    enabled?: boolean;
    /** Maximum non-blocker notes per advisor prompt update (default 4); blockers are exempt. */
    maxNotesPerUpdate?: number;
    reviewMode?: AdvisorReviewMode;
    reviewInterval?: number;
    syncBacklog?: AdvisorSyncBacklog;
}
/** Which level a `WATCHDOG.yml` lives at: the project root or the user agent dir. */
export type AdvisorConfigScope = "project" | "user";
/** Editable raw contents of one `WATCHDOG.yml`, without cross-level merging or `@import` expansion, for exact round trips. */
export interface WatchdogConfigDoc {
    instructions?: string;
    maxNotesPerUpdate?: number;
    advisors: AdvisorConfig[];
    /** Per-entry problems found while loading (dropped entries). Shown when the file becomes active in the editor. */
    warnings?: string[];
}
export interface AdvisorConfigStat {
    name: string;
    sessionId?: string;
    status: string;
    model?: {
        provider: string;
    };
    tokens: {
        input: number;
        output: number;
        cacheRead: number;
    };
    cost: number;
    contextWindow: number;
    contextTokens: number;
}
/** Host callbacks: all disk + live-runtime effects flow through these. */
export interface AdvisorConfigCallbacks {
    /** Load a scope's `WATCHDOG.yml` into an editable doc (empty when absent). */
    loadDoc: (scope: AdvisorConfigScope) => Promise<WatchdogConfigDoc>;
    /** Persist the doc to the scope's file and rebuild the live advisors. */
    save: (scope: AdvisorConfigScope, doc: WatchdogConfigDoc) => Promise<void>;
    /** Tear down the overlay and restore the editor. */
    close: () => void;
    requestRender: () => void;
    /** Surface a transient status/warning line to the user. */
    notify: (message: string) => void;
    /**
     * Surface a sticky warning (e.g. malformed entries in the file just made
     * active by a scope switch). Falls back to `notify` when omitted.
     */
    warn?: (message: string) => void;
    /** Live advisor usage stats; lets the preview show tokens/cost per advisor. */
    getAdvisorStats?: () => AdvisorConfigStat[];
    /** Reports normalized by the host to collapse shared credential pools. */
    getUsageReports?: () => Promise<UsageReport[] | null>;
    /** Filter to the advisor's active credential; absent identity includes every limit. */
    getQuotaLimitFilter?: (provider: string, sessionId: string | undefined) => ((report: UsageReport, limit: UsageLimit) => boolean) | undefined;
}
export interface AdvisorConfigDeps {
    getAvailableModels: () => Model[];
    browserSource: ModelBrowserSource;
    defaultToolNames: ReadonlySet<string>;
    externalEditor?: (text: string) => Promise<string | null>;
    scopedModels: ReadonlyArray<{
        model: Model;
        thinkingLevel?: ThinkingLevel;
    }>;
    availableToolNames: string[];
    syncBacklog?: AdvisorSyncBacklog;
    /** Formatted advisor-role model shown on the seeded default row (e.g. "anthropic/claude-..."). */
    defaultModelLabel?: string;
}
/**
 * One-line provider quota display. The host supplies normalized usage reports
 * and an optional credential filter; the overlay owns only presentation.
 */
export declare function formatCompactQuota(provider: string, reports: UsageReport[], nowMs: number, includeLimit?: (report: UsageReport, limit: UsageLimit) => boolean): string | null;
/**
 * Fullscreen advisor-configuration overlay. Implements {@link Component} directly
 * (rather than extending Container) so it owns the whole frame and the mouse
 * geometry needed to make every row clickable.
 */
export declare class AdvisorConfigOverlayComponent implements Component {
    #private;
    constructor(tui: TUI, deps: AdvisorConfigDeps, scope: AdvisorConfigScope, doc: WatchdogConfigDoc, callbacks: AdvisorConfigCallbacks);
    render(width: number): readonly string[];
    /** Docks as a side sheet beside the transcript, like `/settings`, when the terminal draws `prefs` with `aside`. */
    nativeSheet(cx: DescribeContext): boolean;
    /**
     * The native settings page (`prefs`) when the terminal draws it: a page per
     * advisor plus the shared instructions, the advisor's fields as typed rows,
     * the file actions, and the model/tools/instructions editors over the page.
     * Otherwise the root card `omp.overlay.advisor`: on the roster screen a
     * sidebar (the active `SelectList`) beside the highlighted entry's preview;
     * every other screen shows its editor component alone. Key hints close the
     * card.
     */
    describe(cx: DescribeContext): NativeNode;
    /**
     * Native page events, each through the roster/detail selections the keys
     * make: a page opens that advisor (or the shared instructions), a field
     * change or button runs the field's detail action, and closing an editor
     * or the page cancels like Esc.
     */
    handleNativeEvent(event: NativeUiEvent): void;
    handleInput(data: string): void;
    /** Forward enhanced-paste transports into a multiline instructions editor. */
    pasteText(text: string): void;
}
