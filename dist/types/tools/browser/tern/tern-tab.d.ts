import { JsRuntime } from "../../../eval/js/shared/runtime.js";
import { type BrowserA11yOptions, type BrowserA11yResult } from "../a11y/audit.js";
import { type AriaSnapshotOptions } from "../aria/aria-snapshot.js";
import type { BrowserCaptureResult, BrowserConsoleEntry, BrowserConsoleOptions, BrowserErrorEntry, BrowserErrorOptions } from "../console-capture.js";
import type { DialogPolicy, DialogState } from "../dialogs.js";
import type { BrowserDownload } from "../downloads.js";
import type { BrowserEmulateOptions, ClipboardActionResult, ClipboardReadResult } from "../emulation.js";
import type { BrowserFrameInfo } from "../frames.js";
import type { InProcessRunContext, InProcessRunTab } from "../in-process-run.js";
import type { HarContentPolicy, NetworkPattern, NetworkRequestDetail, NetworkRequestRecord, NetworkRequestsOptions, NetworkResponseBody, NetworkRouteDescription, NetworkRouteOptions } from "../network.js";
import { type ReadableExtractOptions, type ReadableFormat } from "../readable.js";
import { type ReactEnableResult } from "../react/devtools-hook.js";
import { type ReactRendersAction, type ReactRendersResult } from "../react/renders.js";
import { type ReactSuspenseBoundary, type ReactSuspenseOptions } from "../react/suspense.js";
import { type ReactInspectResult, type ReactTreeNode, type ReactTreeOptions } from "../react/tree.js";
import { type VitalsOptions, type VitalsResult } from "../react/vitals.js";
import { type RecordingOptions, type RecordingStartResult, type RecordingStatus, type RecordingStopResult } from "../recording.js";
import { type DiffScreenshotOptions, type DiffScreenshotResult, type PdfOptions, type ScreenshotChangeResult, type ScreenshotOptions } from "../screenshot.js";
import { type AriaSnapshotDiffResult } from "../snapshot-plus.js";
import { type BrowserCookie, type ClearCookiesOptions, type CookieQueryOptions, type LoadStateResult, type StorageKind } from "../storage-state.js";
import type { Observation, ReadyInfo, SessionSnapshot } from "../tab-protocol.js";
import { type WebMcpEventsOptions, type WebMcpEventsResult, type WebMcpInvokeOptions, type WebMcpInvokeResult, type WebMcpListOptions, type WebMcpListResult } from "../webmcp.js";
import { type TernRequestEntry } from "./network-log.js";
import { type TernSelector } from "./selectors.js";
import { type TernSocketClient } from "./wire.js";
type WaitUntil = "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
type DragTarget = string | {
    readonly x: number;
    readonly y: number;
};
type MouseButtonName = "left" | "right" | "middle" | "back" | "forward";
/** Where an operation runs: the main frame (`null`) or a registered frame path. */
type FramePath = string | null;
interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface ViewportOptions {
    width: number;
    height: number;
    deviceScaleFactor?: number;
}
/** Options of {@link TernTab.open}. */
export interface TernOpenOptions {
    /** Managed tab name (names the saved-state file). */
    name: string;
    /** Pane that owns the PiP (`TERN_PANE`). */
    pane: number;
    /** First real navigation after configuration. */
    url?: string;
    /** Lifecycle the first navigation awaits. */
    waitUntil?: WaitUntil;
    /** Page layout size. */
    viewport: ViewportOptions;
    /** Budget of the whole open. */
    timeoutMs: number;
    /** Abandons the open. */
    signal?: AbortSignal;
    /** Automatic dialog policy. */
    dialogs?: DialogPolicy;
    /** Hostname allowlist. */
    allowedDomains?: string[];
    /** Document-start scripts. */
    initScripts?: string[];
    /** Download directory. */
    downloadsPath?: string;
    /** User agent override. */
    userAgent?: string;
    /** Accept invalid TLS certificates. */
    ignoreHttpsErrors?: boolean;
}
/**
 * The page function running a user source string: an expression's value, or
 * — when the source is a statement list rather than an expression — the
 * statements as a function body. The choice is made by compiling (never
 * running) both candidates here, so the code runs exactly once in the page;
 * source that compiles as neither goes as an expression and the page reports
 * its syntax error.
 */
export declare function userSourceFunction(source: string): string;
/**
 * The Tern backend's tab: one PiP (`block`) and the state its helpers keep —
 * the event cursor, console and request logs, dialog/download/frame state,
 * emulation, scripts, pointer and modifier state.
 */
export declare class TernTab implements InProcessRunTab {
    #private;
    /** Guest file-name prefix of Tern runs. */
    readonly runLabel = "tern-run";
    /** The PiP's block id (daemon-native). */
    readonly block: number;
    constructor(opts: {
        client: TernSocketClient;
        block: number;
        name: string;
        viewport: ViewportOptions;
    });
    /**
     * Open a PiP over pane `opts.pane` at `about:blank`, configure it (dialog
     * policy, allowlist, agent, TLS, downloads, scripts) and only then make the
     * first real navigation. The PiP closes again when configuration fails,
     * and when the open was abandoned (timeout/abort) but Tern answered late.
     */
    static open(client: TernSocketClient, opts: TernOpenOptions): Promise<TernTab>;
    /** The `page` facade `tab.run` code sees. */
    get page(): TernPageFacade;
    /** The `browser` facade `tab.run` code sees. */
    get browser(): TernBrowserFacade;
    /** The tab's JavaScript runtime for `tab.run`. */
    ensureRuntime(session: SessionSnapshot): JsRuntime;
    /** Publish the active run. */
    setRunContext(context: InProcessRunContext): void;
    /** Forget the finished run. */
    clearRunContext(): void;
    /** Page facts the supervisor records for the tab. */
    readyInfo(): Promise<ReadyInfo>;
    /** Close the PiP (its page goes). A PiP already gone is no error. */
    close(opts: {
        timeoutMs: number;
    }): Promise<void>;
    /** Navigate and wait for `waitUntil` (default `load`). */
    goto(url: string, opts?: {
        waitUntil?: WaitUntil;
        timeoutMs?: number;
    }): Promise<void>;
    /** {@link goto}, resolving the main document's response (null when none was reported). */
    gotoResponse(url: string, opts?: {
        waitUntil?: WaitUntil;
        timeoutMs?: number;
    }): Promise<TernResponse | null>;
    /** Go back one history entry (no-op at the start of history). */
    back(opts?: {
        waitUntil?: WaitUntil;
    }): Promise<string>;
    /** Go forward one history entry (no-op at the end of history). */
    forward(opts?: {
        waitUntil?: WaitUntil;
    }): Promise<string>;
    /** Reload the document. */
    reload(opts?: {
        waitUntil?: WaitUntil;
    }): Promise<string>;
    /** Client-side navigation (`history.pushState`). */
    pushState(url: string): Promise<string>;
    /** Wait for the next navigation (start it before the action that navigates). */
    waitForNavigation(opts?: {
        waitUntil?: WaitUntil;
        timeout?: number;
    }): Promise<TernResponse | null>;
    /** Wait until the URL contains `pattern` (string) or matches it (RegExp). */
    waitForUrl(pattern: string | RegExp, opts?: {
        timeout?: number;
    }): Promise<string>;
    /** The current URL (as last reported). */
    url(): string;
    /** The title as last reported (title events, state, observe), without asking the page. */
    get lastTitle(): string;
    /** The document title. */
    title(): Promise<string>;
    /** The page layout size. */
    viewport(): ReadyInfo["viewport"];
    /** Resize the PiP's page (`viewport` op); `deviceScaleFactor` scales captures. */
    setViewport(viewport: ViewportOptions): Promise<void>;
    /** Click the element's centre with a trusted mouse click. */
    click(selector: string): Promise<void>;
    /** {@link click} inside `frame`. */
    clickIn(selector: string | TernSelector, frame: FramePath): Promise<void>;
    /** Double-click the element's centre. */
    dblclick(selector: string | TernSelector, frame?: FramePath): Promise<void>;
    /** Move the pointer over the element's centre. */
    hover(selector: string | TernSelector, frame?: FramePath): Promise<void>;
    /** Focus the element. */
    focus(selector: string | TernSelector, frame?: FramePath): Promise<void>;
    /** Check a checkbox, radio or ARIA switch (clicks only when needed). */
    check(selector: string | TernSelector, frame?: FramePath): Promise<void>;
    /** Uncheck a checkbox or ARIA switch (clicks only when needed). */
    uncheck(selector: string | TernSelector, frame?: FramePath): Promise<void>;
    /** Type `text` at the end of the element's content with trusted key events. */
    type(selector: string | TernSelector, text: string, frame?: FramePath): Promise<void>;
    /** Replace the element's value (trusted text input for text controls). */
    fill(selector: string | TernSelector, value: string, frame?: FramePath): Promise<void>;
    /** Press a key (or `Mod+Key` combo), optionally after focusing an element. */
    press(key: string, opts?: {
        selector?: string;
    }): Promise<void>;
    /** {@link press} inside `frame`. */
    pressIn(key: string, opts: {
        selector?: string | TernSelector;
    } | undefined, frame: FramePath): Promise<void>;
    /** Hold a key down (modifiers apply to later input). */
    keyDown(key: string): Promise<void>;
    /** Release a held key. */
    keyUp(key: string): Promise<void>;
    /** Move the pointer (interpolated over `steps`); a held button drags. */
    mouseMove(x: number, y: number, opts?: {
        steps?: number;
    }): Promise<void>;
    /** Press a mouse button at the pointer. */
    mouseDown(opts?: {
        button?: MouseButtonName;
        clickCount?: number;
    }): Promise<void>;
    /** Release a mouse button at the pointer. */
    mouseUp(opts?: {
        button?: MouseButtonName;
        clickCount?: number;
    }): Promise<void>;
    /** Click at viewport coordinates. */
    clickAt(x: number, y: number, opts?: {
        button?: MouseButtonName;
        clickCount?: number;
    }): Promise<void>;
    /** A trusted wheel event at the pointer (the viewport centre before any pointer move). */
    wheel(deltaX: number, deltaY: number): Promise<void>;
    /** Scroll the page (trusted wheel at the viewport centre) or an element (`scrollBy`). */
    scroll(dx: number, dy: number, opts?: {
        selector?: string;
    }): Promise<void>;
    /** Trusted drag from one selector/point to another. */
    drag(from: DragTarget, to: DragTarget): Promise<void>;
    /** Outline the element for `duration` ms (default 2000). */
    highlight(selector: string | TernSelector, opts?: {
        duration?: number;
    }): Promise<void>;
    /** Scroll the element into view. */
    scrollIntoView(selector: string | TernSelector): Promise<void>;
    /** Select `<select>` options by value (then label). */
    select(selector: string | TernSelector, ...values: string[]): Promise<string[]>;
    /**
     * Upload files: a file input (or its label) gets the files through Tern's
     * native chooser (preset, then opened); any other element gets them dropped.
     */
    uploadFile(selector: string | TernSelector, ...filePaths: string[]): Promise<void>;
    /** The element's rendered text, or null. */
    text(selector: string | TernSelector, frame?: FramePath): Promise<string | null>;
    /** The element's inner HTML, or null. */
    html(selector: string | TernSelector, frame?: FramePath): Promise<string | null>;
    /** The form element's value, or null. */
    value(selector: string | TernSelector, frame?: FramePath): Promise<string | null>;
    /** One attribute, or null. */
    attr(selector: string | TernSelector, name: string, frame?: FramePath): Promise<string | null>;
    /** How many elements match. */
    count(selector: string | TernSelector, frame?: FramePath): Promise<number>;
    /** The element's box in main-frame viewport px, or null. */
    box(selector: string | TernSelector, frame?: FramePath): Promise<BoundingBox | null>;
    /** Computed styles, or null. */
    styles(selector: string | TernSelector, props?: string[]): Promise<Record<string, string> | null>;
    /** Whether the element is visible. */
    isVisible(selector: string | TernSelector, frame?: FramePath): Promise<boolean>;
    /** Whether the element is enabled. */
    isEnabled(selector: string | TernSelector): Promise<boolean>;
    /** Whether the element is checked. */
    isChecked(selector: string | TernSelector): Promise<boolean>;
    /** Wait until `text` appears in the body (or a matching element). */
    waitForText(text: string, opts?: {
        timeout?: number;
        selector?: string;
        exact?: boolean;
    }): Promise<void>;
    /** Wait for a visible matching element and return its handle. */
    waitFor(selector: string, opts?: {
        timeout?: number;
    }): Promise<TernElementHandle>;
    /** {@link waitFor} inside `frame`. */
    waitForIn(selector: string | TernSelector, opts: {
        timeout?: number;
    } | undefined, frame: FramePath): Promise<TernElementHandle>;
    /** Wait for a matching element (`visible`/`hidden` like Puppeteer); null once hidden/absent. */
    waitForSelector(selector: string, opts?: {
        timeout?: number;
        visible?: boolean;
        hidden?: boolean;
    }): Promise<TernElementHandle | null>;
    /** {@link waitForSelector} inside `frame`. */
    waitForSelectorIn(selector: string | TernSelector, opts: {
        timeout?: number;
        visible?: boolean;
        hidden?: boolean;
    } | undefined, frame: FramePath): Promise<TernElementHandle | null>;
    /** One handle per current match of `selector`, in document order. */
    handlesFor(selector: string): Promise<TernElementHandle[]>;
    /** Handle for observation id `id` (from the last `observe()`). */
    id(id: number): Promise<TernElementHandle>;
    /** Handle for ARIA snapshot ref `eN` (from the last `ariaSnapshot()`). */
    ref(id: string): Promise<TernElementHandle>;
    /** Type `text` into whatever has focus (trusted key events). */
    keyboardType(text: string): Promise<void>;
    /** Poll a page-world predicate until it returns a truthy value. */
    waitForFunction(fn: string | ((...args: unknown[]) => unknown | Promise<unknown>), opts: {
        timeout?: number;
        polling?: number;
    } | undefined, args: unknown[]): Promise<unknown>;
    /** Evaluate a function (or expression/statement source) in the page world. */
    evaluate<R, TArgs extends unknown[]>(fn: string | ((...args: TArgs) => R | Promise<R>), ...args: TArgs): Promise<R>;
    /** {@link evaluate} inside `frame`. */
    evaluateIn(fn: unknown, args: unknown[], frame: FramePath): Promise<unknown>;
    /** Evaluate `fn(element, ...args)` in the page world for the element `spec` matches. */
    evaluateOnElement(spec: TernSelector, fn: unknown, args: unknown[], frame: FramePath): Promise<unknown>;
    /** Structured observation of interactive (or all) elements; ids feed `tab.id(n)`. */
    observe(opts?: {
        includeAll?: boolean;
        viewportOnly?: boolean;
        selector?: string;
        compact?: boolean;
    }): Promise<Observation>;
    /** Playwright-format ARIA snapshot (refs resolve through `ref()`/`aria-ref=`). */
    ariaSnapshot(selector?: string, opts?: AriaSnapshotOptions): Promise<string | AriaSnapshotDiffResult>;
    /** {@link ariaSnapshot} inside `frame`. */
    ariaSnapshotIn(selector: string | undefined, opts: AriaSnapshotOptions | undefined, frame: FramePath): Promise<string | AriaSnapshotDiffResult>;
    /** axe-core audit of the main document (run in the isolated world). */
    a11y(options?: BrowserA11yOptions): Promise<BrowserA11yResult>;
    /** Readable text/markdown of the page. */
    extract(format?: ReadableFormat, opts?: ReadableExtractOptions): Promise<string>;
    /** The document's outer HTML. */
    pageContent(): Promise<string>;
    /** Capture raw image bytes: viewport, full page, or an element (optionally in a frame). */
    captureBytes(opts: {
        selector?: string | TernSelector;
        fullPage?: boolean;
        format: "png" | "jpeg";
        quality?: number;
    }, frame?: FramePath): Promise<Buffer>;
    /** Screenshot with selector/fullPage/annotate/format/quality and change detection. */
    screenshot(opts?: ScreenshotOptions): Promise<string | ScreenshotChangeResult>;
    /** {@link screenshot} inside `frame` (selector captures). */
    screenshotIn(opts: ScreenshotOptions, frame: FramePath): Promise<string | ScreenshotChangeResult>;
    /** Compare the viewport with a PNG baseline and show the highlighted diff. */
    diffScreenshot(baselinePath: string, opts?: DiffScreenshotOptions): Promise<DiffScreenshotResult>;
    /** Print the page to PDF (WKWebView pagination; layout options unsupported). */
    pdf(opts?: PdfOptions): Promise<string>;
    /** Main and child frames; child ids are Tern frame paths (`0`, `1.0`). */
    frames(): Promise<BrowserFrameInfo[]>;
    /** A child frame by `<iframe>` selector, frame name, frame id/path, or exact URL. */
    frame(selectorOrNameOrUrl: string): Promise<TernFrame>;
    /** The confirm/prompt Tern holds for a decision. */
    dialog(): Promise<DialogState>;
    /** Accept or dismiss the held dialog. */
    handleDialog(opts: {
        accept: boolean;
        text?: string;
    }): Promise<void>;
    /** Change the automatic dialog policy (null: alerts accepted, confirms/prompts held). */
    setDialogs(policy: DialogPolicy | null): Promise<void>;
    /** Merge emulation overrides; unsupported ones throw before anything applies. */
    emulate(options?: BrowserEmulateOptions): Promise<BrowserEmulateOptions>;
    /** Puppeteer known-device names. */
    devices(): Promise<string[]>;
    /** Read the system clipboard (Tern's `clipboard` op). */
    clipboardRead(): Promise<ClipboardReadResult>;
    /** Write the system clipboard. */
    clipboardWrite(text: string): Promise<ClipboardActionResult>;
    /** Copy the page selection to the system clipboard. */
    clipboardCopy(): Promise<ClipboardActionResult>;
    /** Paste the system clipboard into the focused control. */
    clipboardPaste(): Promise<ClipboardActionResult>;
    /** Cookies visible to the current page (or `urls`). */
    cookies(options?: CookieQueryOptions): Promise<BrowserCookie[]>;
    /** Store cookies (objects, Cookie headers, cURL dumps, JSON arrays). */
    setCookies(...args: unknown[]): Promise<void>;
    /** Delete the current page's cookies (or only `names`). */
    clearCookies(options?: ClearCookiesOptions): Promise<void>;
    /** One Web Storage area of the current origin, or one key. */
    storage(kind: StorageKind, options?: {
        key?: string;
    }): Promise<Record<string, string> | string | null>;
    /** Set one key or several. */
    setStorage(kind: StorageKind, keyOrEntries: string | Record<string, unknown>, value?: unknown): Promise<void>;
    /** Clear one Web Storage area. */
    clearStorage(kind: StorageKind): Promise<void>;
    /** Save every cookie of the PiP's store plus the current origin's storage. */
    saveState(requestedPath?: string): Promise<string>;
    /** Restore cookies and the current origin's storage; other origins are reported as skipped. */
    loadState(requestedPath: string): Promise<LoadStateResult>;
    /** Run `source` in every future document (all frames). */
    addInitScript(source: string): Promise<{
        id: string;
    }>;
    /** Stop running a registered script in future documents. */
    removeInitScript(id: string): Promise<void>;
    /** Registered init scripts. */
    initScripts(): Promise<Array<{
        id: string;
        source: string;
    }>>;
    /** Wait for the next completed download. */
    waitForDownload(opts?: {
        timeout?: number;
    }): Promise<BrowserDownload>;
    /** Completed downloads of this tab. */
    downloads(): Promise<BrowserDownload[]>;
    /** Captured console messages (page world, from document start). */
    console(options?: BrowserConsoleOptions): Promise<BrowserCaptureResult<BrowserConsoleEntry>>;
    /** Captured uncaught errors and failed requests. */
    errors(options?: BrowserErrorOptions): Promise<BrowserCaptureResult<BrowserErrorEntry>>;
    /** Clear the console/error buffer. */
    clearConsole(): Promise<void>;
    /**
     * Load a captured response body from the frame that made the request,
     * waiting (within the op budget and the run's signal) for a body the page
     * is still reading.
     */
    loadBody: (entry: TernRequestEntry) => Promise<NetworkResponseBody | null>;
    /** Register a persistent fetch/XHR route. */
    route(pattern: NetworkPattern, options?: NetworkRouteOptions): Promise<void>;
    /** Remove matching routes, or all. */
    unroute(pattern?: NetworkPattern): Promise<void>;
    /** Registered routes. */
    routes(): Promise<NetworkRouteDescription[]>;
    /** Query the request log. */
    requests(options?: NetworkRequestsOptions): Promise<NetworkRequestRecord[]>;
    /** One request with its captured body. */
    request(id: string | number): Promise<NetworkRequestDetail>;
    /** Clear the request log. */
    clearRequests(): Promise<void>;
    /** Start a HAR recording. */
    harStart(options?: {
        content?: HarContentPolicy;
    }): Promise<void>;
    /** Stop the HAR recording and write it. */
    harStop(options?: {
        path?: string;
    }): Promise<string>;
    /** The normalised hostname allowlist. */
    allowedDomains(): Promise<string[]>;
    /** Wait for a matching fetch/XHR/navigation response after now. */
    waitForResponse(pattern: string | RegExp | ((response: TernResponse) => boolean | Promise<boolean>), opts?: {
        timeout?: number;
    }): Promise<TernResponse>;
    /** Navigation timing of the current document. */
    metrics(): Promise<Record<string, number> & {
        domContentLoaded: number;
        load: number;
    }>;
    /** Web Vitals of the current document (observers run from document start). */
    vitals(options?: VitalsOptions): Promise<VitalsResult>;
    /** Install the React DevTools hook and reload. */
    reactEnable(): Promise<ReactEnableResult>;
    /** The mounted React tree. */
    reactTree(options?: ReactTreeOptions): Promise<ReactTreeNode[]>;
    /** One React fiber. */
    reactInspect(id: number): Promise<ReactInspectResult>;
    /** React render recording. */
    reactRenders(options: {
        action: ReactRendersAction;
    }): Promise<ReactRendersResult>;
    /** React Suspense boundaries. */
    reactSuspense(options?: ReactSuspenseOptions): Promise<ReactSuspenseBoundary[]>;
    /** Page-provided WebMCP tools (main frame). */
    webmcpList(options?: WebMcpListOptions): Promise<WebMcpListResult>;
    /** Invoke one page-provided WebMCP tool. */
    webmcpInvoke(name: string, params: Record<string, unknown>, options?: WebMcpInvokeOptions): Promise<WebMcpInvokeResult>;
    /** WebMCP catalog changes. */
    webmcpEvents(options?: WebMcpEventsOptions): Promise<WebMcpEventsResult>;
    /** Record the PiP to MP4/WebM from repeated captures. */
    recordStart(rawPath: string, options?: RecordingOptions): Promise<RecordingStartResult>;
    /** Finalize the recording. */
    recordStop(): Promise<RecordingStopResult>;
    /** Finalize and immediately start another recording. */
    recordRestart(rawPath: string, options?: RecordingOptions): Promise<RecordingStartResult>;
    /** Recording state. */
    recording(): Promise<RecordingStatus>;
    /** Unsupported: WKWebView has no tracing protocol. */
    traceStart(_options?: {
        screenshots?: boolean;
        categories?: string[];
    }): Promise<never>;
    /** Unsupported: WKWebView has no tracing protocol. */
    traceStop(_options?: {
        path?: string;
    }): Promise<never>;
    /** Unsupported: WKWebView has no CPU profiler protocol. */
    profileStart(): Promise<never>;
    /** Unsupported: WKWebView has no CPU profiler protocol. */
    profileStop(_options?: {
        path?: string;
    }): Promise<never>;
}
/** A response seen by the Tern tab: fetch/XHR (body from the page) or a navigation (no body). */
export declare class TernResponse {
    #private;
    constructor(record: TernRequestEntry, tab: TernTab);
    /** The response URL. */
    url(): string;
    /** The HTTP status. */
    status(): number;
    /** The status text. */
    statusText(): string;
    /** Whether the status is 2xx. */
    ok(): boolean;
    /** Response headers (lower-case names). */
    headers(): Record<string, string>;
    /** The request's method and URL. */
    request(): {
        url(): string;
        method(): string;
        resourceType(): string;
    };
    /** The body as text (fetch/XHR responses the page still holds). */
    text(): Promise<string>;
    /** The body parsed as JSON. */
    json(): Promise<unknown>;
}
/** Element handle of the Tern tab (`tab.id(n)`, `tab.ref(eN)`, `waitFor`). */
export declare class TernElementHandle {
    #private;
    constructor(tab: TernTab, spec: TernSelector, frame: FramePath);
    /** Trusted click at the element's centre. */
    click(): Promise<void>;
    /** Trusted double click. */
    dblclick(): Promise<void>;
    /** Check it. */
    check(): Promise<void>;
    /** Uncheck it. */
    uncheck(): Promise<void>;
    /** Outline it. */
    highlight(opts?: {
        duration?: number;
    }): Promise<void>;
    /** Type at the end of its content. */
    type(text: string): Promise<void>;
    /** Replace its value. */
    fill(value: string): Promise<void>;
    /** Focus it and press a key. */
    press(key: string): Promise<void>;
    /** Hover it. */
    hover(): Promise<void>;
    /** Focus it. */
    focus(): Promise<void>;
    /** Select options. */
    select(...values: string[]): Promise<string[]>;
    /** Upload files. */
    uploadFile(...filePaths: string[]): Promise<void>;
    /** Scroll it into view. */
    scrollIntoView(): Promise<void>;
    /** Its box in main-frame viewport px. */
    boundingBox(): Promise<BoundingBox | null>;
    /** Whether it is visible. */
    isVisible(): Promise<boolean>;
    /** Whether it is hidden. */
    isHidden(): Promise<boolean>;
    /** Its rendered text. */
    text(): Promise<string>;
    /** Its inner HTML. */
    html(): Promise<string>;
    /** Its form value. */
    value(): Promise<string | null>;
    /** One attribute. */
    attr(name: string): Promise<string | null>;
    /** Computed styles. */
    styles(props?: string[]): Promise<Record<string, string>>;
    /** Whether it is enabled. */
    isEnabled(): Promise<boolean>;
    /** Whether it is checked. */
    isChecked(): Promise<boolean>;
    /** Evaluate `fn(element, ...args)` in the page world. */
    evaluate<R, TArgs extends unknown[]>(fn: string | ((element: unknown, ...args: TArgs) => R | Promise<R>), ...args: TArgs): Promise<R>;
    /** Handles hold no page resources. */
    dispose(): Promise<void>;
}
/** A child frame of the Tern tab (`tab.frame(...)`), addressed by its Tern frame path. */
export declare class TernFrame {
    #private;
    constructor(tab: TernTab, framePath: string);
    /** The frame path (`0`, `1.0`). */
    get path(): string;
    /** Click inside the frame. */
    click(selector: string): Promise<void>;
    /** Fill inside the frame. */
    fill(selector: string, value: string): Promise<void>;
    /** Type inside the frame. */
    type(selector: string, text: string): Promise<void>;
    /** Press a key, optionally after focusing an element in the frame. */
    press(key: string, options?: {
        selector?: string;
    }): Promise<void>;
    /** Element text. */
    text(selector: string): Promise<string>;
    /** Element inner HTML. */
    html(selector: string): Promise<string>;
    /** Form value. */
    value(selector: string): Promise<string>;
    /** One attribute. */
    attr(selector: string, name: string): Promise<string | null>;
    /** Match count. */
    count(selector: string): Promise<number>;
    /** Visibility. */
    isVisible(selector: string): Promise<boolean>;
    /** ARIA snapshot of the frame. */
    ariaSnapshot(selector?: string, options?: AriaSnapshotOptions): Promise<string>;
    /** Evaluate in the frame's page world. */
    evaluate<R, TArgs extends unknown[]>(fn: string | ((...args: TArgs) => R | Promise<R>), ...args: TArgs): Promise<R>;
    /** Wait for a visible element; reports whether it appeared. */
    waitFor(selector: string, options?: {
        timeout?: number;
    }): Promise<boolean>;
    /** Wait for an element; reports whether it appeared. */
    waitForSelector(selector: string, options?: {
        timeout?: number;
        visible?: boolean;
        hidden?: boolean;
    }): Promise<boolean>;
    /** Capture an element of the frame. */
    screenshot(selector: string): Promise<string>;
}
/** `page.locator()` of the Tern page facade. */
declare class TernLocator {
    #private;
    constructor(tab: TernTab, selector: string);
    setTimeout(timeoutMs: number): this;
    click(): Promise<void>;
    fill(value: string): Promise<void>;
    hover(): Promise<void>;
    waitHandle(): Promise<TernElementHandle>;
}
/**
 * The `page` object `tab.run` code sees on the Tern backend: a Puppeteer-like
 * subset (navigation, evaluate, content, locator/$/$$, waits, screenshot,
 * keyboard, mouse, cookies, user agent) over the tab's helpers.
 */
export declare class TernPageFacade {
    #private;
    /** Keyboard input (trusted key events). */
    readonly keyboard: {
        press: (key: string) => Promise<void>;
        type: (text: string) => Promise<void>;
        down: (key: string) => Promise<void>;
        up: (key: string) => Promise<void>;
    };
    /** Pointer input (trusted mouse events). */
    readonly mouse: {
        move: (x: number, y: number, options?: {
            steps?: number;
        }) => Promise<void>;
        down: (options?: {
            button?: MouseButtonName;
        }) => Promise<void>;
        up: (options?: {
            button?: MouseButtonName;
        }) => Promise<void>;
        click: (x: number, y: number, options?: {
            button?: MouseButtonName;
            count?: number;
        }) => Promise<void>;
        wheel: (delta: {
            deltaX?: number;
            deltaY?: number;
        }) => Promise<void>;
    };
    constructor(tab: TernTab);
    url(): string;
    title(): Promise<string>;
    viewport(): ReadyInfo["viewport"];
    setViewport(viewport: ViewportOptions): Promise<void>;
    setUserAgent(userAgent: string): Promise<void>;
    goto(url: string, opts?: {
        waitUntil?: WaitUntil;
        timeout?: number;
    }): Promise<TernResponse | null>;
    reload(opts?: {
        waitUntil?: WaitUntil;
    }): Promise<null>;
    goBack(opts?: {
        waitUntil?: WaitUntil;
    }): Promise<null>;
    goForward(opts?: {
        waitUntil?: WaitUntil;
    }): Promise<null>;
    evaluate<R, TArgs extends unknown[]>(fn: string | ((...args: TArgs) => R | Promise<R>), ...args: TArgs): Promise<R>;
    content(): Promise<string>;
    locator(selector: string): TernLocator;
    $(selector: string): Promise<TernElementHandle | null>;
    $$(selector: string): Promise<TernElementHandle[]>;
    click(selector: string): Promise<void>;
    type(selector: string, text: string): Promise<void>;
    waitForSelector(selector: string, opts?: {
        timeout?: number;
        visible?: boolean;
        hidden?: boolean;
    }): Promise<TernElementHandle | null>;
    waitForFunction(fn: string | ((...args: unknown[]) => unknown | Promise<unknown>), opts?: {
        timeout?: number;
        polling?: number;
    }, ...args: unknown[]): Promise<unknown>;
    waitForResponse(pattern: string | RegExp | ((response: TernResponse) => boolean | Promise<boolean>), opts?: {
        timeout?: number;
    }): Promise<TernResponse>;
    waitForNavigation(opts?: {
        waitUntil?: WaitUntil;
        timeout?: number;
    }): Promise<TernResponse | null>;
    screenshot(opts?: {
        encoding?: "base64" | "binary";
        fullPage?: boolean;
        type?: "png" | "jpeg";
        quality?: number;
    }): Promise<Buffer | string>;
    cookies(...urls: string[]): Promise<BrowserCookie[]>;
    setCookie(...cookies: unknown[]): Promise<void>;
}
/** The `browser` object `tab.run` code sees on the Tern backend. */
export declare class TernBrowserFacade {
    #private;
    /** Whether the facade still counts as connected. */
    connected: boolean;
    constructor(tab: TernTab);
    pages(): Promise<TernPageFacade[]>;
    version(): Promise<string>;
    wsEndpoint(): string;
    disconnect(): void;
    close(): Promise<void>;
}
export {};
