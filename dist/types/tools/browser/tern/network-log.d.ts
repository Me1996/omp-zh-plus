import { type HarContentPolicy, type NetworkPattern, type NetworkRequestDetail, type NetworkRequestRecord, type NetworkRequestsOptions, type NetworkResponseBody, type NetworkRouteDescription, type NetworkRouteOptions } from "../network.js";
import type { TernRouteRule } from "./page-capture.js";
/** One logged request; `pageId` addresses its body in the page that made it. */
export interface TernRequestEntry extends NetworkRequestRecord {
    /** The capture script's id (`<document>:<n>`), absent for navigations. */
    pageId?: string;
    /** Frame path of the document that made it (null: the main frame). */
    frame?: string | null;
    /** Order in which its response (or failure) arrived; absent while in flight. */
    settledSeq?: number;
    /** Response status text. */
    statusText?: string;
    /** Whether a route answered it. */
    routed?: boolean;
}
/** Loads a request's captured body from the page (null when the page no longer has it). */
export type TernBodyLoader = (entry: TernRequestEntry) => Promise<NetworkResponseBody | null>;
/** Request log, routes and HAR recording of one Tern tab. */
export declare class TernNetworkLog {
    #private;
    /** Sequence the next record gets (a cursor for "requests after now"). */
    get cursor(): number;
    /** How many responses/failures arrived so far (a cursor for "responses after now"). */
    get settleCursor(): number;
    /** Record a capture-script network message (`kind` = request/response/requestfailed). */
    ingestPageMessage(message: Record<string, unknown>): void;
    /** Record a navigation response Tern reported (`main`: the main frame's document). */
    ingestNavigationResponse(event: Record<string, unknown>): TernRequestEntry;
    /** Record a navigation Tern's allowlist blocked. */
    ingestBlocked(url: string): void;
    /** Records whose response (or failure) arrived after `settleCursor`, in arrival order. */
    settledAfter(settleCursor: number): TernRequestEntry[];
    /** Query the log like `BrowserNetworkManager.requests`. */
    requests(options?: NetworkRequestsOptions): NetworkRequestRecord[];
    /** One record with its body, loaded from the page on demand. */
    request(id: string | number, loadBody: TernBodyLoader): Promise<NetworkRequestDetail>;
    /** Forget every record. */
    clear(): void;
    /** Begin a HAR recording of subsequent records. */
    harStart(content?: HarContentPolicy): void;
    /** Finish the HAR recording and return the HAR document. */
    harStop(loadBody: TernBodyLoader): Promise<object>;
    /** Register a persistent route (applied by the page to fetch/XHR). */
    route(pattern: NetworkPattern, options?: NetworkRouteOptions): void;
    /** Remove matching routes, or all of them. */
    unroute(pattern?: NetworkPattern): void;
    /** JSON-safe route descriptions. */
    routes(): NetworkRouteDescription[];
    /** Routes as the capture script applies them. */
    rules(): TernRouteRule[];
}
