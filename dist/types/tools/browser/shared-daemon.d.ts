import { type DaemonBrokerClient } from "../../launch/client.js";
import type { SharedTargetScope } from "./orphan-registry.js";
/** Broker-owned browser endpoint one omp process can attach to. */
export interface SharedBrowserEndpoint {
    wsEndpoint: string;
    daemonName: string;
    /** Canonical project directory owning the broker (used to address later stop requests). */
    projectDir: string;
}
/** Stable broker daemon name for the shared automation browser. */
export declare function sharedBrowserDaemonName(headless: boolean): string;
/**
 * Ensure the project-shared automation Chromium is running and reachable,
 * launching it under the daemon broker when needed. Idempotent across
 * processes: losers of the start race adopt the winner's endpoint on the next
 * describe round. Returns null when the shared path is unavailable (no
 * resolvable Chromium, broker failure, or a daemon that never becomes
 * reachable); callers fall back to a process-local launch.
 *
 * Per-open process flags are intentionally absent: a running shared Chromium
 * cannot be relaunched for one tab. `allow_file_access` is rejected before this
 * boundary; invalid-certificate handling remains page-scoped through CDP.
 */
export declare function ensureSharedBrowser(opts: {
    projectDir: string;
    headless: boolean;
    viewport?: {
        width: number;
        height: number;
    };
    signal?: AbortSignal;
}): Promise<SharedBrowserEndpoint | null>;
/** Seams for {@link stopSharedBrowserIfUnreachable}; the defaults hit the real broker and CDP probe. */
export interface SharedBrowserHealthDeps {
    client?: DaemonBrokerClient;
    probe?: (wsEndpoint: string) => Promise<boolean>;
    signal?: AbortSignal;
    /** Override the per-attempt probe cap ({@link PROBE_ATTEMPT_CAP_MS}); slower values are only for tests. */
    probeCapMs?: number;
}
/**
 * Stop the project-shared browser when its CDP endpoint has stopped answering.
 *
 * `ensureSharedBrowser` makes this decision only while attaching, so a Chromium
 * that wedges *after* a session attached kept its whole process tree — and
 * every target whose close timed out — alive until the last omp client in the
 * project exited (a 9.1 GB, 44-process browser survived 19 h in the
 * 2026-09-27 incident). Cleanup failures re-run the same decision off the
 * acquire path: stop the daemon, so the next attach launches a fresh Chromium
 * and the leaked targets die with the old one.
 *
 * The liveness probe gates the stop — twice in a row, because one slow answer
 * on a loaded machine is not a wedge and stopping the shared browser costs
 * every session in the project its tabs — and the daemon is re-described
 * before the stop, so a browser another session replaced meanwhile is never
 * stopped under its name. A daemon that has not become ready is left to the
 * acquire path, which owns that race. Concurrent failed closes share one check.
 * Best-effort: never throws, and returns true only when the broker confirmed the stop.
 */
export declare function stopSharedBrowserIfUnreachable(scope: SharedTargetScope, deps?: SharedBrowserHealthDeps): Promise<boolean>;
