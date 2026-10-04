import type { AgentToolResult } from "@oh-my-pi/pi-agent-core";
import type { ReadToolDetails } from "@oh-my-pi/pi-tui-zh/tools/read";
import type { ToolSession } from "../sdk.js";
import type { ParsedSelector } from "./read-selector.js";
/** IDA view rendered by the worker's `view` method. */
export type IdaViewKind = "overview" | "pseudocode" | "asm" | "imports" | "exports" | "strings" | "xrefs";
/** Parsed `<binary>:<view>` suffix; `target` is a symbol name or `0x` address. */
export type BinaryView = {
    kind: IdaViewKind;
    target?: string;
};
/** An executable or IDB on disk plus the unparsed view suffix after it. */
export interface BinaryViewTarget {
    absolutePath: string;
    view: string;
    /** Universal-binary slice from a leading `@<arch>` view segment; default slice when absent. */
    arch?: string;
}
/**
 * Parse the view suffix of a binary read. Reserved words (`imports`, `exports`,
 * `strings`) win over same-named functions, which stay reachable by `0x` address.
 */
export declare function parseBinaryView(view: string): BinaryView;
/**
 * Split `readPath` into an executable/IDB file and an IDA view suffix. Returns
 * null when IDA is disabled, the path has no `:`, the whole path is an existing
 * file, or no `:`-delimited prefix names an executable or IDB.
 */
export declare function resolveBinaryViewPath(session: ToolSession, readPath: string): Promise<BinaryViewTarget | null>;
/** Render an IDA view of an executable or IDB, opening (or creating) its database on first use. */
export declare function readBinary(session: ToolSession, target: BinaryViewTarget, parsed: ParsedSelector, signal?: AbortSignal): Promise<AgentToolResult<ReadToolDetails>>;
