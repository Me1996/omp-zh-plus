/**
 * CPU profiling and aggregate memory statistics for debug reports.
 */
import { type HeapStats } from "bun:jsc";
export interface CpuProfile {
    data: string;
    markdown: string;
}
export interface ProfilerSession {
    /** Stop profiling and return the profile data */
    stop(): Promise<CpuProfile>;
}
/**
 * Start CPU profiling.
 * Returns a session that can be stopped to get the profile data.
 */
export declare function startCpuProfile(): Promise<ProfilerSession>;
/** Numeric-only process and heap statistics for memory reports, without heap contents. */
export interface MemoryStats {
    process: NodeJS.MemoryUsage;
    heap: Pick<HeapStats, "heapSize" | "heapCapacity" | "extraMemorySize" | "objectCount" | "protectedObjectCount" | "globalObjectCount" | "protectedGlobalObjectCount">;
}
/** Collect post-GC memory counters for reports without capturing credentials or other live strings. */
export declare function collectMemoryStats(): MemoryStats;
