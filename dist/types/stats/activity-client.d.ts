import type { DailyActivityPoint } from "@oh-my-pi/omp-stats/shared-types";
import { type SpawnedSubprocess } from "../subprocess/worker-client.js";
import { type StatsActivityWorkerOutbound } from "./activity-protocol.js";
/**
 * Spawn the stats activity worker as a subprocess. Exported for the smoke
 * probe; production callers go through {@link loadDailyActivity}.
 */
export declare function createStatsActivitySubprocess(): SpawnedSubprocess<StatsActivityWorkerOutbound>;
/**
 * Stream daily activity for the `/usage` heatmap from a one-shot subprocess:
 * `push` receives the cached DB rows first, then the refreshed rows after an
 * incremental session sync. Resolves once the sync settles and rejects when
 * the worker fails or dies; the child is SIGKILLed either way, and aborting
 * `signal` (dashboard closed) kills it mid-sync — per-file writes are
 * transactional and the OS-owned sync lock is released with the process.
 */
export declare function loadDailyActivity(push: (points: DailyActivityPoint[]) => void, signal?: AbortSignal): Promise<void>;
export declare function smokeTestStatsActivityWorker({ timeoutMs, }?: {
    timeoutMs?: number;
}): Promise<void>;
