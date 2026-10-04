import type { AgentSessionEvent } from "../../session/agent-session.js";
import type { ExtensionRunner } from "./runner.js";
import type { AgentEndEvent, AutoCompactionEndEvent, AutoCompactionStartEvent, AutoRetryEndEvent, AutoRetryStartEvent, MessageEndEvent, MessageStartEvent, MessageUpdateEvent, RetryFallbackAppliedEvent, RetryFallbackSucceededEvent, TodoReminderEvent, ToolExecutionEndEvent, ToolExecutionStartEvent, ToolExecutionUpdateEvent, TtsrTriggeredEvent, TurnEndEvent, TurnStartEvent } from "./types.js";
import type { GoalUpdatedEvent } from "../shared-events.js";
/** Extension events `extensionEventFromSessionEvent` maps onto. */
export type MappedExtensionEvent = {
    type: "agent_start";
} | AgentEndEvent | TurnStartEvent | TurnEndEvent | MessageStartEvent | MessageUpdateEvent | MessageEndEvent | ToolExecutionStartEvent | ToolExecutionUpdateEvent | ToolExecutionEndEvent | AutoCompactionStartEvent | AutoCompactionEndEvent | AutoRetryStartEvent | AutoRetryEndEvent | RetryFallbackAppliedEvent | RetryFallbackSucceededEvent | TtsrTriggeredEvent | TodoReminderEvent | GoalUpdatedEvent;
/**
 * Map a session event onto the extension event `AgentSession` emits for it
 * (see `#emitExtensionEvent` there). Returns `null` for events with no
 * extension counterpart, so callers skip the runner entirely instead of
 * emitting a no-op.
 *
 * @param event Session event (locally emitted or mirrored over the collab wire).
 * @param turnIndex Zero-based turn counter the caller owns; `AgentSession`
 *   resets it on `agent_start`, the collab guest's {@link GuestLifecycleEmitter}
 *   does the same for its mirrored stream.
 */
export declare function extensionEventFromSessionEvent(event: AgentSessionEvent, turnIndex: number): MappedExtensionEvent | null;
/**
 * Mirrors lifecycle-relevant collab guest events into an `ExtensionRunner`.
 *
 * Owns the per-join turn index the session maintains for its own extension
 * events (`#turnIndex`): the wire's turn_start/turn_end carry no counter, so
 * this class numbers turns itself exactly like `AgentSession` numbers its
 * own (zero-based, reset on `agent_start`, incremented after each
 * `turn_end`).
 *
 * Emissions are chained onto one promise queue — like the session's
 * `#queueExtensionEvent` — so handler completion order matches event order
 * even when a handler awaits. Unlike the session, delivery is never awaited
 * inline: a slow extension handler must not stall the guest's frame
 * application.
 */
export declare class GuestLifecycleEmitter {
    #private;
    get sawAgentStart(): boolean;
    emit(runner: ExtensionRunner, event: AgentSessionEvent): void;
}
