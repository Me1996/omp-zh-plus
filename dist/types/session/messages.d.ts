/**
 * Custom message types and transformers for the coding agent.
 *
 * Extends the base AgentMessage type with coding-agent specific message types,
 * and provides a transformer to convert them to LLM-compatible messages.
 */
import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
import { type BashExecutionMessage, type PythonExecutionMessage } from "@oh-my-pi/pi-tui-zh/chat/messages";
export { SKILL_PROMPT_MESSAGE_TYPE, LSP_LATE_DIAGNOSTIC_MESSAGE_TYPE, BACKGROUND_TAN_DISPATCH_MESSAGE_TYPE, PREWALK_PLAN_MESSAGE_TYPE, VIBE_MODE_CONTEXT_MESSAGE_TYPE, DEFAULT_CUSTOM_MESSAGE_TYPE, LIVE_DELEGATION_MESSAGE_TYPE, type CustomMessageContent, type CustomMessagePayload, type NormalizedCustomMessagePayload, type BackgroundTanDispatchDetails, type SkillPromptDetails, SILENT_ABORT_MARKER, isSilentAbort, USER_INTERRUPT_LABEL, isUserInterruptAbort, shouldRenderAbortReason, GENERIC_ABORT_SENTINEL, resolveAbortLabel, isCustomMessageContent, normalizeCustomMessagePayload, type BashExecutionMessage, type PythonExecutionMessage, type CustomMessage, type HookMessage, type FileMentionMessage, isUserInvokedSkillPrompt, isUserTurnInitiator, } from "@oh-my-pi/pi-tui-zh/chat/messages";
import type { AssistantMessage, Message } from "@oh-my-pi/pi-ai";
export { type BranchSummaryMessage, type CompactionSummaryMessage, createBranchSummaryMessage, createCompactionSummaryMessage, createCustomMessage, } from "@oh-my-pi/pi-agent-core/compaction/messages";
/**
 * Logs provider-error turns so their actual cause is available outside the
 * session transcript. No-op for non-error stop reasons.
 */
export declare function logProviderTurnError(msg: AssistantMessage): void;
/**
 * Removes replay-bound provider state before reparenting an assistant message
 * under a different user turn.
 */
export declare function sanitizeAssistantForReparentedHistory(message: AssistantMessage): AssistantMessage;
/**
 * Collapses degenerate repeated lines and bounds an ephemeral side-channel
 * reply to 4 KiB.
 */
export declare function dedupeEphemeralReply(text: string): string;
/**
 * Builds the recent user/assistant context supplied to title regeneration.
 * The session's opening request and the latest user request always lead the
 * context: in a long tool loop the recent window is all assistant notes, and
 * follow-ups ("fix all") rarely restate the goal, so without them title models
 * name the current micro-step (a file or symbol) instead of the session goal.
 */
export declare function buildReplanTitleContext(messages: AgentMessage[]): string;
/**
 * Words of thinking plus reply text a settled assistant message contributes to
 * {@link buildReplanTitleContext}. Deferred auto-titling accumulates these and
 * retitles once the assistant has said enough to reveal the task; aborted and
 * errored turns count zero.
 */
export declare function titleContextWordCount(message: AssistantMessage): number;
/**
 * Compares session messages by provider-replay semantics, ignoring runtime-only
 * fields that do not change a restored request.
 */
export declare function didSessionMessagesChange(previousMessages: AgentMessage[], nextMessages: AgentMessage[]): boolean;
/** Custom message type for hidden interrupted-thinking continuity context. */
export declare const INTERRUPTED_THINKING_MESSAGE_TYPE = "interrupted-thinking";
/** Custom message type for the transient checkpoint-active reminder. */
export declare const CHECKPOINT_ACTIVE_REMINDER_TYPE = "checkpoint-active-reminder";
/** Metadata persisted with a hidden interrupted-thinking continuity message. */
export interface InterruptedThinkingDetails {
    interruptedAt: number;
    provider: AssistantMessage["provider"];
    model: string;
    blockCount: number;
}
/** Pure helper result for persisting interrupted thinking outside the assistant turn. */
export interface DemotedInterruptedThinking {
    reasoning: string;
    strippedContent: AssistantMessage["content"];
    blockCount: number;
}
/**
 * Demote a trailing run of *incomplete* interrupted-thinking from an assistant
 * message — reasoning that was still streaming when the user aborted.
 *
 * A block joins the run only when it is a non-empty `thinking` block with no
 * `thinkingSignature`. A signed/complete thinking block (Anthropic signature,
 * OpenAI reasoning item id) is safely replayable, so it ends the run and stays
 * in place — as do `redactedThinking` encrypted blobs, text, tool calls,
 * empty-thinking blocks, and trailing empty text placeholders.
 */
export declare function demoteInterruptedThinking(message: Pick<AssistantMessage, "content">): DemotedInterruptedThinking | undefined;
/** A provider-rejection turn carrying nothing but the error flag: stopReason
 *  "error" with no text, thinking, or tool calls — e.g. a request the provider
 *  rejected before any output (an oversized 413 payload). Persisting it writes an
 *  empty assistant turn that replays on reload and re-sends the rejected context;
 *  the error is surfaced live (pinned) instead. A turn that streamed partial text,
 *  reasoning, or tool calls is NOT empty and stays in history. */
export declare function isEmptyErrorTurn(message: Pick<AssistantMessage, "stopReason" | "content">): boolean;
/** A `stop`/`toolUse` turn that produced nothing actionable. Any other stop
 *  reason is not an "empty stop": an `error`/`aborted` turn is a failure rather
 *  than an empty completion, and a `length` stop was cut off mid-output. */
export declare function isEmptyAssistantStop(message: Pick<AssistantMessage, "stopReason" | "content">): boolean;
/**
 * True when this assistant turn actually produced output, making its model the
 * one that served the run.
 *
 * Attribution asks this from two places that MUST reach the same verdict: the
 * live session, which flips a fallback to "served", and the offline walk
 * replaying a transcript. `error` and `aborted` are both failures — a stalled or
 * dropped stream is finalized as `aborted` with its partial block still
 * attached, so a stop reason alone is not proof.
 *
 * Actionable content is required on top of the empty-stop rule, which only
 * inspects `stop`/`toolUse`. A `length` stop burns the whole output budget
 * without necessarily emitting anything usable, and every other stop reason
 * bypasses that rule entirely.
 */
export declare function assistantTurnProducedOutput(message: Pick<AssistantMessage, "stopReason" | "content">): boolean;
/**
 * True when the turn emitted text, a tool call, or an image. Stricter than
 * {@link assistantTurnProducedOutput}: signed reasoning is replay-worthy but
 * delivers nothing, so length-stop recovery in `checkCompaction` treats a
 * reasoning-only truncation as budget burned (retry) rather than a truncated
 * deliverable (keep), and only a delivered turn resets its retry cap.
 */
export declare function assistantTurnDelivered(message: Pick<AssistantMessage, "content">): boolean;
/** Extract the optional `__queueChipText` field from a CustomMessage's
 *  `details` blob. Safe over `unknown`; returns undefined when the field is
 *  absent or non-string. */
export declare function readQueueChipText(details: unknown): string | undefined;
/** Explicit allowlist of `details` field names that are AgentSession-internal
 *  transient bookkeeping and MUST be removed before SessionManager persists
 *  the CustomMessageEntry to disk. Scoped intentionally narrow: only fields
 *  declared here are stripped. Adding a new entry is a deliberate, reviewed
 *  change — unrelated future payload fields are never silently dropped. */
export declare const INTERNAL_DETAILS_FIELDS: readonly ["__queueChipText"];
/** Return a `details` copy with every key in `INTERNAL_DETAILS_FIELDS`
 *  removed. Returns the input unchanged when there is nothing to strip
 *  (null/non-object, or no listed fields present) so callers don't pay a
 *  clone cost on the common path. */
export declare function stripInternalDetailsFields<T>(details: T | undefined): T | undefined;
export declare function wrapSteeringForModel(messages: AgentMessage[]): AgentMessage[];
/**
 * Strip image content blocks from `message` in place. Returns the count of
 * images removed across `content` (every role that carries `ImageContent`),
 * manual Bash `images`, and any tool-result `details.images` payload. Callers MUST rewrite session
 * entries (`SessionManager.rewriteEntries`) and replay them through
 * `Agent.replaceMessages` afterwards so persisted state and provider-side
 * caches stay aligned with the mutated tree — `stripImagesFromMessage` is a
 * pure local mutation and intentionally does neither.
 */
export declare function stripImagesFromMessage(message: AgentMessage): number;
/**
 * Replace every `ImageContent` block in already-converted LLM {@link Message}s
 * with a text placeholder, returning a new array only when something changed.
 *
 * Unlike {@link stripImagesFromMessage} (which mutates persisted `AgentMessage`s
 * in place), this operates on the ephemeral provider-request view produced by
 * {@link convertToLlm}, so history on disk keeps its images while the outbound
 * request is scrubbed. Used to keep image blocks off the wire when the active
 * model has no vision support (or `images.blockImages` is set) — e.g. after
 * switching from a vision model to a text-only one mid-session (#5400).
 *
 * Consecutive placeholder texts collapse into one so a message that was nothing
 * but images does not balloon into a run of identical notes.
 */
export declare function replaceLlmImagesWithText(messages: Message[], placeholder: string): Message[];
/**
 * Convert a BashExecutionMessage to user message text for LLM context.
 */
export declare function bashExecutionToText(msg: BashExecutionMessage): string;
/**
 * Convert a PythonExecutionMessage to user message text for LLM context.
 */
export declare function pythonExecutionToText(msg: PythonExecutionMessage): string;
export declare function sanitizeRehydratedOpenAIResponsesAssistantMessage(message: AssistantMessage): AssistantMessage;
/** Drop the outer-array shortcut when an owner replaces a live history in place. */
export declare function invalidateConvertToLlmArrayCache(messages: AgentMessage[]): void;
/**
 * Transform AgentMessages (including custom types) to LLM-compatible Messages.
 *
 * This is used by:
 * - Agent's transormToLlm option (for prompt calls and queued messages)
 * - Compaction's generateSummary (for summarization)
 * - Custom extensions and tools
 *
 * Settled history converts once and is reused per message identity: an
 * append-only turn on the same array re-pays only the new suffix, and an
 * unchanged re-convert of the same array hands back the same outer `Message[]`.
 * Owner mutations (prune/shake/strip-images) invalidate the affected message
 * through the shared registry before the next pass.
 */
export declare function convertToLlm(messages: AgentMessage[]): Message[];
