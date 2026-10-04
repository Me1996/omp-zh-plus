/**
 * One `task.agentCompactionThresholdOverrides` entry: a positive token count
 * (`90000`) or a percentage string (`"80%"`). `null` clears an entry inherited
 * from a lower-priority settings layer.
 */
export type AgentCompactionThresholdOverride = number | string | null;
/** Both compaction threshold fields, as consumed by `compaction.thresholdPercent`/`compaction.thresholdTokens`. */
export interface CompactionThresholdPair {
    thresholdPercent: number;
    thresholdTokens: number;
}
/** Validate the exact-agent compaction threshold map and normalize each entry to both threshold fields. */
export declare function validateAgentCompactionThresholdOverrides(value: unknown): Record<string, CompactionThresholdPair>;
