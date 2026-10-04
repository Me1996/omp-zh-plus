import type { SingleResult } from "@oh-my-pi/pi-tui-zh/tools/task";
/**
 * Preview text for a child result. Falls back to "(no output)" — annotated
 * with the request count when the child actually did work, so the parent can
 * tell a no-op child from one that burned requests before being cancelled.
 */
export declare function formatResultOutputFallback(result: Pick<SingleResult, "output" | "stderr" | "requests">): string;
/** Render the `<task-result>` envelope for a settled run. */
export declare function formatTaskResultSummary(result: SingleResult, options: {
    totalDurationMs: number;
    mergeSummary?: string;
}): string;
