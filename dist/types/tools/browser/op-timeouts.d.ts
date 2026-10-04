/**
 * A selector op whose selector has matched nothing for this long fails fast with the
 * zero-match hint instead of burning the rest of its deadline: a wrong selector or a
 * wrong page (consent wall, pre-navigation document) is the common agent failure and
 * should cost ~2s, not the full action ceiling. Explicit `{ timeout }` waits opt out.
 */
export declare const ZERO_MATCH_FAIL_FAST_MS = 2000;
/** Poll cadence for the zero-match watchdog. */
export declare const ZERO_MATCH_POLL_MS = 250;
/** Per-op deadlines for one cell budget. */
export interface OpTimeouts {
    /** Largest per-op deadline allowed — strictly below the cell budget. */
    budgetBound: number;
    /** Ceiling for quick page reads. */
    quickOpMs: number;
    /** Ceiling for interactive actions + default for waits. */
    actionOpMs: number;
}
/** Resolve the per-op fail-fast ceilings for a given cell budget. */
export declare function resolveOpTimeouts(cellTimeoutMs: number): OpTimeouts;
/**
 * Effective timeout for a wait helper (`waitFor*`). A positive explicit `{ timeout }` is
 * honored but clamped to the cell budget so it still fails fast + named; raising the tool
 * `timeout` raises that cap, so a longer budget stays meaningful. No `{ timeout }` → the
 * action ceiling. Puppeteer's `{ timeout: 0 }` / `Infinity` ("disable") maps to the largest
 * bounded wait (`budgetBound`) — the harness never permits an unbounded wait. Garbage input
 * (negative, `NaN`) falls back to the action ceiling rather than the longest wait.
 */
export declare function resolveWaitTimeout(cellTimeoutMs: number, explicit?: number): number;
