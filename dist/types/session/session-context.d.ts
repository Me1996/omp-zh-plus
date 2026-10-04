import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
import { type OpenAIResponsesHistoryPayload, type ServiceTierByFamily } from "@oh-my-pi/pi-ai";
import * as snapcompact from "@oh-my-pi/snapcompact";
import { type CompactionEntry, type CustomMessageEntry, type SessionEntry, type SessionMessageEntry } from "./session-entries.js";
export interface SessionContext {
    messages: AgentMessage[];
    thinkingLevel?: string;
    /** Configured thinking selector (`"auto"` or a concrete level) from the latest change. */
    configuredThinkingLevel?: string;
    serviceTier?: ServiceTierByFamily;
    /** Model roles: { default: "provider/modelId", small: "provider/modelId", ... } */
    models: Record<string, string>;
    /** Names of TTSR rules that have been injected this session */
    injectedTtsrRules: string[];
    /** Active mode (e.g. "plan") or "none" if no special mode is active */
    mode: string;
    /** Mode-specific data from the last mode_change entry */
    modeData?: Record<string, unknown>;
    /**
     * Array parallel to messages, indicating which assistant turns should
     * have their prompt-cache misses suppressed/explained (because a model,
     * compaction, or plan-mode transition directly preceded them).
     * Only populated in transcript mode.
     */
    cacheMissExplainedAt?: boolean[];
}
/** Lists session model strings to try when restoring, in fallback order. */
export declare function getRestorableSessionModels(models: Readonly<Record<string, string>>, lastModelChangeRole: string | undefined): string[];
export declare function getLatestCompactionEntry(entries: SessionEntry[]): CompactionEntry | null;
export interface BuildSessionContextOptions {
    /**
     * Build the display transcript instead of the LLM context. By default this
     * preserves every path entry with compactions inline; set
     * `collapseCompactedHistory` for the live TUI surface to render only the
     * latest compacted tail.
     */
    transcript?: boolean;
    /** In transcript mode, elide entries replaced by the latest compaction. */
    collapseCompactedHistory?: boolean;
    /**
     * Transcript mode only: keep `toolCall` blocks that have no matching
     * `toolResult` on the path instead of stripping them. Pass this when the
     * session is mid-turn (a tool is still executing, its result not yet
     * persisted) so the rebuilt transcript renders the in-flight call as
     * pending; without it a focus/unfocus or overlay-close rebuild silently
     * hides the call the agent is still waiting on.
     */
    keepDanglingToolCalls?: boolean;
    /** Price and resolve persisted snapcompact frame payloads on demand. */
    resolveFrameData?: (data: string) => snapcompact.LazyFrameData | undefined;
}
/**
 * Display-only marker set on transcript assistant messages whose dangling
 * `toolCall` blocks were stripped (no paired result on the resolved path —
 * failed/retried turns, results on sibling branches). The TUI renders a
 * placeholder row from it so the turn's activity never silently vanishes.
 */
export interface StrippedToolCallsMarker {
    strippedToolCalls?: number;
}
/** Reads validated OpenAI Responses replacement history from a compaction entry. */
export declare function getOpenAiRemoteCompactionPayload(compaction: Pick<CompactionEntry, "preserveData"> | null | undefined): OpenAIResponsesHistoryPayload | undefined;
/** Session entries that replay as transcript messages: persisted messages and custom messages. */
export type TranscriptEntry = SessionMessageEntry | CustomMessageEntry;
export declare function isTranscriptEntry(entry: SessionEntry): entry is TranscriptEntry;
export declare function buildSessionContext(entries: SessionEntry[], leafId?: string | null, byId?: Map<string, SessionEntry>, options?: BuildSessionContextOptions): SessionContext;
