import type { Browser, Page, Target } from "puppeteer-core";
/**
 * Allocate an unused TCP port on 127.0.0.1 by binding to port 0 and reading
 * back the kernel-assigned port. There's a small race between close and the
 * subsequent bind in the launched app, but Chromium's listener will retry.
 */
export declare function findFreeCdpPort(): Promise<number>;
/** Status line plus body of a {@link probeCdpResponse} answer. */
export interface CdpProbeResponse {
    status: number;
    body: string;
}
/**
 * Proxy-proof loopback probe resolving to the response status code, or null
 * when the endpoint is unreachable, aborted, malformed, or slow past `timeoutMs`.
 */
export declare function probeCdpStatus(url: string, opts: {
    timeoutMs: number;
    signal?: AbortSignal;
}): Promise<number | null>;
/**
 * Proxy-proof loopback probe that also reads the response body (for endpoints
 * whose non-2xx answer carries state, like the relay's 503). Null on the same
 * conditions as {@link probeCdpStatus}.
 */
export declare function probeCdpResponse(url: string, opts: {
    timeoutMs: number;
    signal?: AbortSignal;
}): Promise<CdpProbeResponse | null>;
/** Poll `${cdpUrl}/json/version` until it responds with 200, with abort + timeout support. */
export declare function waitForCdp(cdpUrl: string, timeoutMs: number, signal?: AbortSignal): Promise<void>;
/**
 * Launch argv for a spawned executable. Chrome 136+ silently ignores
 * `--remote-debugging-port` when the default user-data-dir is in use: the
 * browser opens as usual, nothing listens, and attach waits out its timeout.
 * Chromium-family browsers therefore get a stable omp-owned profile under
 * `~/.omp/browser-profiles/<exe slug>` unless the caller already picked one.
 * That profile is also what lets a second instance start beside the user's
 * running default-profile browser instead of handing off to it. Electron apps
 * are left untouched: `--user-data-dir` would relocate their app data.
 *
 * An omp-owned profile also bypasses the OS keystore (`--use-mock-keychain`,
 * `--password-store=basic`, the same pair puppeteer's launcher sets): Chromium
 * otherwise derives its cookie-encryption key from the login keychain and
 * macOS blocks on a "wants to use your confidential information" dialog for
 * every fresh binary. A caller-supplied profile keeps the real keystore; its
 * existing cookies are encrypted with that key and a mock one would corrupt them.
 */
export declare function resolveSpawnArgs(exe: string, appArgs: string[] | undefined, cwd?: string): string[];
/**
 * Return a reusable CDP endpoint for `exe`, or null when no instance is
 * running. Refuse to replace an occupied instance unless the caller can
 * launch an isolated profile.
 */
export declare function findReusableCdp(exe: string, options?: {
    signal?: AbortSignal;
    appArgs?: string[];
}): Promise<{
    cdpUrl: string;
    pid: number;
} | null>;
export declare function shouldPreserveConnectedBrowserFocus(target?: string): boolean;
export interface PickTargetOptions {
    matcher?: string;
    preferVisible?: boolean;
    /** Relay /json endpoint (e.g. http://127.0.0.1:9224); enables metadata-first target selection. */
    relayJson?: string;
    signal?: AbortSignal;
}
/** Attach to one target under a deadline; unresponsive targets resolve to null. */
export declare function attachPageWithTimeout(target: Target, timeoutMs?: number, signal?: AbortSignal): Promise<Page | null>;
/**
 * Puppeteer throws "Requesting main frame too early!" when a Page's
 * frameTree has not arrived yet — common right after adopting a relay tab
 * whose CDP session was synthesized. Poll until mainFrame serves or the
 * deadline passes.
 */
export declare function waitForMainFrame(page: Page, timeoutMs?: number, signal?: AbortSignal): Promise<boolean>;
/** Select relay pages from /json metadata before probing pages; enumerate targets when metadata offers no selection. */
export declare function pickElectronTarget(browser: Browser, options?: PickTargetOptions): Promise<Page>;
/**
 * SIGTERM the process tree, wait briefly, then SIGKILL anything still alive.
 * Single-process variant for our own spawned children.
 */
export declare function gracefulKillTreeOnce(pid: number, gracePeriodMs?: number): Promise<void>;
