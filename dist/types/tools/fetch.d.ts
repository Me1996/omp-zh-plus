import type { ReadUrlToolDetails } from "@oh-my-pi/pi-tui-zh/tools/fetch";
import type { AgentToolResult } from "@oh-my-pi/pi-agent-core";
import { type FetchImpl } from "@oh-my-pi/pi-ai";
import type { Settings } from "../config/settings.js";
import type { ToolSession } from "../sdk.js";
import type { AgentStorage } from "../session/agent-storage.js";
import type { ParsedSelector } from "./read-selector.js";
/** A readable external URL split from its trailing read selector. */
export interface ParsedReadUrlTarget {
    path: string;
    sel: ParsedSelector;
}
export declare function parseReadUrlTarget(readPath: string): ParsedReadUrlTarget | null;
/** Reader backends for {@link renderHtmlToText}, in default priority order. */
export type FetchProvider = "native" | "trafilatura" | "lynx" | "parallel" | "firecrawl" | "jina";
/**
 * Render HTML to markdown by trying reader backends in priority order: native
 * (in-process), trafilatura, lynx, Parallel, Firecrawl, then Jina. The
 * `providers.fetch` setting picks the order — `auto` uses the default above; any
 * specific backend is tried first, then the remaining backends as fallbacks.
 * Every backend's output must clear the same quality gate (>100 non-whitespace
 * chars and not {@link isLowQualityOutput}) before it is accepted, otherwise the
 * next backend is tried.
 *
 * The overall `timeout` budget bounds the whole call; remote backends (Parallel,
 * Firecrawl, Jina) are additionally capped at `REMOTE_READER_MAX_MS` so a hung
 * endpoint cannot starve later renderers — especially the purely-local native
 * converter, which always works on already-loaded HTML. Only a real `userSignal`
 * cancellation aborts the chain (#1449).
 */
export declare function renderHtmlToText(url: string, html: string, timeout: number, settings: Settings, userSignal: AbortSignal | undefined, storage: AgentStorage | null, fetchOverride?: FetchImpl): Promise<{
    content: string;
    ok: boolean;
    method: string;
}>;
interface FetchImagePayload {
    data: string;
    mimeType: string;
}
interface ReadUrlEntry {
    artifactId?: string;
    artifactPath?: string;
    details: ReadUrlToolDetails;
    image?: FetchImagePayload;
    output: string;
    content: string;
}
/** Fetch and render a URL for a read or search operation. */
export declare function fetchReadUrl(session: ToolSession, params: {
    path: string;
    raw?: boolean;
}, signal?: AbortSignal, options?: {
    ensureArtifact?: boolean;
}): Promise<ReadUrlEntry>;
/** Materialize rendered URL body text to a local file for tools that require filesystem paths. */
export declare function materializeReadUrlToFile(session: ToolSession, params: {
    path: string;
    raw?: boolean;
}, signal?: AbortSignal): Promise<{
    path: string;
    details: ReadUrlToolDetails;
}>;
export declare function executeReadUrl(session: ToolSession, params: {
    path: string;
    raw?: boolean;
}, signal?: AbortSignal): Promise<AgentToolResult<ReadUrlToolDetails>>;
export {};
