/**
 * Hindsight memory backend.
 *
 * Wires the per-session lifecycle (recall on first turn, retain every Nth
 * agent_end, etc.) on top of the AgentSession event stream. Hindsight runtime
 * state is owned by the AgentSession so lifetime follows the actual domain
 * owner instead of a parallel session-id registry.
 */
import type { MemoryBackend } from "../memory-backend/types.js";
import type { AgentSession } from "../session/agent-session.js";
/** Reload the active session's mental-model cache and prompt. */
export declare function reloadMentalModelsForSession(session: AgentSession): Promise<boolean>;
export declare const hindsightBackend: MemoryBackend;
/**
 * Finish the memory rebind that a cwd move started, before the move reports
 * success. The settings reload may already have started a backend switch or a
 * rebuild for changed `hindsight.*` values: let it settle first, so the rebind
 * never judges a half-switched runtime, then redo the destination's own
 * transition and re-raise its failure instead of letting a half-rebound
 * session look like a completed move.
 *
 * The rebuild is also requested here rather than only awaited, because the
 * bank scope derives from the cwd itself: a move between projects with
 * identical settings changes no setting, yet must still re-route the bank.
 */
export declare function rebindMemoryBackendForCwd(session: AgentSession): Promise<void>;
