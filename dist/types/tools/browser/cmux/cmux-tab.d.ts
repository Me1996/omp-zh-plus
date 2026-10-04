import { JsRuntime } from "../../../eval/js/shared/runtime.js";
import { type BrowserCaptureResult, type BrowserConsoleEntry, type BrowserConsoleOptions, type BrowserErrorEntry, type BrowserErrorOptions } from "../console-capture.js";
import { type BrowserA11yOptions, type BrowserA11yResult } from "../a11y/audit.js";
import type { BrowserEmulateOptions, ClipboardActionResult, ClipboardReadResult } from "../emulation.js";
import { type AriaSnapshotOptions } from "../aria/aria-snapshot.js";
import type { HarContentPolicy, NetworkPattern, NetworkRequestDetail, NetworkRequestRecord, NetworkRequestsOptions, NetworkRouteDescription, NetworkRouteOptions } from "../network.js";
import { type ReadableExtractOptions, type ReadableFormat } from "../readable.js";
import type { VitalsOptions, VitalsResult } from "../react/vitals.js";
import type { RecordingOptions, RecordingStartResult, RecordingStatus, RecordingStopResult } from "../recording.js";
import type { WebMcpEventsOptions, WebMcpEventsResult, WebMcpInvokeOptions, WebMcpInvokeResult, WebMcpListOptions, WebMcpListResult } from "../webmcp.js";
import { type AriaSnapshotDiffResult } from "../snapshot-plus.js";
import { type DiffScreenshotOptions, type DiffScreenshotResult, type PdfOptions, type ScreenshotOptions } from "../screenshot.js";
import type { InProcessRunContext, InProcessRunTab } from "../in-process-run.js";
import type { Observation, ReadyInfo, SessionSnapshot } from "../tab-protocol.js";
import type { CmuxSocketClient } from "./socket-client.js";
interface PageScreenshotOptions extends ScreenshotOptions {
    encoding?: "base64" | "binary";
}
interface ObserveOptions {
    includeAll?: boolean;
    viewportOnly?: boolean;
    selector?: string;
    compact?: boolean;
}
type WaitUntil = "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
type DragTarget = string | {
    readonly x: number;
    readonly y: number;
};
interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface CmuxResponseRecord {
    id: number;
    ts: number;
    method: string;
    resourceType: "fetch" | "xhr";
    url: string;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    requestHeaders: Record<string, string>;
    body: string;
    durationMs: number;
}
interface ViewportOptions {
    width: number;
    height: number;
    deviceScaleFactor?: number;
}
export declare class CmuxTab implements InProcessRunTab {
    #private;
    /** Guest file-name prefix of cmux runs. */
    readonly runLabel = "cmux-run";
    constructor(opts: {
        client: CmuxSocketClient;
        surfaceId: string;
        url?: string;
        title?: string;
    });
    get surfaceId(): string;
    get page(): CmuxPageFacade;
    get browser(): CmuxBrowserFacade;
    viewport(): ReadyInfo["viewport"];
    setViewport(viewport: ViewportOptions): Promise<void>;
    emulate(options?: BrowserEmulateOptions): Promise<BrowserEmulateOptions>;
    devices(): Promise<string[]>;
    clipboardRead(): Promise<ClipboardReadResult>;
    clipboardWrite(_text: string): Promise<ClipboardActionResult>;
    clipboardCopy(): Promise<ClipboardActionResult>;
    clipboardPaste(): Promise<ClipboardActionResult>;
    url(): string;
    title(): Promise<string>;
    readyInfo(viewport?: ReadyInfo["viewport"]): Promise<ReadyInfo>;
    setRunContext(context: InProcessRunContext): void;
    clearRunContext(): void;
    a11y(options?: BrowserA11yOptions): Promise<BrowserA11yResult>;
    cookies(options?: {
        urls?: string[];
    }): Promise<Array<{
        name: string;
        value: string;
        domain: string;
        path: string;
        expires: number;
        httpOnly: boolean;
        secure: boolean;
        sameSite: "Lax";
    }>>;
    setCookies(..._cookies: unknown[]): Promise<void>;
    clearCookies(_options?: {
        names?: string[];
    }): Promise<void>;
    storage(kind: "local" | "session", options?: {
        key?: string;
    }): Promise<Record<string, string> | string | null>;
    setStorage(kind: "local" | "session", keyOrEntries: string | Record<string, unknown>, value?: unknown): Promise<void>;
    clearStorage(kind: "local" | "session"): Promise<void>;
    saveState(_path?: string): Promise<string>;
    loadState(_path: string): Promise<{
        loadedOrigins: string[];
        skippedOrigins: string[];
    }>;
    goto(url: string, opts?: {
        waitUntil?: WaitUntil;
        timeoutMs?: number;
    }): Promise<void>;
    back(opts?: {
        waitUntil?: WaitUntil;
    }): Promise<string>;
    forward(opts?: {
        waitUntil?: WaitUntil;
    }): Promise<string>;
    reload(opts?: {
        waitUntil?: WaitUntil;
    }): Promise<string>;
    pushState(url: string): Promise<string>;
    frames(): Promise<never>;
    frame(_selectorOrNameOrUrl: string): Promise<never>;
    dialog(): Promise<never>;
    handleDialog(_opts: {
        accept: boolean;
        text?: string;
    }): Promise<never>;
    setDialogs(_policy: "accept" | "dismiss" | null): Promise<never>;
    observe(opts?: ObserveOptions): Promise<Observation>;
    ariaSnapshot(selector?: string, opts?: AriaSnapshotOptions): Promise<string | AriaSnapshotDiffResult>;
    ref(id: string): Promise<CmuxElementHandle>;
    click(selector: string): Promise<void>;
    dblclick(selector: string): Promise<void>;
    hover(selector: string): Promise<void>;
    focus(selector: string): Promise<void>;
    check(selector: string): Promise<void>;
    uncheck(selector: string): Promise<void>;
    keyDown(key: string): Promise<void>;
    keyUp(key: string): Promise<void>;
    mouseMove(x: number, y: number, opts?: {
        steps?: number;
    }): Promise<void>;
    mouseDown(opts?: {
        button?: string;
    }): Promise<void>;
    mouseUp(opts?: {
        button?: string;
    }): Promise<void>;
    clickAt(x: number, y: number, opts?: {
        button?: string;
        clickCount?: number;
    }): Promise<void>;
    wheel(deltaX: number, deltaY: number): Promise<void>;
    highlight(selector: string, opts?: {
        duration?: number;
    }): Promise<void>;
    type(selector: string, text: string): Promise<void>;
    fill(selector: string, value: string): Promise<void>;
    press(key: string, opts?: {
        selector?: string;
    }): Promise<void>;
    scroll(dx: number, dy: number, opts?: {
        selector?: string;
    }): Promise<void>;
    waitFor(selector: string, opts?: {
        timeout?: number;
    }): Promise<CmuxElementHandle>;
    waitForSelector(selector: string, opts?: {
        timeout?: number;
    }): Promise<CmuxElementHandle>;
    evaluate<R, TArgs extends unknown[]>(fn: string | ((...args: TArgs) => R | Promise<R>), ...args: TArgs): Promise<R>;
    scrollIntoView(selector: string): Promise<void>;
    select(selector: string, ...values: string[]): Promise<string[]>;
    extract(format?: ReadableFormat, opts?: ReadableExtractOptions): Promise<string>;
    screenshot(opts?: ScreenshotOptions): Promise<string>;
    diffScreenshot(baselinePath: string, opts?: DiffScreenshotOptions): Promise<DiffScreenshotResult>;
    pdf(_opts?: PdfOptions): Promise<string>;
    waitForUrl(pattern: string | RegExp, opts?: {
        timeout?: number;
    }): Promise<string>;
    /** Init scripts require CDP document-start registration. */
    addInitScript(_source: string): Promise<{
        id: string;
    }>;
    /** Init-script removal requires CDP document-start registration. */
    removeInitScript(_id: string): Promise<void>;
    /** Init-script enumeration requires CDP document-start registration. */
    initScripts(): Promise<Array<{
        id: string;
        source: string;
    }>>;
    /** Download completion events require the Chromium browser CDP domain. */
    waitForDownload(_opts?: {
        timeout?: number;
    }): Promise<{
        path: string;
        suggestedFilename: string;
        url: string;
        bytes: number;
    }>;
    /** Download history requires the Chromium browser CDP domain. */
    downloads(): Promise<Array<{
        path: string;
        suggestedFilename: string;
        url: string;
        bytes: number;
    }>>;
    route(_pattern: NetworkPattern, _options?: NetworkRouteOptions): Promise<void>;
    unroute(_pattern?: NetworkPattern): Promise<void>;
    routes(): Promise<NetworkRouteDescription[]>;
    requests(options?: NetworkRequestsOptions): Promise<NetworkRequestRecord[]>;
    request(id: string | number): Promise<NetworkRequestDetail>;
    clearRequests(): Promise<void>;
    harStart(_options?: {
        content?: HarContentPolicy;
    }): Promise<void>;
    harStop(_options?: {
        path?: string;
    }): Promise<string>;
    allowedDomains(): Promise<string[]>;
    webmcpList(_options?: WebMcpListOptions): Promise<WebMcpListResult>;
    webmcpInvoke(_name: string, _params: Record<string, unknown>, _options?: WebMcpInvokeOptions): Promise<WebMcpInvokeResult>;
    webmcpEvents(_options?: WebMcpEventsOptions): Promise<WebMcpEventsResult>;
    /** Collect available navigation and performance entries on the cmux surface. */
    vitals(options?: VitalsOptions): Promise<VitalsResult>;
    /** Report that React hook installation is unavailable on cmux surfaces. */
    reactEnable(): Promise<never>;
    /** Report that React tree inspection is unavailable on cmux surfaces. */
    reactTree(_options?: unknown): Promise<never>;
    /** Report that React fiber inspection is unavailable on cmux surfaces. */
    reactInspect(_id: number): Promise<never>;
    /** Report that React render recording is unavailable on cmux surfaces. */
    reactRenders(_options: unknown): Promise<never>;
    /** Report that Suspense inspection is unavailable on cmux surfaces. */
    reactSuspense(_options?: unknown): Promise<never>;
    console(options?: BrowserConsoleOptions): Promise<BrowserCaptureResult<BrowserConsoleEntry>>;
    errors(options?: BrowserErrorOptions): Promise<BrowserCaptureResult<BrowserErrorEntry>>;
    clearConsole(): Promise<void>;
    traceStart(options?: {
        screenshots?: boolean;
        categories?: string[];
    }): Promise<void>;
    traceStop(options?: {
        path?: string;
    }): Promise<string>;
    profileStart(): Promise<void>;
    profileStop(options?: {
        path?: string;
    }): Promise<string>;
    metrics(): Promise<Record<string, number> & {
        domContentLoaded: number;
        load: number;
    }>;
    recordStart(path: string, options?: RecordingOptions): Promise<RecordingStartResult>;
    recordStop(): Promise<RecordingStopResult>;
    recordRestart(path: string, options?: RecordingOptions): Promise<RecordingStartResult>;
    recording(): Promise<RecordingStatus>;
    text(selector: string): Promise<string | null>;
    html(selector: string): Promise<string | null>;
    value(selector: string): Promise<string | null>;
    attr(selector: string, name: string): Promise<string | null>;
    count(selector: string): Promise<number>;
    box(selector: string): Promise<BoundingBox | null>;
    styles(selector: string, props?: string[]): Promise<Record<string, string> | null>;
    isVisible(selector: string): Promise<boolean>;
    isEnabled(selector: string): Promise<boolean>;
    isChecked(selector: string): Promise<boolean>;
    waitForText(text: string, opts?: {
        timeout?: number;
        selector?: string;
        exact?: boolean;
    }): Promise<void>;
    waitForNavigation(opts?: {
        waitUntil?: WaitUntil;
        timeout?: number;
    }): Promise<null>;
    drag(from: DragTarget, to: DragTarget): Promise<void>;
    uploadFile(selector: string, ...filePaths: string[]): Promise<void>;
    waitForResponse(pattern: string | RegExp | ((response: CmuxResponse) => boolean | Promise<boolean>), opts?: {
        timeout?: number;
    }): Promise<CmuxResponse>;
    id(id: number): Promise<CmuxElementHandle>;
    ensureRuntime(session: SessionSnapshot): JsRuntime;
    elementHandle(selector: string): CmuxElementHandle;
    elementExists(selector: string): Promise<boolean>;
    elementBox(selector: string): Promise<BoundingBox | null>;
    elementCount(selector: string): Promise<number>;
    evaluateOnSelector<R>(selector: string, source: string, args: unknown[]): Promise<R>;
    /** Evaluate a JSON-safe read against the first matching element, returning `null` when absent. */
    queryElement<R>(selector: string, source: string, args?: unknown[]): Promise<R | null>;
    pageContent(): Promise<string>;
    pageScreenshot(opts?: PageScreenshotOptions): Promise<Buffer | string>;
    waitForFunction(fn: string | ((...args: unknown[]) => unknown | Promise<unknown>), opts: {
        timeout?: number;
        polling?: number;
    } | undefined, ...args: unknown[]): Promise<unknown>;
}
declare class CmuxResponse {
    #private;
    constructor(record: CmuxResponseRecord);
    url(): string;
    status(): number;
    statusText(): string;
    headers(): Record<string, string>;
    text(): Promise<string>;
    json(): Promise<unknown>;
}
declare class CmuxElementHandle {
    #private;
    constructor(tab: CmuxTab, selector: string);
    click(): Promise<void>;
    dblclick(): Promise<void>;
    check(): Promise<void>;
    uncheck(): Promise<void>;
    highlight(opts?: {
        duration?: number;
    }): Promise<void>;
    type(text: string): Promise<void>;
    fill(value: string): Promise<void>;
    press(key: string): Promise<void>;
    focus(): Promise<void>;
    hover(): Promise<void>;
    evaluate<R, TArgs extends unknown[]>(fn: (element: unknown, ...args: TArgs) => R | Promise<R>, ...args: TArgs): Promise<R>;
    boundingBox(): Promise<BoundingBox | null>;
    text(): Promise<string>;
    html(): Promise<string>;
    value(): Promise<string | null>;
    attr(name: string): Promise<string | null>;
    styles(props?: string[]): Promise<Record<string, string>>;
    isEnabled(): Promise<boolean>;
    isChecked(): Promise<boolean>;
    uploadFile(...paths: string[]): Promise<void>;
    dispose(): Promise<void>;
}
declare class CmuxLocator {
    #private;
    constructor(tab: CmuxTab, selector: string);
    setTimeout(timeoutMs: number): this;
    click(): Promise<void>;
    fill(value: string): Promise<void>;
    waitHandle(): Promise<CmuxElementHandle>;
}
declare class CmuxPageFacade {
    #private;
    readonly keyboard: {
        press: (key: string) => Promise<void>;
    };
    readonly mouse: {
        wheel: (delta: {
            deltaX?: number;
            deltaY?: number;
        }) => Promise<void>;
        move: (x: number, y: number) => Promise<void>;
        down: () => Promise<void>;
        up: () => Promise<void>;
    };
    constructor(tab: CmuxTab);
    url(): string;
    title(): Promise<string>;
    viewport(): ReadyInfo["viewport"];
    setViewport(viewport: ViewportOptions): Promise<void>;
    goto(url: string, opts?: {
        waitUntil?: WaitUntil;
        timeout?: number;
    }): Promise<{
        url: string;
    }>;
    evaluate<R, TArgs extends unknown[]>(fn: string | ((...args: TArgs) => R | Promise<R>), ...args: TArgs): Promise<R>;
    content(): Promise<string>;
    locator(selector: string): CmuxLocator;
    $(selector: string): Promise<CmuxElementHandle | null>;
    waitForSelector(selector: string, opts?: {
        timeout?: number;
    }): Promise<CmuxElementHandle>;
    waitForFunction(fn: string | ((...args: unknown[]) => unknown | Promise<unknown>), opts?: {
        timeout?: number;
        polling?: number;
    }, ...args: unknown[]): Promise<unknown>;
    waitForResponse(pattern: string | RegExp | ((response: CmuxResponse) => boolean | Promise<boolean>), opts?: {
        timeout?: number;
    }): Promise<CmuxResponse>;
    screenshot(opts?: PageScreenshotOptions): Promise<Buffer | string>;
}
declare class CmuxBrowserFacade {
    #private;
    connected: boolean;
    constructor(tab: CmuxTab);
    pages(): Promise<CmuxPageFacade[]>;
    version(): Promise<string>;
    wsEndpoint(): string;
    disconnect(): void;
    close(): Promise<void>;
}
export {};
