import type { AgentMetricsSummary, AgentRecordLike, AgentStatus } from "./agent-hub-types.js";
import type { ObservableSession } from "./session-observer-registry.js";
export type AgentMetrics = AgentMetricsSummary;
export interface AggregateMetrics extends AgentMetrics {
    reportedAgents: number;
    /** Rows whose duration is an observer-measured active runtime. */
    activeDurationAgents: number;
}
interface AgentTreeProjection<TRecord extends AgentRecordLike> {
    rows: TRecord[];
    depthById: Map<string, number>;
    parentById: Map<string, string>;
    lastSiblingById: Map<string, boolean>;
}
export declare const STATUS_ORDER: Record<AgentStatus, number>;
/** Exact observer usage for one roster entry. */
export declare function progressMetrics(observed: ObservableSession | undefined): AgentMetrics | undefined;
/** Live session whose own messages back a row's metrics when no observer progress exists. */
export declare function hubFallbackStatsSession<TRecord extends AgentRecordLike>(ref: TRecord, observed: ObservableSession | undefined): NonNullable<TRecord["session"]> | undefined;
/**
 * One roster row's usage: live observer progress, then persisted history, then
 * the cached fallback read of a live session (populated by {@link aggregateMetrics}).
 */
export declare function hubRowMetrics<TRecord extends AgentRecordLike>(ref: TRecord, observed: ObservableSession | undefined, sessionMetrics: WeakMap<object, {
    metrics: AgentMetrics | undefined;
}>): AgentMetrics | undefined;
export declare function aggregateMetrics<TRecord extends AgentRecordLike>(args: {
    rows: readonly TRecord[];
    observedById: ReadonlyMap<string, ObservableSession>;
    metricsFor: (ref: TRecord, observed: ObservableSession | undefined) => AgentMetrics | undefined;
    fallbackStatsSession: (ref: TRecord, observed: ObservableSession | undefined) => NonNullable<AgentRecordLike["session"]> | undefined;
    sessionMetrics: WeakMap<object, {
        metrics: AgentMetrics | undefined;
    }>;
    refreshFallback: boolean;
}): {
    metrics: AggregateMetrics;
    hasFallbackLiveSessions: boolean;
};
/** Parent-before-child projection preserving the roster's stable sibling order. */
export declare function projectAgentTree<TRecord extends AgentRecordLike>(refs: readonly TRecord[]): AgentTreeProjection<TRecord>;
export {};
