import type { Judge } from "@oh-my-pi/pi-ai";
import type { FindHit, FindStats } from "@oh-my-pi/pi-tui-zh/tools/find";
import type { InternalUrlFilesystem } from "../../internal-urls/url-filesystem.js";
import { type SearchRoot } from "./tree.js";
export interface CascadeOptions {
    root: SearchRoot;
    /** Filesystem the root is listed, scanned, and read through: host paths and internal URLs alike. */
    filesystem: InternalUrlFilesystem;
    query: string;
    /** Caller-supplied lexical keywords, added to those derived from the query. */
    extraKeywords: readonly string[];
    judge: Judge;
    includeHidden: boolean;
    signal?: AbortSignal;
    onProgress?: (message: string) => void;
}
export interface CascadeResult {
    /** Files whose verified passages cleared the threshold, strongest first. */
    hits: FindHit[];
    threshold: number;
    keywords: string[];
    stats: FindStats;
}
/** Run one cascade search over `options.root`. Judge failures degrade coverage and are reported in `stats.failures`, never thrown. */
export declare function runCascade(options: CascadeOptions): Promise<CascadeResult>;
