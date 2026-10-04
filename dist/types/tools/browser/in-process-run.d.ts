import { JsRuntime } from "../../eval/js/shared/runtime.js";
import type { ToolSession } from "../index.js";
import { RunOutput } from "./run-output.js";
import type { RunResultOk, ScreenshotResult, SessionSnapshot } from "./tab-protocol.js";
/** What a tab facade may use while one run is active. */
export interface InProcessRunContext {
    /** The session the run belongs to. */
    session: SessionSnapshot;
    /** Displays the run produces. */
    output: RunOutput;
    /** Screenshots the run saved. */
    screenshots: ScreenshotResult[];
    /** Aborts when the run ends, times out or is cancelled. */
    signal: AbortSignal;
    /** The run's budget. */
    timeoutMs: number;
}
/** A backend tab whose `run` code executes in this process. */
export interface InProcessRunTab {
    /** Guest file-name prefix naming the backend in stacks (`cmux-run`, `tern-run`). */
    readonly runLabel: string;
    /** The `page` facade in scope. */
    readonly page: object;
    /** The `browser` facade in scope. */
    readonly browser: object;
    /** The tab's JavaScript runtime (created once per tab). */
    ensureRuntime(session: SessionSnapshot): JsRuntime;
    /** Publish the active run to the facades. */
    setRunContext(context: InProcessRunContext): void;
    /** Forget the finished run. */
    clearRunContext(): void;
}
/** Inputs of {@link runInProcessTab}. */
export interface RunInProcessOptions {
    /** The run's JavaScript body. */
    code: string;
    /** The run's budget. */
    timeoutMs: number;
    /** Cancels the run. */
    signal?: AbortSignal;
    /** The calling tool session (host tool calls). */
    session: ToolSession;
    /** Session facts for the facades. */
    snapshot: SessionSnapshot;
}
/** Run `opts.code` against `tab`'s facades in this process. */
export declare function runInProcessTab(tab: InProcessRunTab, opts: RunInProcessOptions): Promise<RunResultOk>;
