import type { Browser } from "puppeteer-core";
/** Identifies one shared-browser daemon's target registry. */
export interface SharedTargetScope {
    /** Canonical project directory owning the broker (as stamped on the handle). */
    projectDir: string;
    /** Broker daemon name, e.g. `omp.browser.headless`. */
    daemonName: string;
}
/** Record that this process created `targetId` in the given shared browser. */
export declare function recordSharedTarget(scope: SharedTargetScope, targetId: string): Promise<void>;
/** Drop `targetId` from this process's ownership file (closed the normal way). */
export declare function forgetSharedTarget(scope: SharedTargetScope, targetId: string): Promise<void>;
/**
 * Drop every target this process still claims in `scope`. For when the whole
 * shared browser is confirmed gone — the broker reported its daemon in a
 * terminal state after a stop — which takes the targets that could not be
 * closed with it; the records are dead weight that would otherwise be
 * rewritten on every later write until this process exits. Only call this on
 * that confirmation: while the browser lives, the records are the only handle
 * a later reap has on its orphaned targets.
 */
export declare function forgetSharedTargets(scope: SharedTargetScope): Promise<void>;
/** Options for {@link collectOrphanTargets}; the defaults hit the real registry, the seams are for tests. */
export interface CollectOrphanOptions {
    /** Wall clock; injectable for deterministic grace-window tests. */
    now?: () => number;
    /** PID liveness probe; injectable so tests need no real subprocesses. */
    isAlive?: (pid: number) => boolean;
    /** Grace window in ms before a dead owner's records are eligible. */
    graceMs?: number;
}
/** Targets belonging to one dead process, kept grouped so partial failures remain retryable. */
export interface OrphanOwner {
    file: string;
    pid: number;
    updatedAt: number;
    targetIds: string[];
}
/** Orphan-scan result grouped by durable ownership file. */
export interface OrphanScan {
    owners: OrphanOwner[];
}
/**
 * Scan a registry dir for targets whose owning process is gone. Returns one
 * entry per dead owner so a reaper can retain only targets whose CDP closure
 * was not confirmed. This process's own file and every live-owner file are
 * left untouched.
 */
export declare function collectOrphanTargets(scope: SharedTargetScope, opts?: CollectOrphanOptions): Promise<OrphanScan>;
/**
 * Close a page target by id through a fresh CDP session. Returns true only
 * when CDP confirms the close or confirms the target no longer exists; a
 * dropped connection or transient protocol failure returns false so durable
 * ownership remains available for a later retry.
 */
export declare function closeCdpTarget(browser: Browser, targetId: string): Promise<boolean>;
/**
 * Reap shared-browser targets whose owning omp process is gone. Each owner
 * file is removed only after every target is confirmed closed/absent; partial
 * failures atomically retain the unresolved ids for the next attach to retry.
 * Failures are logged, never thrown, so cleanup cannot block browser open.
 */
export declare function reapOrphanSharedTargets(browser: Browser, scope: SharedTargetScope): Promise<number>;
/** Test-only reset of the in-process ownership state. */
export declare function resetOrphanRegistryForTest(): void;
