export type ToolName = "sd" | "sg" | "yt-dlp" | "trafilatura";
export declare function getToolPath(tool: ToolName): string | null;
/** Options for {@link downloadFile}. */
export interface DownloadFileOptions {
    signal?: AbortSignal;
    /** Bound on the whole transfer (default 2 minutes; raise it for large model weights). */
    timeoutMs?: number;
    /** Bytes written so far and the `Content-Length` total (undefined when the server omits it). */
    onProgress?: (loaded: number, total: number | undefined) => void;
}
/** Download a tool asset without handing the streaming Response to Bun.write. */
export declare function downloadFile(url: string, dest: string, options?: DownloadFileOptions): Promise<void>;
type EnsureToolOptions = {
    signal?: AbortSignal;
    silent?: boolean;
    notify?: (message: string) => void;
};
export declare function ensureTool(tool: ToolName, silentOrOptions?: EnsureToolOptions): Promise<string | undefined>;
export {};
