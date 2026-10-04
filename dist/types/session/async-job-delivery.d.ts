import type { AsyncJob, AsyncJobType } from "../async/index.js";
import type { StructuredSubagentOutput } from "@oh-my-pi/pi-tui-zh/tools/task";
import type { CustomMessage } from "./messages.js";
import type { OutputMeta } from "@oh-my-pi/pi-tui-zh/tools/output-meta";
/**
 * `customType` of the injected async-result follow-up message. The task
 * executor's run monitor matches on it to invalidate a previously recorded
 * yield: a result injected after the yield supersedes that yield's payload.
 */
export declare const ASYNC_RESULT_MESSAGE_TYPE = "async-result";
/** Result payloads longer than this spill to an artifact with an inline preview. */
export declare const ASYNC_INLINE_RESULT_MAX_CHARS = 12000;
export declare const ASYNC_PREVIEW_MAX_CHARS = 4000;
/**
 * Tail share of the preview when the link points at a raw capture: tools append
 * notices (wall time, exit code, timeout) after the captured stream.
 */
export declare const ASYNC_PREVIEW_TAIL_CHARS = 1000;
export interface AsyncResultEntry {
    jobId: string;
    result: string;
    job: AsyncJob | undefined;
    durationMs: number | undefined;
    /**
     * Owning session's async-delivery generation at enqueue time. A session
     * transition (`/new`, switch, handoff) bumps the generation, so an entry
     * whose generation no longer matches belongs to a replaced transcript and
     * is dropped at flush — even after its job id has been reused, which clears
     * the manager's per-id suppression marker.
     */
    epoch: number;
}
type AsyncResultJobDetails = {
    jobId: string;
    type?: AsyncJobType;
    label?: string;
    durationMs?: number;
    /** Source capture metadata belongs to this job, not to the enclosing delivery report. */
    meta?: OutputMeta;
    /** Full structured payload (source/mode/status/data/error), when the job used an output schema. */
    schema?: StructuredSubagentOutput;
};
export type AsyncResultDetails = {
    jobs: AsyncResultJobDetails[];
    meta?: OutputMeta;
};
/**
 * Compact, size-capped JSON block for the delivery text, used only for
 * schema-invalid/error results (valid results point to `agent://<jobId>`
 * instead, since the sidecar's `<output>` block already carries the full
 * JSON — no need to duplicate it here).
 */
export declare function renderStructuredJson(structured: StructuredSubagentOutput): string | undefined;
/**
 * Headline for the delivery's "Structured output:" line. `unavailable` means
 * no payload was ever validated (the run failed before yielding, or the
 * schema itself was unusable) — never a schema verdict, so it must not read
 * as "schema unavailable"/"schema invalid".
 */
export declare function structuredStatusLabel(status: StructuredSubagentOutput["status"]): string;
export declare function buildAsyncResultBatchMessage(entries: AsyncResultEntry[]): CustomMessage<AsyncResultDetails> | null;
export {};
