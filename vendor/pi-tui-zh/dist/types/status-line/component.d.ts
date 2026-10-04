import { type Component, type ComposerStyle } from "../index.js";
import type { StatusLineHost, StatusLineSession } from "./host.js";
import type { Editor } from "../components/editor.js";
import { type CodexResetFireworksEvent } from "../overlays/codex-reset-fireworks.js";
import { type SegmentContext } from "./segments.js";
import type { NativeNode, NativeUiEvent } from "../native/node.js";
import type { CollabStatus, ComposerFacts, ComposerFactsSource, EffectiveStatusLineSettings, StatusLineSettings } from "./types.js";
/** What a click on a native status segment asks omp to open. */
export type StatusLineNativeAction = "status.model" | "status.context" | "status.git" | "status.cost" | "status.path";
/** Pull request the native tab title carries. */
export interface StatusLinePullRequest {
    readonly number: number;
    readonly url: string;
}
/**
 * Drop priority of a configured segment: the outer edges matter most, so the
 * leftmost left segment and the rightmost right segment stay longest.
 */
export declare function statusSegmentPriority(side: "left" | "right", index: number, count: number): number;
export declare class StatusLineComponent<TSession extends StatusLineSession = StatusLineSession> implements Component, ComposerFactsSource {
    #private;
    private session;
    private readonly host;
    constructor(session: TSession, host: StatusLineHost<TSession>);
    /**
     * Re-point the status line at another session (focus proxy). Invalidate: model/context/usage all derive
     * from it. `focusedAgentId` is the focused subagent id while the view is proxied, undefined for main.
     */
    setSession(session: TSession, focusedAgentId?: string): void;
    updateSettings(settings: StatusLineSettings): void;
    getEffectiveSettingsForTest(): EffectiveStatusLineSettings;
    setAutoCompactEnabled(enabled: boolean): void;
    setRunningSubagents(agentIds: readonly string[]): void;
    /** Host-computed spend of the main session's whole subagent tree (Agent Hub projection). */
    setSubagentTreeCost(cost: number): void;
    /**
     * Compatibility shim for callers predating the simplified subagent badge.
     * The status line now intentionally shows only the active count.
     */
    setSubagentHubHint(_hint: string | undefined): void;
    /** Active subagent count as currently displayed (collab state mirroring). */
    get subagentCount(): number;
    /**
     * Running background jobs outside the subagent badge. Task jobs count only
     * until their AgentRegistry ref appears; once it is running, the subagent
     * badge represents that same agent. Bash and eval jobs always count.
     */
    runningBackgroundJobCount(): number;
    /**
     * Reset the currently-attached session's active-time accumulators so
     * the `time_spent` segment starts from zero. Called from `/clear`,
     * fresh-session, and joined-collab paths; both the completed
     * accumulator and any in-flight window are dropped, so a reset
     * mid-turn ignores the running window (the matching `markActivityEnd`
     * will see an idle meter and no-op).
     */
    resetActiveTime(): void;
    /**
     * Mark the currently-attached session as having started a unit of
     * active processing. Idempotent: a second start while a window is
     * already open is a no-op, so reentrant `agent_start` events (e.g.
     * nested auto-compaction loops, focus-controller mid-turn attach onto
     * an already-running window) do not double-count.
     */
    markActivityStart(): void;
    /**
     * Close the currently-attached session's open active-processing
     * window, folding its elapsed time into the accumulator. Idempotent
     * when the meter is already idle so callers can fire it on every
     * `agent_end` without guarding.
     */
    markActivityEnd(): void;
    /**
     * Snapshot of total active-processing time for the currently-attached
     * session, including any in-flight window. Exposed for the segment
     * context builder; tests assert against this too.
     */
    getActiveMs(): number;
    /**
     * Elapsed ms of the currently-open active-processing window, or null when
     * idle. Feeds the `pi` segment's working spinner + turn timer.
     */
    getTurnElapsedMs(): number | null;
    setPlanModeStatus(status: {
        enabled: boolean;
        paused: boolean;
    } | undefined): void;
    setLoopModeStatus(status: NonNullable<SegmentContext["loopMode"]> | undefined): void;
    setGoalModeStatus(status: {
        enabled: boolean;
        paused: boolean;
    } | undefined): void;
    setVibeModeStatus(status: {
        enabled: boolean;
    } | undefined): void;
    /** Mirror of the editor's modal state; `undefined` clears it (Vim mode off). */
    setVimStatus(status: NonNullable<SegmentContext["vim"]> | undefined): void;
    /**
     * Inject the aggregator that returns the aggregate tok/s of this session's
     * live vibe worker sessions (null when no workers are streaming). Wired by
     * interactive-mode, which owns the VibeSessionRegistry coupling, so the
     * render layer stays off the heavy vibe/task dependency graph. Pass
     * `undefined` to clear.
     */
    setVibeWorkerTokenRateProvider(provider: (() => number | null) | undefined): void;
    setCollabStatus(status: CollabStatus | null): void;
    setStreamStatus(status: {
        viewers: number;
    } | null): void;
    /** Toggle the `● REC` badge shown while `/record` captures the screen. */
    setRecording(recording: boolean): void;
    /** Set the callback that presents detected Codex reset celebrations, or clear it with `undefined`. */
    setCodexResetFireworksHandler(handler: ((event: CodexResetFireworksEvent) => void) | undefined): void;
    setHookStatus(key: string, text: string | undefined): void;
    watchBranch(onBranchChange: () => void): void;
    dispose(): void;
    invalidate(): void;
    /**
     * Explicit Git/repository cache invalidation. Aborts any in-flight
     * reftable HEAD/PR resolve, bumps the stale-result generation, and drops
     * the branch/PR/jj caches so the next render refetches from disk. Called
     * by the git watcher on a HEAD move and by {@link applyCwdChange} on a
     * repo/cwd switch. Generic repaints use {@link invalidate} instead and
     * must never reach this path.
     */
    invalidateGitCaches(): void;
    /**
     * Re-point the status line's VCS watcher and caches at a new cwd/repository.
     * Atomically retires the old watcher/listeners, invalidates VCS caches and
     * in-flight controllers, then runs watcher setup for the new cwd and requests
     * a repaint. Called by {@link InteractiveMode.applyCwdChange} after the
     * SessionManager's cwd has moved — the watcher ownership always follows the
     * effective cwd/repo, so a stale watcher for the previous repo can never
     * invalidate the new one. Generic repaints use {@link invalidate} and must
     * never retire the watcher or abort a live resolve.
     */
    applyCwdChange(): void;
    /**
     * Seed working-tree status from the status line this one replaces (the
     * startup bar), so the dirty counts stay on screen instead of blanking until
     * this instance's first fetch lands. Normal TTL refreshes follow.
     */
    adoptGitStatus(source: StatusLineComponent): void;
    /**
     * Startup redraws only arm a short-delayed task; timeout releases the render
     * cadence while a late successful fetch can still refresh the cached segment.
     */
    refreshUsageInBackground(): void;
    /**
     * Used-tokens / context-window totals for the status-line context% segment,
     * memoized so the per-event redraw stays O(1) when nothing changed.
     *
     * The numerator comes from `session.getContextUsage()`, which anchors on the
     * last assistant's real prompt-token count — so the bar matches the provider
     * and the `/context` panel — and reports `null` while that count is unknown
     * (right after compaction, before the next response). Exposed (non-private)
     * for unit tests and the collab host's state broadcast.
     */
    getCachedContextBreakdown(): {
        usedTokens: number;
        contextWindow: number;
    };
    /**
     * Wire this bar into `editor` for a composer layout: the matching top-border
     * provider, the autocomplete probe, the standalone bottom-bar placement, and
     * the native composer's facts. Callers re-run it whenever the composer shape
     * changes.
     */
    attachToEditor(editor: Pick<Editor, "isAutocompleteActive" | "setTopBorderProvider" | "setTopBorder"> & {
        composerFacts: ComposerFactsSource | undefined;
    }, style: Pick<ComposerStyle, "statusAttachment" | "bottomBar" | "bottomBarGap">): void;
    getTopBorder(width: number, previewTitle?: string): {
        content: string;
        width: number;
        revision: number;
    };
    /** Flush-left soft-capped powerline band (the band composer's top row). */
    getBandTopBorder(width: number, previewTitle?: string): {
        content: string;
        width: number;
        revision: number;
    };
    /**
     * Standalone bar placement derived from the composer style. `bottomBar`
     * `"full"` renders both groups on the bottom bar (pi/borderless/field/rail);
     * `"left"` renders just the left group there — the right group attaches to
     * the editor's top rule via {@link getStandaloneTopBorder} (claude/rule);
     * `"none"` returns the bar to the box composer's embedded top border.
     * `bottomBarGap` inserts a blank spacer row above the bar for styles whose
     * editor has no bottom chrome.
     */
    setComposerStyle(style: Pick<ComposerStyle, "statusAttachment" | "bottomBar" | "bottomBarGap">): void;
    /** While true, the standalone bar yields its row to the editor's autocomplete menu. */
    setAutocompleteActiveProbe(probe: (() => boolean) | undefined): void;
    /** Plain right-group content for the claude composer's top rule. */
    getStandaloneTopBorder(width: number, previewTitle?: string): {
        content: string;
        width: number;
        revision: number;
    };
    /**
     * The plain standalone bottom bar through the real segment/gauge pipeline —
     * `groups` picks which segment groups it carries. Used by the live render
     * loop and by composer previews (which inject a candidate layout instead of
     * the active one).
     */
    renderBottomBar(width: number, groups: "left" | "full", previewTitle?: string): string;
    /**
     * Status bar lines for a composer layout, rendered through the real
     * pipeline — the single source for the /settings appearance preview.
     * `style` overrides the layout (candidate composer shape); omitted, the
     * active layout is used. Ignores the autocomplete probe: previews always
     * render.
     */
    getPreviewLines(width: number, style?: Pick<ComposerStyle, "statusAttachment" | "bottomBar">): string[];
    /**
     * The composer's facts on a TSP terminal, which draws no status strip: the
     * context hairline, the model chip label, the usage text, and every other
     * configured segment as a `seg` in configured order with its drop priority.
     * Returns the same object while nothing changed.
     */
    describeComposerFacts(): ComposerFacts;
    /**
     * Native status bar for the /settings appearance preview: a `status` of
     * `seg`s in configured order, each with its side and a drop priority from
     * that order, plus hook-status rows.
     */
    describePreview(): NativeNode;
    /**
     * Called with the branch's pull request (undefined when there is none) each
     * time it changes while the composer facts are described; the native tab
     * title carries it. Looked up only when the `pr` segment is configured.
     */
    onNativePullRequest: ((pr: StatusLinePullRequest | undefined) => void) | undefined;
    /** The host's handler for clicks on native segments ({@link NATIVE_SEGMENT_ACTIONS}). */
    onNativeAction: ((action: StatusLineNativeAction) => void) | undefined;
    handleNativeEvent(event: NativeUiEvent): void;
    render(width: number): readonly string[];
}
