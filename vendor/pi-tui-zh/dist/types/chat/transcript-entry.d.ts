import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
import type { ImageContent, MessageAttribution, TextContent } from "@oh-my-pi/pi-ai";
import { type CustomMessage, type CustomMessageContent } from "./messages.js";
/** Persisted message fields consumed by transcript rendering. */
export interface SessionMessageEntryLike {
    type: "message";
    id: string;
    parentId: string | null;
    timestamp: string;
    message: AgentMessage;
}
/** Persisted custom-message fields consumed by transcript rendering. */
export interface CustomMessageEntryLike {
    type: "custom_message";
    id: string;
    parentId: string | null;
    timestamp: string;
    customType: string;
    content: CustomMessageContent;
    details?: unknown;
    display: boolean;
    attribution?: MessageAttribution;
}
/** Entries that replay as visible or hidden transcript messages. */
export type TranscriptEntryLike = SessionMessageEntryLike | CustomMessageEntryLike;
/** Restore a persisted custom message, rejecting unsendable content. */
export declare function customMessageEntryMessage(entry: CustomMessageEntryLike): CustomMessage | undefined;
/** Restore the message represented by a transcript entry. */
export declare function transcriptEntryMessage(entry: TranscriptEntryLike): AgentMessage | undefined;
/** Identify user-authored requests among transcript and metadata entries. */
export declare function isUserRequestEntry(entry: TranscriptEntryLike | {
    type: string;
}): boolean;
/**
 * Recent transcript tail starting at a user-request boundary, so tool calls
 * and results stay together. ChatTranscriptBuilder drops a tool result whose
 * initiating call was sliced away, so a tail of orphaned results can leave
 * the picker without any target.
 *
 * A whole user turn may exceed `limit`; paginate rendering if one turn grows too large.
 */
export declare function recentTranscriptEntries(entries: TranscriptEntryLike[], limit?: number): TranscriptEntryLike[];
/** Editable user request text, preserving skill invocation syntax. */
export declare function userTurnDraft(entry: TranscriptEntryLike): string | undefined;
/** Extract text blocks verbatim, optionally separating block boundaries. */
export declare function textContent(content: string | ReadonlyArray<{
    type: string;
    text?: string;
}>, separator?: string): string;
/** Well-formed image blocks in order: a `[Image #N]` marker in the text names the Nth. */
export declare function imageContent(content: string | ReadonlyArray<TextContent | ImageContent>): ImageContent[];
/** Join text blocks with spaces and collapse whitespace into a single-line label. */
export declare function userMessageLabel(content: string | ReadonlyArray<{
    type: string;
    text?: string;
}>): string;
