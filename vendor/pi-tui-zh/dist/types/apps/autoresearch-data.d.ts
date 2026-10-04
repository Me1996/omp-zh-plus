import type { ExperimentResult, MetricDef, MetricDirection, NumericMetricMap } from "../tools/autoresearch.js";
/** Format an experiment duration for display. */
export declare function formatElapsed(milliseconds: number): string;
/** Compare metrics using the configured optimization direction. */
export declare function isBetter(current: number, best: number, direction: MetricDirection): boolean;
/** Select results belonging to the active experiment segment. */
export declare function currentResults(results: ExperimentResult[], segment: number): ExperimentResult[];
/** Find the first unflagged kept experiment in a segment. */
export declare function findBaselineResult(results: ExperimentResult[], segment: number): ExperimentResult | null;
/** Read the baseline primary metric for a segment. */
export declare function findBaselineMetric(results: ExperimentResult[], segment: number): number | null;
/** Resolve a baseline run number, including legacy unnumbered results. */
export declare function findBaselineRunNumber(results: ExperimentResult[], segment: number): number | null;
/** Collect secondary baselines from the earliest unflagged metric samples. */
export declare function findBaselineSecondary(results: ExperimentResult[], segment: number, knownMetrics: MetricDef[]): NumericMetricMap;
