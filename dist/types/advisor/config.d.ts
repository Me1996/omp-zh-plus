import { type AdvisorConfig, type AdvisorConfigScope, type WatchdogConfigDoc } from "@oh-my-pi/pi-tui-zh/overlays/advisor-config";
export { ADVISOR_REVIEW_MODES, ADVISOR_SYNC_BACKLOG_MODES } from "@oh-my-pi/pi-tui-zh/overlays/advisor-config";
export type { AdvisorReviewMode, AdvisorSyncBacklog } from "@oh-my-pi/pi-tui-zh/overlays/advisor-config";
/**
 * Runtime health of a single advisor, surfaced in stats and the status line.
 * - `running` — actively processing primary turns
 * - `paused` — user-toggled off via per-advisor switch (runtime disposed)
 * - `quota_exhausted` — provider returned a quota/rate-limit error; the
 *   runtime auto-retries after a cooldown so it can resume without user action
 * - `error` — repeated transient failures; backlog dropped to prevent stall
 * - `no_model` — no model resolved for this advisor's role/explicit model
 */
export type AdvisorRuntimeStatus = "running" | "paused" | "quota_exhausted" | "error" | "no_model";
/**
 * The result of walking the `WATCHDOG.yml`/`WATCHDOG.yaml` search path: the
 * deduped advisor roster plus the concatenated top-level `instructions` baseline
 * that is prepended (alongside `WATCHDOG.md`) to every advisor.
 */
export interface DiscoveredAdvisors {
    advisors: AdvisorConfig[];
    sharedInstructions: string | undefined;
    sharedMaxNotesPerUpdate?: number;
    /**
     * Human-readable config problems collected during the walk: unparseable
     * files and dropped entries. Surfaced as one aggregated session warning so
     * a broken roster entry never fails silently.
     */
    warnings: string[];
}
/**
 * Normalize an advisor name into a filesystem-/id-safe slug used for its
 * transcript filename and session id: lowercase, non-alphanumerics collapsed to
 * `-`, leading/trailing `-` trimmed. Falls back to `"advisor"` when nothing
 * survives; callers dedupe collisions.
 */
export declare function slugifyAdvisorName(name: string): string;
/**
 * Returns a stable provider-facing UUIDv7 for one advisor within one primary session.
 *
 * Codex treats `session_id`/`conversation_id` as a UUID-shaped routing identity,
 * so advisor labels such as `-advisor` stay local-only.
 */
export declare function getOrCreateAdvisorProviderSessionId(ids: Map<string, string>, primarySessionId: string | undefined, slug: string, randomSessionId?: () => string): string | undefined;
/**
 * Discover advisor configs from `WATCHDOG.yml`/`WATCHDOG.yaml` files on the same
 * user + project search path as `WATCHDOG.md`. Advisors are keyed by slug; a
 * more-specific file (project leaf > project ancestor > user) replaces an earlier
 * entry with the same slug. Top-level `instructions` across all files concatenate
 * into the shared baseline. A malformed file is logged and skipped — never
 * thrown — so a bad project config can't kill the session.
 */
export declare function discoverAdvisorConfigs(cwd: string, agentDir?: string): Promise<DiscoveredAdvisors>;
/**
 * Resolve the `WATCHDOG.yml` path for a scope: `project` → `<projectDir>/WATCHDOG.yml`
 * (discovered by the project-level walk), `user` → `<agentDir>/WATCHDOG.yml` (the
 * user-level candidate).
 */
export declare function advisorConfigFilePath(scope: AdvisorConfigScope, dirs: {
    projectDir: string;
    agentDir: string;
}): string;
/**
 * Resolve which `WATCHDOG.{yml,yaml}` to edit for a scope: prefer the canonical
 * `.yml`, but when only a `.yaml` exists for that scope, edit it in place so an
 * existing `.yaml` user isn't shown a blank editor and left with two files at the
 * same precedence. Falls back to `.yml` when neither exists.
 */
export declare function resolveAdvisorConfigEditPath(scope: AdvisorConfigScope, dirs: {
    projectDir: string;
    agentDir: string;
}): Promise<string>;
/**
 * Load one `WATCHDOG.yml` file for editing — raw, un-merged, un-expanded. Missing
 * or unparseable files yield an empty doc (never throws) so the editor opens
 * cleanly on a fresh or broken file. Validation is per entry, matching
 * discovery: malformed entries drop out of `advisors` and land in `warnings`
 * instead of blanking the whole editor.
 */
export declare function loadWatchdogConfigFile(filePath: string): Promise<WatchdogConfigDoc>;
export declare function serializeWatchdogConfig(doc: WatchdogConfigDoc): string;
/**
 * Write an editable doc to `WATCHDOG.yml`. An empty doc removes the file so
 * discovery falls back to the legacy single-advisor path rather than leaving an
 * empty config behind.
 */
export declare function saveWatchdogConfigFile(filePath: string, doc: WatchdogConfigDoc): Promise<void>;
