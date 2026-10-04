import { type Agent, type AgentMessage } from "@oh-my-pi/pi-agent-core";
import type { CompactionOutcome } from "@oh-my-pi/pi-agent-core/compaction";
import type { AssistantMessage, ImageContent, Model, Usage, UsageReport } from "@oh-my-pi/pi-ai";
import type { Component, EditorTheme } from "@oh-my-pi/pi-tui-zh";
import { Container, Loader, type TUI } from "@oh-my-pi/pi-tui-zh";
import type { NativeNode, NativeUiEvent } from "@oh-my-pi/pi-tui-zh/native/node";
import { type TrackSegment } from "@oh-my-pi/pi-tui-zh/chrome/segment-track";
import type { TspText } from "@oh-my-pi/pi-wire";
import type { CollabGuestLink } from "../collab/guest.js";
import { CollabController } from "../collab/controller.js";
import type { CollabHost } from "../collab/host.js";
import { KeybindingsManager } from "@oh-my-pi/pi-tui-zh/app-keybindings";
import { Settings } from "../config/settings.js";
import type { AutocompleteProviderFactory, ContextUsage, ExtensionCustomOptions, ExtensionUIContext, ExtensionUIDialogOptions, ExtensionUISelectItem, ExtensionWidgetContent, ExtensionWidgetOptions } from "../extensibility/extensions/index.js";
import type { CompactOptions } from "../extensibility/extensions/types.js";
import type { Skill } from "../extensibility/skills.js";
import type { FileSlashCommand } from "../extensibility/slash-commands.js";
import type { MCPManager } from "../mcp/index.js";
import { type PlanApprovalDetails } from "../plan-mode/approved-plan.js";
import { type AgentSession } from "../session/agent-session.js";
import type { CompactMode } from "../session/compact-modes.js";
import type { ForeignSessionSource } from "../session/foreign-session-store.js";
import { HistoryStorage } from "../session/history-storage.js";
import type { SessionContext } from "../session/session-context.js";
import type { SessionManager } from "../session/session-manager.js";
import type { ShakeMode } from "../session/shake-types.js";
import { type DictationTarget } from "../stt/index.js";
import type { SpaceHoldHandler } from "@oh-my-pi/pi-tui-zh/space-hold";
import type { ConfiguredThinkingLevel } from "@oh-my-pi/pi-tui-zh/thinking";
import type { LspStartupServerInfo } from "../tools/index.js";
import { type StartupChangelogSelection } from "../utils/changelog.js";
import type { EventBus } from "../utils/event-bus.js";
import type { TokenRateMeter } from "../utils/token-rate.js";
import { AssistantMessageComponent } from "@oh-my-pi/pi-tui-zh/chat/assistant-message";
import { StatusNotice } from "@oh-my-pi/pi-tui-zh/chrome/status-notice";
import type { BashExecutionComponent } from "@oh-my-pi/pi-tui-zh/chat/bash-execution";
import { CustomEditor } from "@oh-my-pi/pi-tui-zh/prompt/custom-editor";
import type { EvalExecutionComponent } from "@oh-my-pi/pi-tui-zh/chat/eval-execution";
import type { HookEditorComponent } from "@oh-my-pi/pi-tui-zh/overlays/hook-editor";
import type { HookInputComponent } from "@oh-my-pi/pi-tui-zh/overlays/hook-input";
import type { HookSelectorComponent, HookSelectorSlider } from "@oh-my-pi/pi-tui-zh/overlays/hook-selector";
import { type PlanReviewAnnotationState } from "@oh-my-pi/pi-tui-zh/overlays/plan-review-overlay";
import { ServedModelTracker } from "@oh-my-pi/pi-tui-zh/chat/served-model-marker";
import { StatusLineComponent } from "@oh-my-pi/pi-tui-zh/status-line";
import { type ToolExecutionHandle } from "@oh-my-pi/pi-tui-zh/chat/tool-execution";
import { TranscriptContainer } from "@oh-my-pi/pi-tui-zh/chrome/transcript-container";
import { Composer } from "@oh-my-pi/pi-tui-zh/prompt/composer";
import { EventController } from "./controllers/event-controller.js";
import type { LoopConditionConfig, LoopLimitRuntime } from "@oh-my-pi/pi-tui-zh/status-line/loop";
import { OAuthManualInputManager } from "./oauth-manual-input.js";
import { type ObservableSession } from "@oh-my-pi/pi-tui-zh/overlays/session-observer-registry";
import type { Theme } from "@oh-my-pi/pi-tui-zh/theme";
import type { AgentHubOpenOptions, CompactionQueuedMessage, InteractiveModeContext, InteractiveModeInitOptions, InteractiveSelectorDialogOptions, RenderSessionContextOptions, SubmittedUserInput } from "./types.js";
import type { TodoItem, TodoPhase } from "@oh-my-pi/pi-tui-zh/tools/todo";
/**
 * Editor max-height cap for a terminal of `terminalRows` rows.
 *
 * Roomy terminals get the comfortable [6, 18] band. Small terminals shrink the
 * cap so the editor leaves at least EDITOR_MIN_CHROME_ROWS rows for the
 * transcript + status line. The editor is bordered, so it never renders fewer
 * than EDITOR_MIN_RENDERED_ROWS rows; once the terminal is too small for both
 * (terminalRows < EDITOR_MIN_RENDERED_ROWS + EDITOR_MIN_CHROME_ROWS) the cap is
 * pinned to that floor — returning a smaller number would not shrink the editor
 * any further, it would only misreport the rows it actually occupies.
 */
export declare function computeEditorMaxHeight(terminalRows: number): number;
export declare function shouldEnterPlanModeOnStartup(sessionManager: Pick<SessionManager, "buildSessionContext" | "getEntries">, sessionSettings: Settings): boolean;
/** Options for creating an InteractiveMode instance (for future API use) */
export interface InteractiveModeOptions {
    /** Providers that were migrated during startup */
    migratedProviders?: string[];
    /** Warning message if model fallback occurred */
    modelFallbackMessage?: string;
    /** Initial message to send */
    initialMessage?: string;
    /** Initial images to include with the message */
    initialImages?: ImageContent[];
    /** Additional initial messages to queue */
    initialMessages?: string[];
}
export declare const TODO_COMPACT_TERMINAL_ROWS_THRESHOLD = 18;
/**
 * Anchored subagent HUD block with its visible session order, so click-to-focus
 * can map a rendered row back to its agent. Row 0 is the leading blank, row 1
 * the title; item rows follow in `order`; the overflow summary maps nowhere.
 * The expander row (when `layoutPinnedHud` shows one) resolves to the toggle
 * sentinel, which the click router handles before any registry lookup.
 * Rendering delegates to the same `Text` mount as before, so output bytes are
 * unchanged — only the row map is new. Long rows wrap inside `Text` (content
 * is two cells narrower than the terminal), so the map is built on the first
 * click after rendering at a new width or width configuration: continuation
 * rows belong to the agent (or toggle) whose logical row started them.
 */
export declare class SubagentHudComponent implements Component {
    #private;
    constructor(lines: readonly string[], order: readonly string[], toggleRow?: number, native?: SubagentHudNative);
    describe(): NativeNode;
    /** A click on the pill opens the agent hub, as the hub key does. */
    handleNativeEvent(event: NativeUiEvent): void;
    /**
     * Repaint in place with a new view. Keeping the instance keeps its native
     * wire id, so the dock pill stays mounted (a fresh component would be
     * removed and re-added, replaying its entrance) and the HUD memo holds.
     * The click map rebuilds lazily.
     */
    update(lines: readonly string[], order: readonly string[], toggleRow: number | undefined, node: NativeNode): void;
    render(width: number): readonly string[];
    getClickAgentAtRow(row: number): string | undefined;
}
/** Native side of the subagent HUD: the pill and what a click on it opens. */
export interface SubagentHudNative {
    readonly node: NativeNode;
    /** Open the agent hub. */
    onOpen(): void;
}
/**
 * Native subagent HUD: one dock pill (§8.1) counting the running subagents,
 * with a spinner while they run; a click sends `agents.open`.
 */
export declare function describeSubagentHud(sessions: ObservableSession[]): NativeNode;
/** Pinned jump-list layout: painted item rows plus the expander row. */
export interface PinnedHudLayout {
    /** Item rows painted, in registry order. */
    itemRows: number;
    /** Expander direction, or undefined when the list fits without one. */
    toggle: "expand" | "collapse" | undefined;
    /** Viewport row of the expander within HUD lines (2 header rows + items). */
    toggleRow: number | undefined;
}
/**
 * Pinned jump-list layout for `runningTotal` live agents. Collapsed shows a
 * few rows plus an expander; expanded shows every row plus a collapse row.
 * Single source of truth for the renderer and the click row map, so painted
 * rows and hit-testing can never disagree.
 */
export declare function layoutPinnedHud(runningTotal: number, expanded: boolean): PinnedHudLayout;
/**
 * Delay until the live preview next needs a repaint with no progress event to
 * trigger it: when the first listed in-flight call crosses the elapsed-marker
 * threshold, then once a second while any marker is showing. Undefined when no
 * listed agent is mid-call, so an idle or thinking agent never arms a timer.
 */
export declare function nextSubagentPreviewTickMs(sessions: readonly ObservableSession[], now: number): number | undefined;
/**
 * Build the anchored subagent HUD block: a bold accent "Subagents" header plus
 * a bounded set of running-agent rows in the same `Id ⟨role⟩: description` shape
 * the inline task rows use (muted task preview when no description was given).
 * Layout mirrors the Todos HUD exactly: unindented header, then
 * `renderTreeList` rows (dim connectors) shifted right by one space.
 * Every active subagent is listed — detached background spawns and sync task
 * calls alike — so the pinned block doubles as a click jump list.
 * With `livePreview` (`display.subagentLivePreview`), a row that has called a
 * tool carries a second physical row showing that call; both rows share one
 * returned line (joined by a newline) so line N still maps to agent N - 2.
 * Returns an empty array when nothing is running so the container can clear.
 */
export declare function renderSubagentHudLines(sessions: ObservableSession[], columns: number, expanded?: boolean, livePreview?: boolean): string[];
export declare class InteractiveMode implements InteractiveModeContext {
    #private;
    session: AgentSession;
    sessionManager: SessionManager;
    settings: Settings;
    keybindings: KeybindingsManager;
    agent: Agent;
    historyStorage?: HistoryStorage;
    /** Canonical composer shared by cold prepaint and the session-aware runtime. */
    readonly composer: Composer;
    ui: TUI;
    chatContainer: TranscriptContainer;
    pendingMessagesContainer: Container;
    /** Judge-batch and automatic-download progress rows above the working line. */
    progressHudContainer: Container;
    statusContainer: Container;
    /** Whether {@link statusContainer} rendered lines in the latest frame; the band composer's editor top gap collapses only then. */
    statusRowOccupied: boolean;
    todoContainer: Container;
    subagentContainer: Container;
    btwContainer: Container;
    omfgContainer: Container;
    cleanseContainer: Container;
    errorBannerContainer: Container;
    modelCycleContainer: Container;
    deferredCommandContainer: Container;
    /** The docked `/changelog`-style command report, just above the editor; Esc clears it. */
    reportContainer: Container;
    editor: CustomEditor;
    editorContainer: Container;
    /** Composer attachment band (chip cards) rendered directly above the prompt box. */
    attachmentChipsContainer: Container;
    hookWidgetContainerAbove: Container;
    hookWidgetContainerBelow: Container;
    statusLine: StatusLineComponent;
    isInitialized: boolean;
    initialChatRendered: boolean;
    isBashMode: boolean;
    toolOutputExpanded: boolean;
    hideToolActivity: boolean;
    todoExpanded: boolean;
    planModeEnabled: boolean;
    planModePaused: boolean;
    goalModeEnabled: boolean;
    goalModePaused: boolean;
    vibeModeEnabled: boolean;
    planModePlanFilePath: string | undefined;
    loopModeEnabled: boolean;
    loopModePaused: boolean;
    loopPrompt: string | undefined;
    loopLimit: LoopLimitRuntime | undefined;
    loopCondition: LoopConditionConfig | undefined;
    todoPhases: TodoPhase[];
    hideThinkingBlock: boolean;
    /** Whether the visible session has produced thinking content the user can reveal. */
    get hasDisplayableThinkingContent(): boolean;
    /** Record received reasoning content so Ctrl+T can reveal it even when model metadata says thinking is off. */
    noteDisplayableThinkingContent(message: AgentMessage): boolean;
    /**
     * Effective thinking-block visibility: hidden when the user's setting is on,
     * or while thinking is "off" before the session has actually produced
     * displayable thinking content. Some providers return thinking blocks without
     * advertising reasoning support, so observed content unlocks the visibility
     * toggle.
     */
    get effectiveHideThinkingBlock(): boolean;
    proseOnlyThinking: boolean;
    compactionQueuedMessages: CompactionQueuedMessage[];
    pendingTools: Map<string, ToolExecutionHandle>;
    transcriptMessageComponents: WeakMap<AgentMessage, Component>;
    pendingBashComponents: BashExecutionComponent[];
    bashComponent: BashExecutionComponent | undefined;
    pendingPythonComponents: EvalExecutionComponent[];
    pythonComponent: EvalExecutionComponent | undefined;
    isPythonMode: boolean;
    streamingComponent: AssistantMessageComponent | undefined;
    streamingMessage: AssistantMessage | undefined;
    lastAssistantUsage: Usage | undefined;
    servedModelTracker: ServedModelTracker;
    loadingAnimation: Loader | undefined;
    autoCompactionLoader: Loader | undefined;
    retryLoader: Loader | undefined;
    /** Live gen tok/s for the working row: the viewed session's own meter, so a
     * focused subagent shows its own reading and the main session's survives
     * focus round-trips. */
    get tokenRate(): TokenRateMeter;
    /** Idle stand-in for the working row: the last tok/s reading and the
     * band-mode title stay readable between turns, docked where the loader's
     * trailer was. */
    renderIdleStatusHud(width: number): readonly string[] | undefined;
    /**
     * The todo HUD, rebuilt with its ANSI rows; undefined while hidden. A
     * terminal with `checklist` gets the whole plan as a HUD checklist, others
     * the same stage window as a tree.
     */
    todoHudNative: {
        checklist: NativeNode;
        fallback: NativeNode;
    } | undefined;
    /** The key that interrupts (the working row's stop control), or undefined when Esc would not cancel. */
    maintenanceInterruptKey(): string | undefined;
    /** The stop control's click: the same handler as the interrupt key. */
    interruptFromPointer(): void;
    /** The native HUD pills row: the todo HUD, the subagent pill, then the jobs pill; hidden while all are empty. */
    describeHudPills(): NativeNode;
    /**
     * Native status HUD: the working, retry and compaction loaders describe
     * themselves as the working row; other rows describe themselves; an empty
     * HUD shows the idle tok/s readout.
     */
    describeStatusHud(children: readonly Component[]): NativeNode;
    unsubscribe?: () => void;
    onInputCallback?: (input: SubmittedUserInput) => void;
    optimisticUserMessageSignature: string | undefined;
    locallySubmittedUserSignatures: Set<string>;
    /** True while an optimistically-rendered `/skill:` row awaits its canonical
     *  `message_start`. Read by the event controller to reconcile the row. */
    optimisticSkillMessagePending: boolean;
    lastSigintTime: number;
    lastEscapeTime: number;
    /** Owns Esc for every `/mcp test` that is active or whose cancellation hint may still be visible. */
    mcpTestEscapeHandlers: Set<() => void>;
    lastLeftTapTime: number;
    shutdownRequested: boolean;
    /** True once a graceful `shutdown()` teardown failed at the memoized
     *  dispose stage. Surfaced to the input controller so the next single
     *  Ctrl+C skips the double-tap gate and runs `shutdown()` — which
     *  force-quits — instead of merely clearing the editor (#12238). */
    get teardownFailed(): boolean;
    /** True once `shutdown()` has begun teardown. Surfaced to the input
     *  controller so a Ctrl+C arriving while teardown is in flight can hard-
     *  abort the remaining work instead of stacking another no-op call. */
    get isShuttingDown(): boolean;
    hookSelector: HookSelectorComponent | undefined;
    hookInput: HookInputComponent | undefined;
    hookEditor: HookEditorComponent | undefined;
    lastStatus: StatusNotice | undefined;
    fileSlashCommands: Set<string>;
    skillCommands: Map<string, Skill>;
    oauthManualInput: OAuthManualInputManager;
    /** Owns hosting: manual `/collab`, `collab.autoStart`, and room rotation on session switch. */
    readonly collabController: CollabController;
    /** Owned room; use {@link collabController}.host for current-session reuse and links. */
    collabHost?: CollabHost;
    collabGuest?: CollabGuestLink;
    readonly lspServers: LspStartupServerInfo[] | undefined;
    mcpManager?: MCPManager;
    get eventController(): EventController;
    get eventBus(): EventBus | undefined;
    get viewSession(): AgentSession;
    get assistantImagesVisible(): boolean;
    resolveAssistantMessageLinks(texts: readonly string[]): Promise<ReadonlyMap<string, string>>;
    get focusedAgentId(): string | undefined;
    get sessionName(): string | undefined;
    focusAgentSession(id: string): Promise<void>;
    focusParentSession(): Promise<void>;
    unfocusSession(): Promise<void>;
    invalidatePendingFocus(): void;
    resolveViewportClickCandidates(index: number): string[];
    /** Flip the pinned jump list between its collapsed few and the full list, overriding the setting. */
    togglePinnedHudExpanded(): void;
    /** Rebuild the pinned jump list for a `display.pinnedAgents` change. */
    applyPinnedAgentsSetting(): void;
    setClickHoverId(id: string | undefined): void;
    clearTransientSessionUi(): void;
    /** Root-scoped bus carrying this session tree's `task:subagent:*` frames. */
    get subagentEventBus(): EventBus | undefined;
    constructor(session: AgentSession, version: string, startupChangelog?: StartupChangelogSelection | undefined, setToolUIContext?: (uiContext: ExtensionUIContext, hasUI: boolean) => void, lspServers?: LspStartupServerInfo[] | undefined, mcpManager?: MCPManager, eventBus?: EventBus, composer?: Composer, subagentEventBus?: EventBus);
    playWelcomeIntro(): void;
    init(options?: InteractiveModeInitOptions): Promise<void>;
    /** Reload the title-generation system prompt override for the provided working
     *  directory and stash it on the session so first-input titling
     *  ({@link input-controller}) and replan-driven refresh
     *  ({@link AgentSession.#refreshTitleAfterReplan}) share one source
     *  ({@link discoverTitleSystemPromptFile}; issue #3734). */
    refreshTitleSystemPrompt(cwd?: string): Promise<void>;
    /** Reload session skills and the `/skill:<name>` command list. */
    refreshSkillState(): Promise<void>;
    /** Reload slash commands and autocomplete for the provided working directory. */
    refreshSlashCommandState(cwd?: string, preloaded?: ReadonlyArray<FileSlashCommand>): Promise<void>;
    /** Stack extension autocomplete behavior on top of the built-in editor provider (#4919). */
    addAutocompleteProvider(factory: AutocompleteProviderFactory): void;
    /**
     * Re-point the process and every cwd-derived cache at `newCwd` after the
     * active session's working directory changed (`/move` relocation or resuming
     * a session from another project). The SessionManager's cwd MUST already
     * reflect `newCwd` before this is called.
     */
    applyCwdChange(newCwd: string): Promise<boolean>;
    getUserInput(): Promise<SubmittedUserInput>;
    cancelGoalContinuation(): void;
    disableGoalMode(message?: string): void;
    disableLoopMode(message?: string): void;
    setLoopPrompt(prompt: string): void;
    /**
     * Schedule the next auto-resubmit for a submission that never reached
     * {@link getUserInput}. A `/skill:` command dispatches inline from the
     * submit handler, leaving `onInputCallback` unresolved, so the run loop
     * never re-enters `getUserInput` to arm the following iteration.
     */
    armLoopAutoSubmit(): void;
    /**
     * Pause the loop without exiting it: drops the captured prompt and any
     * pending auto-resubmit. Loop mode stays enabled — the next prompt the
     * user submits becomes the new loop prompt and resumes iteration.
     */
    pauseLoop(): void;
    handleLoopCommand(args?: string): Promise<string | undefined>;
    recordLocalSubmission(text: string, imageCount?: number): () => void;
    withLocalSubmission<T>(text: string, fn: () => Promise<T>, options?: {
        imageCount?: number;
    }): Promise<T>;
    clearOptimisticUserMessage(): void;
    replaceOptimisticUserMessage(message: AgentMessage, options?: {
        imageLinks?: readonly (string | undefined)[];
    }): void;
    /**
     * Optimistically render a user-invoked `/skill:` row before its awaited
     * dispatch so a slow preflight (memory recall, `before_agent_start` hooks,
     * auto-thinking classification, pre-prompt compaction) does not leave the
     * submission invisible — normal prompts paint their row via
     * {@link startPendingSubmission} the same way (issue #8895). The canonical
     * skill `message_start` swaps this row in place via
     * {@link reconcileOptimisticSkillMessage}; a failed or bailed dispatch drops
     * it via {@link clearOptimisticSkillMessage}.
     */
    renderOptimisticSkillMessage(message: AgentMessage, options?: {
        imageLinks?: readonly (string | undefined)[];
    }): void;
    /**
     * Reconcile the optimistic `/skill:` row against the canonical message emitted
     * by the session (mirrors {@link replaceOptimisticUserMessage} for skills).
     *
     * The row is adopted in place — finalized, with the append skipped — only when
     * it is still on screen but no longer removable: it retired into native
     * scrollback before the canonical `message_start` arrived, so appending would
     * trail it with a second identical card (issue #11217). Otherwise the canonical
     * message is appended after clearing the tracked row, covering both a still-live
     * row (clean replace) and a row a transcript rebuild already detached from the
     * container (e.g. a display-setting toggle calling {@link rebuildChatFromMessages}),
     * whose card would otherwise vanish.
     */
    reconcileOptimisticSkillMessage(message: AgentMessage): void;
    /** Drop the optimistic `/skill:` row when dispatch fails or bails before the
     *  message reaches the agent (aborted preflight, streaming-race requeue). */
    clearOptimisticSkillMessage(): void;
    startPendingSubmission(input: {
        text: string;
        images?: ImageContent[];
        imageLinks?: (string | undefined)[];
        customType?: string;
        display?: boolean;
        streamingBehavior?: "steer" | "followUp";
    }, options?: {
        preserveDraft?: boolean;
        clearEditor?: boolean;
    }): SubmittedUserInput;
    cancelPendingSubmission(): boolean;
    markPendingSubmissionStarted(input: SubmittedUserInput): boolean;
    finishPendingSubmission(input: SubmittedUserInput): void;
    syncComposerShape(): void;
    updateEditorBorderColor(): void;
    /**
     * Refresh the running-subagents status badge from the active local or collab
     * registry, and the cost segment's subagent-tree spend (local sessions only:
     * a collab guest's registry mirrors host transcripts outside this root).
     */
    syncRunningSubagentBadge(options?: {
        requestRender?: boolean;
    }): void;
    rebuildChatFromMessages(options?: {
        reuseSettledComponents?: boolean;
    }): void;
    /**
     * Render the ctrl+p model-role cycle chip track into its own anchored
     * container (just above the editor), mirroring the todo HUD: the container is
     * cleared and rebuilt in place on every cycle, so rapid presses or concurrent
     * chat activity can never stack duplicate tracks into the scrollback.
     */
    showModelCycleTrack(segments: readonly TrackSegment[], activeIndex: number): void;
    isCompactTodoMode(): boolean;
    renderCompactStatusLine(width: number, childLines: readonly string[]): readonly string[];
    /** Apply any deferred model switch after the current stream ends. */
    flushPendingModelSwitch(): Promise<void>;
    showPlanReview(planContent: string, title: string, options: string[], dialogOptions?: {
        helpText?: string;
        disabledIndices?: number[];
        onExternalEditor?: () => void;
        onPlanEdited?: (content: string) => void;
        onFeedbackChange?: (feedback: string) => void;
        annotationState?: PlanReviewAnnotationState;
        onAnnotationStateChange?: (state: PlanReviewAnnotationState) => void;
        initialIndex?: number;
    }, extra?: {
        slider?: HookSelectorSlider;
    }): Promise<string | undefined>;
    handlePlanModeCommand(initialPrompt?: string, input?: Pick<SubmittedUserInput, "images" | "imageLinks">): Promise<boolean>;
    /**
     * `/vibe` toggle. Entering installs the ephemeral vibe tools, strips the
     * active toolset down to `read`, optional parent-owned `todo`, plus those
     * tools, and injects the director context. Exiting unregisters them, restores
     * the previous toolset, and kills every worker session so workers cannot
     * outlive the mode that directs them.
     */
    handleVibeModeCommand(initialPrompt?: string, input?: Pick<SubmittedUserInput, "images" | "imageLinks">): Promise<boolean>;
    handleGoalModeCommand(rest?: string, input?: Pick<SubmittedUserInput, "images" | "imageLinks">): Promise<boolean>;
    handleGuidedGoalCommand(rest?: string, input?: Pick<SubmittedUserInput, "images" | "imageLinks">): Promise<boolean>;
    /** Enter through the same goal activation path as `/goal set`, then start its first turn. */
    startGoalAtStartup(objective: string): Promise<void>;
    /** Manually (re-)open the plan-review overlay — bound to `/plan-review`. Lets
     *  the operator pull the review back up after dismissing it, or review a plan
     *  the agent wrote without dispatching approval. There is no fixed plan filename:
     *  `getPlanReferencePath()` is empty until a plan is actually approved (and does
     *  not survive a restart), so this drives off the newest `local://<slug>-plan.md`
     *  the agent wrote — the files persist in the session artifacts dir, so the scan
     *  works before any review and across restarts. */
    openPlanReview(): Promise<void>;
    handlePlanApproval(details: PlanApprovalDetails): Promise<void>;
    stop(): void;
    shutdown(): Promise<void>;
    /**
     * Tear down like {@link shutdown}, then relaunch the CLI with the original
     * launch argv (session-source flags and positional prompts stripped, see
     * {@link restartArgv}), resuming this session when it exists on disk.
     *
     * On POSIX the relaunch is a true `execvp(3)` image replacement: same PID,
     * same terminal, no lingering parent. Postmortem cleanups and stdout are
     * flushed first because nothing in this process runs after a successful
     * exec. On Windows (no exec semantics) or on exec failure, falls back to
     * spawning the replacement and lingering only to forward its exit code.
     */
    restart(): Promise<void>;
    requestShutdown(): void;
    /** True while a foreground submission is accepted but not yet handed to the session. */
    hasPendingSubmission(): boolean;
    checkShutdownRequested(): Promise<void>;
    setToolUIContext(uiContext: ExtensionUIContext, hasUI: boolean): void;
    initializeHookRunner(uiContext: ExtensionUIContext, hasUI: boolean): void;
    setEditorComponent(factory: ((tui: TUI, theme: EditorTheme, keybindings: KeybindingsManager) => CustomEditor) | undefined): void;
    present(content: Component | readonly Component[]): void;
    /**
     * Defer transcript command panels while the agent is streaming, then mount
     * them at the next settle, terminal or not. A non-terminal settle is only a
     * scheduling pause, so resumed streaming can still land below a panel
     * flushed there. That is preferred over leaving it queued behind a command
     * the user runs during the pause, which mounts immediately and would put the
     * older panel out of order.
     *
     * The deferral is acknowledged in {@link deferredCommandContainer}, an
     * anchored container above the editor. Nothing is mounted into the
     * transcript: a mid-turn mount changes the active frame while streaming,
     * which is why the earlier `showStatus` acknowledgment was reverted. An
     * anchored container is cleared and rebuilt in place without adding history
     * rows — the same reason the ctrl+p role-cycle track lives there.
     *
     * A Tern Surface Protocol surface has no append-only scrollback to
     * duplicate into, so there the panel mounts in the transcript at once.
     */
    presentCommandOutput(content: Component | readonly Component[]): void;
    showSessionInfo(info: string, context?: ContextUsage): void;
    /**
     * The jobs pill's sheet: live background jobs in a dismissable overlay.
     * Unlike `/jobs` it adds nothing to the transcript, so a click mid-turn
     * leaves no deferred command preview above the editor.
     */
    showJobsSheet(): void;
    /** Mount every command panel queued for the current session while the agent was streaming. */
    flushPendingCommandOutput(): void;
    resetTranscript(): void;
    showStatus(message: string, options?: {
        dim?: boolean;
    }): void;
    showError(message: string): void;
    showPinnedError(message: string): void;
    clearPinnedError(): void;
    showWarning(message: string, options?: {
        hideWithToolActivity?: boolean;
    }): void;
    ensureLoadingAnimation(): void;
    setWorkingMessage(message?: string): void;
    applyPendingWorkingMessage(): void;
    showNewVersionNotification(newVersion: string): void;
    clearEditor(): void;
    updatePendingMessagesDisplay(): void;
    queueCompactionMessage(text: string, mode: "steer" | "followUp", images?: ImageContent[], options?: {
        preserveDraft?: boolean;
    }): void;
    flushCompactionQueue(options?: {
        willRetry?: boolean;
    }): Promise<void>;
    flushPendingBashComponents(): void;
    isKnownSlashCommand(text: string): boolean;
    addMessageToChat(message: AgentMessage, options?: {
        imageLinks?: readonly (string | undefined)[];
        reuseSettledComponent?: boolean;
    }): Component[];
    renderSessionContext(sessionContext: SessionContext, options?: RenderSessionContextOptions): void;
    /** Build a session context in bounded chunks so terminal input runs between event-loop turns. */
    renderSessionContextIncrementally(sessionContext: SessionContext, options: RenderSessionContextOptions, renderChunk?: () => void): Promise<void>;
    renderInitialMessages(options?: {
        preserveExistingChat?: boolean;
        clearTerminalHistory?: boolean;
    }): Promise<void>;
    /**
     * Reconcile the idle "F5 to Retry" status row with the transcript tail:
     * mount it when the last turn died on a tool call (Esc mid-execution,
     * stream failure) and the status row is free, remove it when stale. Runs at
     * turn end and after every transcript replay (startup resume, `/tree`,
     * session switch). The advertised key is the live `app.retry` binding,
     * dispatched by the editor to `InputController.handleRetry`.
     */
    syncRetryHintRow(): void;
    truncateTranscriptFromMessage(message: AgentMessage): boolean;
    findLastAssistantMessage(): AssistantMessage | undefined;
    extractAssistantText(message: AssistantMessage): string;
    handleExportCommand(text: string): Promise<void>;
    handleTraceCommand(): Promise<void>;
    handleDumpCommand(): Promise<void>;
    handleDumpAllCommand(): Promise<void>;
    handleAdvisorDumpCommand(isRaw?: boolean): void;
    handleDebugTranscriptCommand(): Promise<void>;
    handleShareCommand(): Promise<void>;
    handleTodoCommand(args: string): Promise<void>;
    handleSessionCommand(): Promise<void>;
    handleAdvisorStatusCommand(): Promise<void>;
    handleJobsCommand(options?: {
        full?: boolean;
    }): Promise<void>;
    handleUsageCommand(reports?: UsageReport[] | null): Promise<void>;
    handleChangelogCommand(args?: string): Promise<void>;
    handleHotkeysCommand(): void;
    handleToolsCommand(): void;
    handleContextCommand(): void;
    prepareSessionSwitch(): Promise<void>;
    handleClearCommand(): Promise<void>;
    handleFreshCommand(): Promise<void>;
    handleResetContextCommand(): Promise<void>;
    handleDeleteCommand(): Promise<void>;
    handleForkCommand(): Promise<void>;
    handleMoveCommand(targetPath?: string): Promise<void>;
    handleWorktreeCommand(branch?: string): Promise<void>;
    withBtwSessionMove(operation: () => Promise<boolean>): Promise<boolean>;
    handleRenameCommand(title: string): Promise<void>;
    handleMemoryCommand(text: string): Promise<void>;
    handleSTTToggle(): Promise<void>;
    dictationSpaceHold(target: DictationTarget): SpaceHoldHandler;
    /** Start a `/record` screen capture, or stop the running one and report where it was saved. */
    toggleRecording(): Promise<void>;
    /** Start or stop the Codex-backed realtime voice surface. */
    handleLiveCommand(): Promise<void>;
    showDebugSelector(): Promise<void>;
    showAgentHub(options?: AgentHubOpenOptions): void;
    resetObserverRegistry(): void;
    handleBashCommand(command: string, excludeFromContext?: boolean): Promise<void>;
    handlePythonCommand(code: string, excludeFromContext?: boolean): Promise<void>;
    handleMCPCommand(text: string): Promise<void>;
    handleSSHCommand(text: string): Promise<void>;
    handleCompactCommand(customInstructions?: string, mode?: CompactMode, beforeFlush?: (outcome: CompactionOutcome) => void | Promise<void>, internalGuidance?: string): Promise<CompactionOutcome>;
    handleHandoffCommand(customInstructions?: string): Promise<void>;
    handleShakeCommand(mode: ShakeMode): Promise<void>;
    executeCompaction(customInstructionsOrOptions?: string | CompactOptions, isAuto?: boolean): Promise<CompactionOutcome>;
    openInBrowser(urlOrPath: string): void;
    showSettingsSelector(): void;
    showUsageDashboard(reports: UsageReport[]): void;
    showAdvisorConfigure(): void;
    showHistorySearch(): void;
    showExtensionsDashboard(): void;
    showAgentsDashboard(): void;
    showGitUi(revision?: string): void;
    showModelSelector(options?: {
        temporaryOnly?: boolean;
    }): void;
    switchSessionModel(model: Model, thinkingLevel?: ConfiguredThinkingLevel): Promise<void>;
    showPluginSelector(mode?: "install" | "uninstall"): void;
    showUserMessageSelector(): void;
    showCopySelector(): void;
    showTreeSelector(): void;
    showThinkingSelector(): void;
    showSessionSelector(source?: ForeignSessionSource): void;
    handleResumeSession(sessionPath: string): Promise<void>;
    handleSessionDeleteCommand(): Promise<void>;
    showOAuthSelector(mode: "login" | "logout", providerId?: string): Promise<void>;
    showSessionPinSelector(): Promise<void>;
    showResetUsageSelector(): Promise<void>;
    showProviderSetup(): Promise<void>;
    showHookConfirm(title: string, message: string): Promise<boolean>;
    handleCtrlC(): void;
    handleCtrlD(): void;
    handleCtrlZ(): void;
    resetDisplayAfterAppearanceRefresh(): void;
    handleDequeue(): void;
    handleImagePaste(): Promise<boolean>;
    handleImagePathPaste(path: string): Promise<void>;
    /** Queue slash-command input behind the active turn. */
    handleQueueCommand(message: string, detached?: Pick<SubmittedUserInput, "text" | "images" | "imageLinks">): Promise<void>;
    handleBtwCommand(question: string): Promise<void>;
    handleTanCommand(work: string): Promise<void>;
    hasActiveBtw(): boolean;
    handleBtwEscape(): boolean;
    canBranchBtw(): boolean;
    /** Reserves plain `b` only after /btw has a completed branch action to handle. */
    handlesBtwBranchKey(): boolean;
    handleBtwBranchKey(): Promise<boolean>;
    canCopyBtw(): boolean;
    isGuidedGoalInterviewActive(): boolean;
    handleBtwCopyKey(): Promise<boolean>;
    canFollowUpBtw(): boolean;
    handleBtwFollowUpKey(): boolean;
    handleBtwBranch(question: string, assistantMessage: AssistantMessage, leafId: string, sessionId: string): Promise<void>;
    handleOmfgCommand(complaint: string): Promise<void>;
    hasActiveOmfg(): boolean;
    handleOmfgEscape(): boolean;
    handleCleanseCommand(args: string): Promise<void>;
    hasActiveCleanse(): boolean;
    handleCleanseEscape(): boolean;
    showCommandReport(options: {
        title: string;
        head?: TspText;
        body: Component;
    }): void;
    dismissCommandReport(): boolean;
    commandReportRows(): number | undefined;
    composerInputAtBottom(): boolean;
    pinComposerToBottom(): void;
    cycleThinkingLevel(): void;
    cycleRoleModel(direction?: "forward" | "backward"): Promise<void>;
    toggleToolOutputExpansion(): void;
    setToolsExpanded(expanded: boolean): void;
    toggleThinkingBlockVisibility(): void;
    toggleTodoExpansion(): void;
    setTodoExpanded(expanded: boolean): void;
    setTodos(todos: TodoItem[] | TodoPhase[]): void;
    reloadTodos(source?: AgentSession): Promise<void>;
    openExternalEditor(): void;
    registerExtensionShortcuts(): void;
    initHooksAndCustomTools(): Promise<void>;
    getToolUIContext(): ExtensionUIContext | undefined;
    emitCustomToolSessionEvent(reason: "start" | "switch" | "branch" | "tree" | "shutdown", previousSessionFile?: string): Promise<void>;
    setHookWidget(key: string, content: ExtensionWidgetContent, options?: ExtensionWidgetOptions): void;
    setHookStatus(key: string, text: string | undefined): void;
    showHookSelector(title: string, options: ExtensionUISelectItem[], dialogOptions?: InteractiveSelectorDialogOptions, extra?: {
        slider?: HookSelectorSlider;
    }): Promise<string | undefined>;
    hideHookSelector(): void;
    showHookInput(title: string, placeholder?: string): Promise<string | undefined>;
    hideHookInput(): void;
    showHookEditor(title: string, prefill?: string, dialogOptions?: ExtensionUIDialogOptions, editorOptions?: {
        promptStyle?: boolean;
    }): Promise<string | undefined>;
    hideHookEditor(): void;
    showHookNotify(message: string, type?: "info" | "warning" | "error"): void;
    showHookCustom<T>(factory: (tui: TUI, theme: Theme, keybindings: KeybindingsManager, done: (result: T) => void) => (Component & {
        dispose?(): void;
    }) | Promise<Component & {
        dispose?(): void;
    }>, options?: ExtensionCustomOptions): Promise<T>;
    showExtensionError(extensionPath: string, error: string): void;
    showToolError(toolName: string, error: string): void;
}
