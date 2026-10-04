import { type BenchRuntime, type StreamSimpleFn } from "../cli/bench-runtime.js";
import { type IfBenchSummary } from "./runner.js";
export interface IfBenchCommandArgs {
    models: string[];
    flags: {
        turns?: number;
        length?: number;
        maxTokens?: number;
        nyaMax?: number;
        par?: number;
        json?: boolean;
    };
}
export interface IfBenchDependencies {
    createRuntime?: () => Promise<BenchRuntime>;
    streamSimple?: StreamSimpleFn;
    now?: () => number;
    randomSessionId?: () => string;
    sleep?: (ms: number) => Promise<void>;
    writeStdout?: (text: string) => void;
    writeStderr?: (text: string) => void;
    setExitCode?: (code: number) => void;
    stdoutIsTTY?: boolean;
}
/** Resolve selectors, run every thread, and render the live board plus scoreboard. */
export declare function runIfBenchCommand(command: IfBenchCommandArgs, deps?: IfBenchDependencies): Promise<IfBenchSummary>;
