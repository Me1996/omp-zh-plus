import type { ToolSession } from "../index.js";
import { CmuxTab } from "./cmux/cmux-tab.js";
import { type BrowserHandle, type BrowserKindTag, type CmuxBrowserHandle, type PuppeteerBrowserHandle, type TernBrowserHandle } from "./registry.js";
import type { ReadyInfo, RunResultOk, Transferable, WorkerInbound, WorkerInitPayload, WorkerOutbound } from "./tab-protocol.js";
import { TernTab } from "./tern/tern-tab.js";
interface WorkerHandle {
    send(msg: WorkerInbound, transferList?: Transferable[]): void;
    onMessage(handler: (msg: WorkerOutbound) => void): () => void;
    onError(handler: (error: Error) => void): () => void;
    terminate(): Promise<void>;
    readonly mode: "worker" | "inline";
}
export type DialogPolicy = "accept" | "dismiss";
export interface PendingRun {
    resolve(result: RunResultOk): void;
    reject(error: unknown): void;
    session: ToolSession;
    signal?: AbortSignal;
    toolCalls: Map<string, AbortController>;
    /**
     * Fires when `releaseTab` closes the tab out from under an in-flight run
     * (sibling `browser close --all`, session-scoped reap, etc.). Composed
     * into the cmux run's signal so `wait(...)`, cmux socket calls, and the
     * facade proxies unwind promptly instead of blocking to the run's
     * timeout. `pending.reject` still fires first so the awaiting caller
     * sees the tab-close error immediately; `closeAc` propagates the
     * cancellation into the still-running `runInProcessTab` body (issue #4499).
     */
    closeAc?: AbortController;
}
interface TabSessionBase<TBrowser extends BrowserHandle = BrowserHandle> {
    name: string;
    browser: TBrowser;
    targetId: string;
    state: "alive" | "dead";
    info: ReadyInfo;
    pending: Map<string, PendingRun>;
    dialogPolicy?: DialogPolicy;
    /** Hostname patterns enforced by the worker across navigations and subresources. */
    allowedDomains?: string[];
    kindTag: BrowserKindTag;
    /**
     * Session id of the caller that CREATED the tab. Preserved across reuse so
     * that dispose of the creating session can reap browser resources without
     * yanking the tab out from under a subagent that only reused it.
     * Undefined when the acquirer did not identify itself.
     */
    ownerSessionId?: string;
    /**
     * Opt out of settle-freeze and idle-close reaping. Recorded on the tab
     * when created (never on reuse), mirroring `ownerSessionId`: keeping a
     * tab live across turns is the creator's explicit decision.
     */
    persist?: boolean;
    /** Wall-clock (`Date.now()`) last use: create, reuse, or run start. Drives idle-close. */
    lastActivityAt: number;
    /**
     * True after a successful settle-freeze (`Page.setWebLifecycleState`
     * frozen). Cleared on unfreeze/create. Freeze pauses rAF/timers so an
     * idle animated page stops burning CPU/GPU; the renderer, worker, and
     * DOM state stay alive for millisecond resume.
     */
    frozen: boolean;
}
export interface WorkerTabSession extends TabSessionBase<PuppeteerBrowserHandle> {
    backend: "worker";
    worker: WorkerHandle;
    activateForScreenshot: boolean;
}
export interface CmuxTabSession extends TabSessionBase<CmuxBrowserHandle> {
    backend: "cmux";
    cmuxTab: CmuxTab;
    cmuxOwnsSurface: boolean;
    cmuxAttachedSurface?: string;
}
/** A tab shown as a Tern browser picture-in-picture over omp's pane. */
export interface TernTabSession extends TabSessionBase<TernBrowserHandle> {
    backend: "tern";
    /** The PiP's driver. */
    ternTab: TernTab;
}
export type TabSession = WorkerTabSession | CmuxTabSession | TernTabSession;
export interface AcquireTabOptions {
    url?: string;
    waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
    viewport?: {
        width: number;
        height: number;
        deviceScaleFactor?: number;
    };
    target?: string;
    signal?: AbortSignal;
    timeoutMs: number;
    /**
     * `performance.now()` timestamp at which the caller's timeout budget
     * started. Callers whose deadline began before this acquisition —
     * `browser.ts` `open` starts its clock before `acquireBrowser` — pass it
     * through so time spent in earlier phases within the caller's deadline
     * counts against the worker-init budget instead of restarting it.
     * Omit for a fresh clock.
     */
    deadlineStartMs?: number;
    dialogs?: DialogPolicy;
    /** Hostname patterns allowed for every tab request. */
    allowedDomains?: string[];
    /** Document-start JavaScript sources registered before initial navigation. */
    initScripts?: string[];
    /** Absolute directory used for downloads. */
    downloadsPath?: string;
    /** Explicit tab user agent override. */
    userAgent?: string;
    /** Ignore invalid HTTPS certificates for this page. */
    ignoreHttpsErrors?: boolean;
    cmuxSurface?: string;
    /**
     * Session id of the acquirer. Recorded on the tab when created (never on
     * reuse) so `releaseTabsForOwner` can walk the shared tabs map on session
     * dispose. Optional — omitting it opts the tab out of session-scoped reap.
     */
    ownerSessionId?: string;
    /**
     * Keep the tab live across turn settle and idle close. Recorded on the
     * tab when created (never on reuse) so a later caller cannot silently
     * extend another session's tab lifetime.
     */
    persist?: boolean;
}
export interface AcquireTabResult {
    tab: TabSession;
    created: boolean;
}
export interface RunInTabOptions {
    code: string;
    timeoutMs: number;
    signal?: AbortSignal;
    session: ToolSession;
}
export interface ReleaseTabOptions {
    kill?: boolean;
    /** Maximum time for each asynchronous cleanup resource before close fails with diagnostics. */
    timeoutMs?: number;
}
export declare function getTab(name: string): TabSession | undefined;
/** JSON-safe metadata for one managed browser tab. */
export interface ManagedTabInfo {
    /** Managed tab name. */
    name: string;
    /** Last reported page URL. */
    url: string;
    /** Last reported page title. */
    title: string;
    /** Browser target or cmux surface identifier. */
    targetId: string;
    /** Browser backend kind. */
    kind: BrowserKindTag;
    /** Whether settle and idle-close management are disabled. */
    persist: boolean;
}
/** List the currently alive tabs in the managed-tab registry. */
export declare function listTabs(): ManagedTabInfo[];
export declare function acquireTab(name: string, browser: BrowserHandle, opts: AcquireTabOptions): Promise<AcquireTabResult>;
export declare function runInTab(name: string, opts: RunInTabOptions): Promise<RunResultOk>;
export declare function releaseTab(name: string, opts?: ReleaseTabOptions): Promise<boolean>;
/** Test hook for the kill guards without a live application. */
export declare function ensureSpawnedKilledForTest(browser: BrowserHandle): Promise<void>;
export declare function releaseAllTabs(opts?: ReleaseTabOptions): Promise<number>;
export declare function dropHeadlessTabs(): Promise<void>;
/**
 * Release every tab created by the given session id. Invoked from
 * `AgentSession.dispose()` so headless/spawned Chromium and workers the
 * session opened do not leak into the long-lived process — the module-global
 * `tabs`/`browsers` maps that back this tool are not otherwise walked by
 * session teardown. (Issue #3963.)
 *
 * Ownership is recorded ONLY on tab creation (`acquireTab` with
 * `ownerSessionId`), never on reuse: a subagent re-driving a tab another
 * session opened will not yank teardown responsibility away from the
 * creator. Tabs opened with no owner (e.g. from an SDK caller that doesn't
 * identify a session) are skipped and must be released explicitly.
 */
export declare function releaseTabsForOwner(ownerId: string, opts?: ReleaseTabOptions): Promise<number>;
/** Test hook for the lifecycle transition without a tabs-map entry. */
export declare function setTabFrozenForTest(tab: TabSession, frozen: boolean): Promise<boolean>;
/** Test hook for the pre-run resume without a tabs-map entry. */
export declare function unfreezeTabSessionForTest(tab: TabSession): Promise<boolean>;
/**
 * Freeze every managed tab owned by `ownerId` (issue #8246). Turn-settle
 * checkpoint: an idle animated page stops burning CPU/GPU while keeping its
 * renderer, worker, and DOM state for millisecond resume on next use. Tabs
 * with in-flight runs are skipped at the guard; a freeze already past the
 * guard when a run registers undoes itself at completion (see
 * `setTabFrozen`), so neither path can stall a run mid-execution.
 */
export declare function freezeTabsForOwner(ownerId: string): Promise<number>;
/**
 * Idle-close eligibility: owned, settle-managed, no in-flight run, and idle
 * past the deadline. An executing tab is not idle even when its run outlasts
 * the timeout. Exported so the never-touch contract is unit-testable;
 * `releaseIdleTabsForOwner` walks the map with exactly this predicate.
 */
export declare function isIdleCloseCandidate(tab: TabSession, ownerId: string, nowMs: number, idleMs: number): boolean;
/**
 * Close managed tabs owned by `ownerId` idle longer than `idleMs` — the
 * memory backstop under settle-freeze (frozen tabs still hold their renderer
 * and worker). Never throws: a wedged tab counts as unclosed and the sweep
 * continues, returning the partial count — reapers must not fail callers.
 */
export declare function releaseIdleTabsForOwner(ownerId: string, opts?: {
    idleMs: number;
} & ReleaseTabOptions): Promise<number>;
/**
 * Milliseconds until the owner's next managed tab goes idle, `0` when one
 * already is, or undefined when no managed tab is tracked. The sweep
 * checkpoints (turn settle, open) handle the due case synchronously; the
 * timer covers abandonment with no further activity.
 */
export declare function earliestIdleCloseInMs(ownerId: string, idleMs: number, nowMs?: number): number | undefined;
/** Drop a pending idle-close deadline and invalidate a sweep in flight. */
export declare function cancelIdleCloseForOwner(ownerId: string): void;
/** Test probe: whether the owner currently has an armed deadline. */
export declare function hasIdleCloseTimerForTest(ownerId: string): boolean;
/**
 * (Re)arm the owner-scoped one-shot that closes idle tabs when the timeout
 * elapses without further activity. Without this, a tab used in the final
 * turn before an idle session would sit until the next turn, open, or
 * dispose despite the advertised timeout. The timer is unref'd so it never
 * holds the process open (print/RPC exits are unaffected), firing
 * re-enters through `releaseIdleTabsForOwner` — which re-arms while
 * survivors remain — and disposal needs no cleanup since a fired sweep
 * over released tabs is a no-op. Due-but-busy survivors re-arm on a short
 * retry cadence instead of losing their deadline until the next sweep.
 * @param retryMs recheck cadence for due-but-busy survivors; keep well above zero.
 */
export declare function armIdleCloseForOwner(ownerId: string, idleMs: number, retryMs?: number): void;
/** Test-only accessor for the module-global tabs map. */
export declare function getTabsMapForTest(): Map<string, TabSession>;
export declare function initializeTabWorkerForTest(worker: WorkerHandle, payload: WorkerInitPayload, timeoutMs: number, deadlineStart?: number): Promise<ReadyInfo>;
export {};
