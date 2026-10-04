import type { ModelCost, Usage } from "@oh-my-pi/pi-catalog/types";
export declare const RATCHET_ROOT: string;
export declare const RATCHET_STAGES: readonly ["inputs", "grader", "plan"];
export type RatchetStage = (typeof RATCHET_STAGES)[number];
export type Direction = "higher" | "lower";
export type RoundDecision = "baseline" | "keep" | "revert" | "rerun";
export type Verdict = "up" | "down" | "flat";
export interface RatchetGoal {
    /** Metric the loop optimizes: a `grade` key (`score` for scalar grades), `cost_usd`, `latency_s`, or a numeric row field. */
    target: string;
    direction: Direction;
    /** Guardrail metrics that must not regress outside noise. */
    hold: string[];
    /** Direction overrides for guardrails; `cost_usd`/`latency_s` default to lower, everything else to higher. */
    directions: Record<string, Direction>;
}
/** Per-million-token rates for a model the catalog cannot price. */
export interface RatchetPrice {
    in: number;
    out: number;
    cache_read?: number;
    cache_write?: number;
}
export interface SplitSummary {
    /** Cases with at least one scored rep. */
    n: number;
    mean: number | null;
    /** 95% CI half-width over case means; null below two cases. */
    half: number | null;
}
export interface PairedDelta extends SplitSummary {
    verdict: Verdict;
}
export interface RatchetRound {
    round: number;
    variant: string;
    change: string;
    decision: RoundDecision;
    reasons: string[];
    train: Record<string, SplitSummary>;
    test: Record<string, SplitSummary>;
    errors: number;
    truncated: number;
    at: string;
}
export interface RatchetState {
    version: 1;
    flow: string;
    cases_paths: string[];
    harness_paths: string[];
    change_paths: string[];
    off_limits: string[];
    /** Runner command; `{variant}` and `{flow_dir}` are substituted by `check`. */
    command?: string;
    goal?: RatchetGoal;
    reps?: number;
    stop: {
        plateau: number;
        rounds?: number;
    };
    train_ids: string[];
    test_ids: string[];
    split_seed?: number;
    /** Inputs digest the baseline was run against; a different case set needs a new flow. */
    baseline_inputs_sha?: string;
    approvals: Partial<Record<RatchetStage, {
        sha: string;
        at: string;
    }>>;
    rounds: RatchetRound[];
    best?: {
        round: number;
        variant: string;
        test_score: number | null;
    };
    current_round: number;
    flat_rounds: number;
    prices: Record<string, RatchetPrice>;
}
/** Resolves a served model id to catalog rates; undefined when unknown or ambiguous. */
export type PriceLookup = (model: string) => ModelCost | undefined;
export interface GateResult {
    variant: string;
    decision: RoundDecision;
    reasons: string[];
    warnings: string[];
    deltas: Record<string, {
        train: PairedDelta;
        test: PairedDelta;
    }>;
    best: RatchetState["best"];
    plateau: boolean;
    done: boolean;
    table: string;
}
export declare class RatchetError extends Error {
    name: string;
}
export declare function metricDirection(goal: RatchetGoal, metric: string): Direction;
export declare function flowDir(cwd: string, flow: string): string;
export declare function loadState(cwd: string, flow: string): Promise<RatchetState | undefined>;
export declare function requireState(cwd: string, flow: string): Promise<RatchetState>;
export declare function saveState(cwd: string, state: RatchetState): Promise<void>;
export interface InitOptions {
    cases: string[];
    harness: string[];
    change: string[];
    off_limits?: string[];
    command?: string;
}
export declare function initFlow(cwd: string, flow: string, options: InitOptions): Promise<RatchetState>;
export interface PlanOptions {
    goal?: {
        target: string;
        direction?: Direction;
        hold?: string[];
        directions?: Record<string, Direction>;
    };
    reps?: number;
    stop?: {
        plateau?: number;
        rounds?: number;
    };
    command?: string;
    prices?: Record<string, RatchetPrice>;
}
export declare function applyPlan(state: RatchetState, options: PlanOptions): void;
/** Random train/test split stratified by primary tag; frozen once a baseline exists. */
export declare function splitCases(state: RatchetState, cases: Record<string, string>, testFraction?: number, seed?: number): void;
/** Content hash an approval of `stage` is bound to; any later edit makes the approval stale. */
export declare function stageDigest(cwd: string, state: RatchetState, stage: RatchetStage): Promise<string>;
export type ApprovalStatus = Record<RatchetStage, "missing" | "stale" | "current">;
export declare function approvalStatus(cwd: string, state: RatchetState): Promise<ApprovalStatus>;
export declare function requireApprovals(cwd: string, state: RatchetState): Promise<void>;
/** Normalize Anthropic-, OpenAI-, and catalog-shaped usage blocks. */
export declare function normalizeUsage(raw: unknown): Usage | undefined;
export interface CheckResult {
    variant: string;
    command: string;
    cases: number;
    reps: number;
    expected_rows: number;
    out_dir: string;
}
/** Preflight a round: approvals current, variant is next in sequence, command resolved. */
export declare function checkVariant(cwd: string, state: RatchetState, variant: string): Promise<CheckResult>;
export declare function renderStatusTable(state: RatchetState): string;
export declare function gateVariant(cwd: string, state: RatchetState, variant: string, change: string, lookup: PriceLookup): Promise<GateResult>;
export interface TrainView {
    variant: string;
    rows: Record<string, unknown>[];
    traces: string[];
    /** Train case → variant → mean target score, across every gated round. */
    history: Record<string, Record<string, number | null>>;
}
/** Everything the analyzer may read for a round: train rows, train traces, train score history. */
export declare function trainView(cwd: string, state: RatchetState, variant: string, lookup: PriceLookup): Promise<TrainView>;
