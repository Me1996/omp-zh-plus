import type { ToolTier } from "@oh-my-pi/pi-agent-core";
import { type ShellFilesystem, type ShellFsRequest, type ShellFsResponse } from "@oh-my-pi/pi-natives";
import type { ResolveContext } from "./types.js";
/** Whether `input` is spelled `scheme://…`: the only form the shell filesystem hands to URL handlers. */
export declare function isUrlPath(input: string): boolean;
/** A filesystem failure carrying the errno name the shell reports. */
export declare class UrlFsError extends Error {
    readonly code: string;
    name: string;
    constructor(code: string, message: string);
}
/**
 * `base` URL followed by a `/`-separated path of raw entry names (a native
 * walk's root-relative result), each name percent-encoded as `pi_vfs::child_path` does.
 */
export declare function joinUrlPath(base: string, relative: string): string;
/** What {@link InternalUrlFilesystem.stat} reports about an entry. */
export interface UrlFileStat {
    type: "directory" | "file" | "other";
    /** Bytes of a file; 0 for directories. */
    size: number;
    /** Host modification time; 0 for rendered resources, which have none. */
    mtimeMs: number;
}
export interface InternalUrlFilesystemOptions {
    /** Calling session's resolve context; its signal cancels in-flight operations. */
    context: ResolveContext;
    /** Approval tier the shell command ran under; schemes whose read or write tier exceeds it are refused. */
    tier: ToolTier;
}
/**
 * Session-bound filesystem for URL paths in one embedded-shell run. Construct one
 * per run with that run's own abort signal; handles opened through it live until
 * the shell closes them.
 */
export declare class InternalUrlFilesystem {
    #private;
    constructor(options: InternalUrlFilesystemOptions);
    /** Native shell binding: URL paths reach {@link handle}; host paths stay on the native filesystem. */
    shellFilesystem(): ShellFilesystem;
    /** Serve one shell filesystem request; failures come back as errno data. */
    handle(request: ShellFsRequest): Promise<ShellFsResponse>;
    /** The entry `input` (a URL or host path) names, following symlinks; throws {@link UrlFsError}. */
    stat(input: string): Promise<UrlFileStat>;
    /** First `maxBytes` bytes of the file `input` (a URL or host path) names, following symlinks; throws {@link UrlFsError}. */
    readPrefix(input: string, maxBytes: number): Promise<Uint8Array>;
}
