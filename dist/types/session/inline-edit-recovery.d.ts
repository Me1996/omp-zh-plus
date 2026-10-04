/**
 * Recovery for sloppy edit payloads the model emits as plain assistant text
 * instead of an `edit` tool call. The finalized message is rewritten in place
 * (via the agent's `transformAssistantMessage` hook) before it reaches the
 * context, the UI, or tool dispatch: the payload text is lifted out of the
 * text block and re-materialized as a synthetic `edit` tool call, so the
 * normal tool pipeline — validation, approval tiering, execution, rendering,
 * journaling, provider replay — runs it unchanged.
 */
import type { AssistantMessage } from "@oh-my-pi/pi-ai";
/**
 * Convert stray sloppy payloads in `message`'s text blocks into one synthetic
 * `edit` tool call. Mutates the message in place; returns the number of
 * payload regions recovered (0 = message untouched).
 *
 * Fires only on a clean `stop` turn with no tool calls: a `length`-truncated
 * payload must never execute half an edit, and a turn that already carries
 * tool calls handled its own edits (any quoted payload there is commentary).
 */
export declare function recoverInlineSloppyEdit(message: AssistantMessage): number;
