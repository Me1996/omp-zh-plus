import { AssistantMessageComponent } from "@oh-my-pi/pi-tui-zh/chat/assistant-message";
import { ToolExecutionComponent, type ToolExecutionHandle } from "@oh-my-pi/pi-tui-zh/chat/tool-execution";
import type { InteractiveModeContext } from "../../modes/types.js";
import type { AgentSessionEvent } from "../../session/agent-session.js";
export declare class EventController {
    #private;
    private ctx;
    constructor(ctx: InteractiveModeContext);
    /** Rearm idle compaction after a live idle setting changes. */
    refreshIdleCompactionTimer(): void;
    /** Rearm (or cancel) the idle recap after a live `recap.*` setting change. */
    refreshIdleRecapTimer(): void;
    dispose(): void;
    inheritReadToolAssistant(toolCallId: string, component: AssistantMessageComponent | undefined): void;
    subscribeToAgent(): void;
    /** Whether `#handleToolExecutionStart` has fired for this call id this turn. */
    hasToolExecutionStarted(toolCallId: string): boolean;
    /**
     * Clear every transcript-anchored/turn-scoped piece of state. Used by the
     * session focus proxy when re-pointing the transcript at another session:
     * components, timers, and stream-reveal state all reference the previous
     * session's transcript and must not bleed into the new one.
     */
    resetTranscriptAnchors(): void;
    /** Settle replay-created cards without waiting for another streaming update. */
    restorePendingToolResults(): void;
    handleEvent(event: AgentSessionEvent): Promise<void>;
    /**
     * Detach both displacement trackers and return whichever components were
     * live, without touching their animation state. `#handleToolExecutionEnd`
     * settles a displaceable `wait`/`todo` result out of `pendingTools` into
     * these trackers instead (see the `isDisplaceableBlock()` branch there), so
     * a caller that enumerates only `pendingTools` before replacing the whole
     * transcript — the collab guest resync (`guest.ts#finalizeSnapshot`) —
     * misses a still-animated "waiting" card. That caller must fold this
     * method's result into its own live-block accounting.
     */
    takeDisplaceableComponents(): ToolExecutionHandle[];
    /**
     * Adopt a rebuilt-tail todo snapshot as the controller's tracked live
     * snapshot. Used by rebuild paths (settings/extensions overlay close, focus
     * attach, /resume) to preserve displacement continuity when a turn is still
     * active — without this, the next same-turn `todo` update would stack
     * another panel because the controller's tracker was reset before rebuild.
     * Drops the candidate when it is no longer a displaceable todo.
     */
    inheritDisplaceableTodo(component: ToolExecutionComponent | null | undefined): void;
    /**
     * Adopt the rebuild's replayed user-prompt timestamp so a still-running turn
     * keeps its prompt→yield delta. Focus attach and mid-turn rebuilds reset the
     * controller's turn start before replaying entries; without the handoff the
     * in-flight assistant `message_end` would render the usage row without the
     * elapsed figure. Mirrors {@link inheritDisplaceableTodo}. Drops the
     * candidate when the rebuild saw no user message.
     */
    inheritTurnStart(turnStartedAt: number | undefined): void;
    /**
     * Re-register parked background task cards after a transcript rebuild so a
     * detached task's replayed and live progress frames keep routing to the
     * preserved component. Focus attach clears {@link #backgroundTaskCallIds}
     * via {@link resetTranscriptAnchors} before the rebuild repopulates it.
     * Ids whose component did not survive into `pendingTools` are skipped.
     */
    markBackgroundTaskCalls(toolCallIds: Iterable<string>): void;
    sendErrorNotification(event: Extract<AgentSessionEvent, {
        type: "agent_end";
    }>): void;
    sendCompletionNotification(event: Extract<AgentSessionEvent, {
        type: "agent_end";
    }>): void;
}
