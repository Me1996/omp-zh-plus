import type { ToolDefinition } from "../../extensibility/extensions/index.js";
import type { AutoresearchToolFactoryOptions } from "../types.js";
import type { RunDetails, RunExperimentProgressDetails } from "@oh-my-pi/pi-tui-zh/tools/autoresearch";
declare const runExperimentSchema: import("@oh-my-pi/omptype").FluentType<{
    timeout_seconds?: number | undefined;
}, {
    timeout_seconds?: number | undefined;
}>;
export declare function createRunExperimentTool(options: AutoresearchToolFactoryOptions): ToolDefinition<typeof runExperimentSchema, RunDetails | RunExperimentProgressDetails>;
export {};
