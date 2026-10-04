import { type UpdateNotesDetails } from "@oh-my-pi/pi-tui-zh/tools/autoresearch";
import type { ToolDefinition } from "../../extensibility/extensions/index.js";
import type { AutoresearchToolFactoryOptions } from "../types.js";
declare const updateNotesSchema: import("@oh-my-pi/omptype").FluentType<{
    append_idea?: string | undefined;
    body: string;
}, {
    append_idea?: string | undefined;
    body: string;
}>;
export declare function createUpdateNotesTool(options: AutoresearchToolFactoryOptions): ToolDefinition<typeof updateNotesSchema, UpdateNotesDetails>;
export {};
