import type { AssistantMessage, ImageContent, MessageAttribution, TextContent } from "@oh-my-pi/pi-ai";
import type { OutputMeta } from "../tools/output-meta.js";
import type { BranchSummaryMessage, CompactionSummaryMessage } from "@oh-my-pi/pi-agent-core/compaction/messages";
declare module "@oh-my-pi/pi-agent-core" {
    interface CustomAgentMessages {
        bashExecution: BashExecutionMessage;
        pythonExecution: PythonExecutionMessage;
        custom: CustomMessage;
        hookMessage: HookMessage;
        branchSummary: BranchSummaryMessage;
        compactionSummary: CompactionSummaryMessage;
        fileMention: FileMentionMessage;
    }
}
export { COLLAB_PROMPT_MESSAGE_TYPE, type CollabPromptDetails } from "@oh-my-pi/pi-wire";
export type { BranchSummaryMessage, CompactionSummaryMessage } from "@oh-my-pi/pi-agent-core/compaction/messages";
export declare const SKILL_PROMPT_MESSAGE_TYPE = "skill-prompt";
export declare const LSP_LATE_DIAGNOSTIC_MESSAGE_TYPE = "lsp-late-diagnostic";
export declare const BACKGROUND_TAN_DISPATCH_MESSAGE_TYPE = "background-tan-dispatch";
export declare const PREWALK_PLAN_MESSAGE_TYPE = "prewalk-plan";
/** Custom message type for the transient Vibe mode directive. */
export declare const VIBE_MODE_CONTEXT_MESSAGE_TYPE = "vibe-mode-context";
/** Fallback type for extension-injected messages that omit a custom type. */
export declare const DEFAULT_CUSTOM_MESSAGE_TYPE = "custom-message";
/** Custom message carrying a coding request delegated by the live voice model. */
export declare const LIVE_DELEGATION_MESSAGE_TYPE = "live-delegation";
/** Content shape accepted for extension-injected messages. */
export type CustomMessageContent = string | (TextContent | ImageContent)[];
/** Public input accepted by `pi.sendMessage` and `AgentSession.sendCustomMessage`. */
export type CustomMessagePayload<T = unknown> = string | Partial<Pick<CustomMessage<T>, "customType" | "content" | "display" | "details" | "attribution">>;
/** Custom message payload after applying runtime defaults. */
export type NormalizedCustomMessagePayload<T = unknown> = Pick<CustomMessage<T>, "customType" | "content" | "display" | "details" | "attribution">;
/** Details persisted on a `/tan` background-dispatch breadcrumb. */
export interface BackgroundTanDispatchDetails {
    jobId: string;
    work: string;
    /** Forked clone session file, named `<agentId>.jsonl`; the Agent Hub reads its transcript. */
    sessionFile: string;
}
export interface SkillPromptDetails {
    name: string;
    path: string;
    args?: string;
    /** The draft as submitted with its `/skill:<name>` token in place. A leading
     *  token renders as a skill callout, a mid-prompt token as an inline chip in
     *  a plain user bubble. Absent on sessions recorded before chips existed. */
    prompt?: string;
    lineCount: number;
    /** Internal: compact label shown for a queued custom message. Optional —
     *  non-streaming skill prompts never set it. Stripped from persisted
     *  `details` by `SessionManager.appendCustomMessageEntry` via the
     *  `INTERNAL_DETAILS_FIELDS` allowlist below. */
    __queueChipText?: string;
}
/** Sentinel value for `AssistantMessage.errorMessage` indicating that the abort
 *  was an *expected internal transition* (plan-mode → execution compaction)
 *  and must NOT surface as a red "Operation aborted" line. Distinct from
 *  `undefined` (default) so user-cancel aborts with no errorMessage still
 *  render normally. Persists through SessionManager so history replay
 *  branches identically.
 *
 *  Consumers: `AgentSession.#handleAgentEvent` (stamper) writes this value;
 *  `EventController.#handleMessageEnd`, `AssistantMessageComponent`,
 *  `ui-helpers.addMessageToChat` (renderers), `AgentHubOverlayComponent
 *  #buildTranscriptLines`, `runPrintMode`, and `AcpAgent#replayAssistantMessage`
 *  (fallback error emission) read it via `isSilentAbort`. */
export declare const SILENT_ABORT_MARKER = "__omp.silent_abort__";
/** Type-guard for silent aborts. Renderers MUST call this helper so structured
 *  `errorId` and legacy persisted marker messages stay in lockstep. */
export declare function isSilentAbort(message: Pick<AssistantMessage, "errorId" | "errorMessage">): boolean;
/** Reason threaded through `AbortController.abort(reason)` when the user aborts
 *  the turn with Esc (see `AgentSession.abort`). The agent keeps it on the
 *  aborted assistant message's `errorMessage` so queued follow-ups/tool-result
 *  placeholders can distinguish a deliberate interrupt from a bare lifecycle
 *  abort, but interactive renderers suppress this redundant transcript line. */
export declare const USER_INTERRUPT_LABEL = "Interrupted by user";
export declare function isUserInterruptAbort(message: Pick<AssistantMessage, "errorId" | "errorMessage">): boolean;
export declare function shouldRenderAbortReason(message: Pick<AssistantMessage, "errorId" | "errorMessage">): boolean;
/** Sentinel `errorMessage` the agent stamps on any abort that carried no custom
 *  reason (bare `abort()`). Renderers treat it as "no specific reason given". */
export declare const GENERIC_ABORT_SENTINEL = "Request was aborted";
/** Resolve the operator-facing label for an aborted assistant turn. A custom
 *  abort reason threaded onto `errorMessage` is returned verbatim; aborts with
 *  no threaded reason fall back to the retry-aware generic label. Call
 *  `shouldRenderAbortReason` before rendering when user interrupts should stay
 *  visually quiet. */
export declare function resolveAbortLabel(message: Pick<AssistantMessage, "errorId" | "errorMessage">, retryAttempt?: number): string;
/** True when a persisted or extension-supplied value can be sent as custom-message content. */
export declare function isCustomMessageContent(content: unknown): content is CustomMessageContent;
/** Normalizes extension-provided custom message input before it reaches session state or disk. */
export declare function normalizeCustomMessagePayload<T = unknown>(payload: CustomMessagePayload<T> | unknown): NormalizedCustomMessagePayload<T>;
/**
 * Message type for bash executions via the ! command.
 */
export interface BashExecutionMessage {
    role: "bashExecution";
    command: string;
    output: string;
    exitCode: number | undefined;
    cancelled: boolean;
    truncated: boolean;
    /** Images extracted from terminal graphics in the command's stdout. */
    images?: ImageContent[];
    meta?: OutputMeta;
    timestamp: number;
    /** If true, this message is excluded from LLM context (!! prefix) */
    excludeFromContext?: boolean;
}
/**
 * Message type for user-initiated Python executions via the $ command.
 * Shares the same kernel session as eval's Python backend.
 */
export interface PythonExecutionMessage {
    role: "pythonExecution";
    code: string;
    output: string;
    exitCode: number | undefined;
    cancelled: boolean;
    truncated: boolean;
    meta?: OutputMeta;
    timestamp: number;
    /** If true, this message is excluded from LLM context ($ prefix) */
    excludeFromContext?: boolean;
}
/**
 * Message type for extension-injected messages via sendMessage().
 */
export interface CustomMessage<T = unknown> {
    role: "custom";
    customType: string;
    content: CustomMessageContent;
    display: boolean;
    details?: T;
    /** Who initiated this message for billing/attribution semantics. */
    attribution?: MessageAttribution;
    timestamp: number;
}
/**
 * Legacy hook message type (pre-extensions). Kept for session migration.
 */
export interface HookMessage<T = unknown> {
    role: "hookMessage";
    customType: string;
    content: CustomMessageContent;
    display: boolean;
    details?: T;
    /** Who initiated this message for billing/attribution semantics. */
    attribution?: MessageAttribution;
    timestamp: number;
}
/**
 * Message type for auto-read file mentions via @filepath syntax.
 */
export interface FileMentionMessage {
    role: "fileMention";
    files: Array<{
        path: string;
        content: string;
        lineCount?: number;
        /** File size in bytes, if known. */
        byteSize?: number;
        /** Why the file contents were omitted from auto-read. */
        skippedReason?: "tooLarge" | "binary";
        image?: ImageContent;
    }>;
    timestamp: number;
}
/** True for a `/skill:<name>` prompt the user invoked directly (attribution `user`), as opposed to an agent/autoload injection. */
export declare function isUserInvokedSkillPrompt(message: CustomMessage): boolean;
/**
 * True for a custom message that initiates a user-attributed turn: a directly
 * invoked `/skill:` prompt or a writable-collab peer's prompt. Agent redirects,
 * reminders, and auto-continues are not turn starts.
 */
export declare function isUserTurnInitiator(message: CustomMessage): boolean;
export type AdvisorSeverity = "nit" | "concern" | "blocker";
/** One queued advice note. */
export interface AdvisorNote {
    note: string;
    severity?: AdvisorSeverity;
    /** Which configured advisor produced this note (omitted for the default advisor). */
    advisor?: string;
    /** Primary turns completed when note was emitted. */
    turn?: number;
    /** Primary turns elapsed before merged-batch delivery. */
    turnsAgo?: number;
}
/** Details payload on the batched `advisor` custom message rendered in the transcript. */
export interface AdvisorMessageDetails {
    notes: AdvisorNote[];
}
/** Custom message type for supervised process completions. */
export declare const LAUNCH_COMPLETION_MESSAGE_TYPE = "launch-completion";
