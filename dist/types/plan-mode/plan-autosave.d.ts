import type { Settings } from "../config/settings.js";
/** Suggested save filename for an approved plan: `<TOPIC>_PLAN.md` from the
 *  tiny-model topic (e.g. `PYO3_METHODS_PLAN.md`), trimmed to a word boundary
 *  when a verbose fallback title sneaks through. */
export declare function planSaveFileName(title: string): string;
/** Default autosave location: `<project>/.omp/plans/`. */
export declare function defaultPlanAutosaveDir(cwd: string): string;
/** Resolve the autosave directory: `plan.autosaveDir` (`~`/absolute/cwd-relative)
 *  or the project-local default when unset/blank. */
export declare function resolvePlanAutosaveDir(settings: Settings, cwd: string): string;
export declare function isPlanAutosaveEnabled(settings: Settings): boolean;
/** Best-effort copy of an approved plan into the autosave dir.
 *  Returns the destination path, or null when autosave is disabled/empty. */
export declare function autosaveApprovedPlan(input: {
    settings: Settings;
    cwd: string;
    title: string;
    planContent: string;
}): Promise<string | null>;
