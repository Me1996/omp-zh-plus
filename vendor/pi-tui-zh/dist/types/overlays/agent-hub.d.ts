/**
 * Agent Hub overlay component.
 *
 * One overlay, two views:
 * - Table view: every registered agent except Main (Main IS the ambient
 *   chat), live from the global AgentHubRegistry — status, unread irc count,
 *   current/last task, last activity. Navigate with keys, wheel, hover, and
 *   click; `r` revives a parked agent, `x` aborts + releases one.
 * - Chat view: per-agent transcript (incremental session-file tail, absorbed
 *   from the old session observer overlay) plus an input line. Submitting
 *   revives a parked agent, then prompts/steers it; the message lands in the
 *   agent's persisted history via the normal prompt path.
 *
 * Replaces the old SessionObserverOverlayComponent (ctrl+s observer).
 */
import type { AgentTool } from "@oh-my-pi/pi-agent-core";
import { Container, type TUI } from "../tui.js";
import { type SelectListMouseTarget } from "../mouse.js";
import { type AgentActivitySource } from "./agent-activity.js";
import { type KeyId } from "../app-keybindings.js";
import type { MessageRenderer } from "../chat/extension-types.js";
import type { AgentLifecycleLike, IrcBusLike } from "./agent-hub-types.js";
import { type AgentRecordLike, type AgentHubRegistry } from "./agent-hub-types.js";
import type { SessionObserverRegistry } from "./session-observer-registry.js";
import { type AgentTranscriptSource } from "./agent-transcript-viewer.js";
import type { AgentRoleDisplay } from "./agent-hub-renderer.js";
import { type DescribeContext, type NativeNode, type NativeUiEvent } from "../native/node.js";
export type AgentHubSection = "agents" | "activity";
/** Result of one host-backed transcript read for the Agent Hub viewer. */
export interface AgentHubRemoteTranscript {
    text: string;
    newSize: number;
    /** Terminal read failure reported by the host; guests should surface it instead of retrying hot. */
    error?: string;
}
/** Guest-side proxy for hub actions executed on the collab host. */
export interface AgentHubRemote {
    chat(id: string, text: string): void;
    kill(id: string): void;
    revive(id: string): void;
    /** Mirrors readFileIncremental: text from fromByte (complete JSONL lines), newSize = next fromByte base; null = temporarily unavailable. */
    readTranscript(id: string, fromByte: number): Promise<AgentHubRemoteTranscript | null>;
}
export interface AgentHubDeps<TRecord extends AgentRecordLike = AgentRecordLike> {
    /** Progress/status snapshot source (task lifecycle + progress channels). */
    observers: SessionObserverRegistry;
    /** Resolve the current display metadata for a model role. */
    getRoleInfo?: (role: string) => AgentRoleDisplay;
    /** Host-backed transcript parsing and local reads. */
    transcript: AgentTranscriptSource;
    /** Register persisted roster entries while the overlay remains alive. */
    loadPersisted: (shouldContinue: () => boolean) => Promise<void>;
    /** Keys that toggle the hub closed from inside (app.agents.hub + app.session.observe). */
    hubKeys: KeyId[];
    onDone: () => void;
    requestRender: () => void;
    /** Registry supplying the roster. */
    registry: AgentHubRegistry<TRecord>;
    /** Resolve lifecycle actions lazily when a local action needs them. */
    lifecycle: () => AgentLifecycleLike<TRecord>;
    /** Host message bus supplying unread counts. */
    irc: IrcBusLike;
    /** TUI handle for transcript components; tests omit it and get a render-only stub. */
    ui?: TUI;
    /** Tool lookup for transcript renderers (labels, custom render functions). */
    getTool?: (name: string) => AgentTool | undefined;
    /** Whether the active registry entry came from a built-in factory. */
    isBuiltInTool?: (name: string) => boolean;
    /** Extension message renderers for custom messages in the transcript. */
    getMessageRenderer?: (customType: string) => MessageRenderer | undefined;
    /** Cwd used by tool renderers for path shortening; defaults to the project dir. */
    cwd?: string;
    /** Mirrors the main transcript's thinking-block visibility. */
    hideThinkingBlock?: () => boolean;
    proseOnlyThinking?: () => boolean;
    /** Keys toggling tool output expansion (app.tools.expand). */
    expandKeys?: KeyId[];
    /** Focus the main view on this agent's live session (ctx.focusAgentSession). When absent (collab guest, tests), Enter opens the in-hub chat view instead. */
    focusAgent?: (id: string) => Promise<void>;
    /** Current main session file; used to seed parked historical subagents after restart. */
    sessionFile?: string | null;
    /** Initial top-level projection; slash commands deep-link into this surface. */
    initialSection?: AgentHubSection;
    /** Unified local or remote activity source. */
    activity: AgentActivitySource;
    /** Whether observer progress should update live activity rows. */
    manageActivityLive?: boolean;
    /** Collab guest: route actions/transcripts to the host instead of local sessions. */
    remote?: AgentHubRemote;
}
export declare class AgentHubOverlayComponent<TRecord extends AgentRecordLike = AgentRecordLike> extends Container implements SelectListMouseTarget {
    #private;
    /** Resolves after persisted historical subagents have been registered and rows refreshed. */
    readonly persistedSubagentsReady: Promise<void>;
    constructor(deps: AgentHubDeps<TRecord>);
    /**
     * Whether the current table view has no agents to show (every registered agent
     * except Main). Persisted historical rows may arrive later; callers that need
     * those included must wait for {@link persistedSubagentsReady} first.
     */
    get isEmpty(): boolean;
    /** Tear down every subscription and timer. Called by the overlay owner on close. */
    dispose(): void;
    render(width: number): readonly string[];
    handleInput(keyData: string): void;
    /**
     * Seed the table's left-left close detector with the current time so a single
     * subsequent `←` (within {@link LEFT_TAP_WINDOW_MS}) dismisses the hub.
     *
     * The editor's own double-tap detector consumes the `←←` that opens the hub,
     * leaving this detector at its fresh `0` — without this handoff the user would
     * have to press `←←` a second time to escape. Called by the opener when the hub
     * was raised by that gesture.
     */
    armCloseTap(): void;
    /**
     * Open the fullscreen transcript viewer for an agent id (public for table Enter
     * and tests). Mounts {@link AgentTranscriptViewer} as a `fullscreen` overlay so it
     * owns the alternate screen; the hub table stays mounted underneath and is
     * restored when the viewer closes. No-op without a real TUI (render-only test stub).
     */
    openChat(id: string, entryId?: string): void;
    /** A `picker` is its own sheet: the backend mounts it in `layer` without an `overlay` wrapper. */
    nativeSheet(cx: DescribeContext): boolean;
    describe(cx: DescribeContext): NativeNode;
    /**
     * Pointer actions on the described hub. `select` mirrors keyboard selection
     * (roster row, activity row, section tab, projection tab); `activate` does
     * what Enter does on that row. Picker actions run the key handlers' paths.
     */
    handleNativeEvent(event: NativeUiEvent): void;
    handleWheel(delta: -1 | 1): void;
    hitTest(line: number): number | undefined;
    setHoverIndex(index: number | null): void;
    clickItem(index: number): void;
}
