import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
/**
 * Field-selective identity hash for an advisor-visible message.
 *
 * Hashes every top-level field the advisor renderer actually reads (mirrors
 * `AppendOnlyContextManager.#messageDigest`, issue #3406). Unrendered metadata
 * (timestamp, usage, provider internals, message id) churns on provider
 * round-trips and re-deliveries, so it is deliberately excluded: two messages
 * with the same rendered content hash equal even when their ids/timestamps
 * differ.
 *
 * Two consumers depend on this equality:
 * - {@link AdvisorRuntime} tracks the delivered-prefix identity so an
 *   equivalent clone does not trigger a full-transcript replay.
 * - {@link AdvisorTranscriptRecorder} skips re-persisting a replayed
 *   "session update" batch that carries no new content.
 *
 * Returns `undefined` when the payload cannot be serialized; callers treat that
 * as "no identity" and fall back to always delivering/persisting.
 */
export declare function fingerprintMessage(message: AgentMessage): bigint | undefined;
