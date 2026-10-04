import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
import type { AssistantMessage } from "@oh-my-pi/pi-ai";
import type { RestoredQueuedMessage } from "./agent-session-types.js";
import { type CustomMessage } from "./messages.js";
/** Whether a queued message should render in the queue UI. */
export declare function isDisplayableQueuedMessage(message: AgentMessage): boolean;
/** Whether a queued message is an advisor card. */
export declare function isAdvisorCard(message: AgentMessage): message is CustomMessage;
/** Whether a message is a terminal assistant answer containing text and no tools. */
export declare function isTerminalTextAssistantAnswer(message: AgentMessage | undefined): message is AssistantMessage;
/** Whether a queued message is a user prompt: any user-role turn, or a visible user-attributed custom prompt. */
export declare function isUserQueuedMessage(message: AgentMessage): boolean;
/**
 * Whether a queued user prompt was authored by the user rather than handed off by an
 * agent. Queue editing (chips, removal, promotion, editor restore) only touches these.
 */
export declare function isUserAuthoredQueuedMessage(message: AgentMessage): boolean;
/** Hidden companion carrying vision descriptions for a text-only model. */
export declare const IMAGE_ATTACHMENT_DESCRIPTION_TYPE = "image-attachment-description";
/** Hidden companion carrying the source path of a video contact sheet. */
export declare const VIDEO_ATTACHMENT_TYPE = "video-attachment";
/** Hidden companion carrying the source path of a pasted or dropped image. */
export declare const IMAGE_ATTACHMENT_TYPE = "image-attachment";
/** Whether a hidden queued message is a companion of an adjacent user prompt. */
export declare function isHiddenUserCompanion(message: AgentMessage): boolean;
/** Human-readable text shown for a queued-message chip. */
export declare function queueChipText(message: AgentMessage): string;
/** Converts a queued user message to editor-restorable content. */
export declare function toRestoredQueuedMessage(message: AgentMessage): RestoredQueuedMessage;
