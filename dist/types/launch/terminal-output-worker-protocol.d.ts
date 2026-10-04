import type { TerminalOutputOptions } from "./terminal-output.js";
export { TERMINAL_OUTPUT_WORKER_ARG } from "../cli/worker-selectors.js";
export interface TerminalOutputWorkerRequest {
    output: string;
    options: TerminalOutputOptions;
}
export type TerminalOutputWorkerResult = {
    ok: true;
    rows: string[] | undefined;
} | {
    ok: false;
    error: string;
};
