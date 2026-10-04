/**
 * Resolves the {@link Judge} that answers typed judgments through the `judge`
 * model role. The chain is re-resolved at most every {@link CANDIDATE_TTL_MS}
 * so live catalog discovery, role edits, credential changes, and session
 * fallback all take effect without recreating feature consumers, while bulk
 * callers (`judge_batch`) do not re-scan the whole catalog per item.
 *
 * Every provider attempt is attributed exactly once: native System One
 * requests by {@link nativeJudge}, prompted chat attempts by the chat
 * backend's `onAttempt`. Each report reaches both {@link JudgeDeps.onUsage}
 * (the session ledger) and one `judgment` telemetry span, so a judgment backed
 * by a chat model is never billed again from its aggregated result.
 */
import { type AgentTelemetryConfig } from "@oh-my-pi/pi-agent-core";
import { type AssistantMessage, type Judge, type JudgeOptions, type JudgmentRequest, type JudgmentResult, type Model, type Questions, type Usage } from "@oh-my-pi/pi-ai";
import type { ModelRegistry } from "../config/model-registry.js";
import { type RoleChainCandidate } from "../config/model-resolver.js";
import type { Settings } from "../config/settings.js";
import type { SessionManager } from "../session/session-manager.js";
import type { JudgmentCache } from "./cache.js";
export * from "./cache.js";
/** Usage of one billed judgment attempt, recorded on the session ledger by callers. */
export interface JudgmentUsage {
    /** Why the judgment ran; see {@link JudgeDeps.purpose}. */
    purpose: string;
    /** Model role the call resolved through, or `typesafe` for native judgments. */
    role: string;
    api: string;
    provider: string;
    model: string;
    usage: Usage;
    stopReason: AssistantMessage["stopReason"];
    errorMessage?: string;
}
export interface JudgeDeps {
    settings: Settings;
    registry: ModelRegistry;
    /** The session's active model, appended when the judge role does not already route to it. */
    sessionModel?: Model;
    sessionId?: string;
    metadataResolver?: (provider: string) => Record<string, unknown> | undefined;
    /** Why the judgment runs (`find`, `ttsr`, `judge_batch`, …); labels ledger entries and telemetry spans. */
    purpose: string;
    /**
     * Receives every billed attempt exactly once — failed ones included, cache
     * hits never. Wire {@link journalJudgmentUsage} here to bill the session.
     */
    onUsage?: (usage: JudgmentUsage) => void;
    /** Host telemetry; every attempt, cache hits included, emits one `judgment` span. */
    telemetry?: AgentTelemetryConfig;
    /** Answer cache for native judgments; omitted runs every question against the provider. */
    cache?: JudgmentCache;
}
/** Session journal surface that records off-transcript model cost; journal-only managers omit it. */
export type JudgmentUsageLedger = Pick<SessionManager, "appendModelUsage" | "getSessionId" | "getLeafId">;
/**
 * Build a {@link JudgeDeps.onUsage} that journals every billed judgment attempt
 * as a `model_usage` entry beneath the session leaf at record time, so
 * `getSessionStats()` counts it in session totals. Attempts that land after
 * the session changes are dropped by the ledger. Returns `undefined` when the
 * journal cannot record usage.
 */
export declare function journalJudgmentUsage(manager: Partial<JudgmentUsageLedger> | undefined): JudgeDeps["onUsage"];
/** Which backend a judge-role candidate routes to: native System One decisions, on-device keywords, or a chat model. */
export type JudgeKind = "native" | "local" | "online";
/** Classify a role candidate by model API, never by provider identity. */
export declare function kindOf(candidate: RoleChainCandidate): JudgeKind;
export declare function kindOf(model: Model): JudgeKind;
/**
 * Whether the `judge` role resolves first to a native System One backend
 * (TypeSafe jev, directly or through OpenRouter) rather than a prompted
 * on-device or chat model. Judge-heavy features gate on it, e.g. the `find`
 * tool under `find.enabled: auto`.
 */
export declare function hasNativeJudge(settings: Settings, registry: ModelRegistry): boolean;
/** Resolve a live judge-role chain. Candidates resolve lazily and are reused for {@link CANDIDATE_TTL_MS}. */
export declare function resolveJudge(deps: JudgeDeps): ChainJudge;
/**
 * Judge facade that falls through the live `judge` role chain. `withCandidate`
 * lets a caller choose candidate-specific questions while retaining the exact
 * same credential, failure, timeout, and abort semantics as ordinary `judge`.
 */
export declare class ChainJudge implements Judge {
    #private;
    readonly label = "judge role chain";
    constructor(deps: JudgeDeps);
    judge<Q extends Questions>(request: JudgmentRequest<Q>, options?: JudgeOptions): Promise<JudgmentResult<Q>>;
    /**
     * Model of the first judge-role candidate, i.e. the one a judgment routes to
     * when it is credentialed and healthy. Used to price work before running it;
     * undefined when no candidate resolves.
     */
    primaryModel(): Model | undefined;
    withCandidate<T>(run: (judge: Judge, kind: JudgeKind) => Promise<T>, options?: JudgeOptions): Promise<T>;
}
