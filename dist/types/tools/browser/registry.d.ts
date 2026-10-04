import type { Subprocess } from "bun";
import type { Browser, CDPSession } from "puppeteer-core";
import type { CmuxKind } from "./cmux/rpc.js";
import { CmuxSocketClient } from "./cmux/socket-client.js";
import { type UserAgentOverride } from "./launch.js";
import type { RelayKind } from "./relay/kind.js";
import type { TernKind } from "./tern/kind.js";
import { TernSocketClient } from "./tern/wire.js";
export type PuppeteerBrowserKind = {
    kind: "headless";
    headless: boolean;
    /** Process-local launch flag; shared browsers use the tab-scoped CDP override instead. */
    ignoreHttpsErrors?: boolean;
    /** Process-local file access launch flag, unsupported by an already-running shared browser. */
    allowFileAccess?: boolean;
} | {
    kind: "spawned";
    path: string;
    args?: string[];
} | {
    kind: "connected";
    cdpUrl: string;
} | RelayKind;
export type BrowserKind = PuppeteerBrowserKind | CmuxKind | TernKind;
export type BrowserKindTag = BrowserKind["kind"];
interface BrowserHandleCommon {
    key: string;
    kind: BrowserKind;
    refCount: number;
}
export interface PuppeteerBrowserHandle extends BrowserHandleCommon {
    kind: PuppeteerBrowserKind;
    browser: Browser;
    cdpUrl?: string;
    pid?: number;
    /** OMP-owned temp Chromium profile directory removed on dispose (process-local headless launches). */
    userDataDir?: string;
    /** Broker daemon backing this handle; dispose disconnects instead of closing, kill routes to the broker. */
    sharedDaemon?: {
        name: string;
        projectDir: string;
    };
    subprocess?: Subprocess;
    stealth: {
        browserSession: CDPSession | null;
        override: UserAgentOverride | null;
    };
}
export interface CmuxBrowserHandle extends BrowserHandleCommon {
    kind: CmuxKind;
    client: CmuxSocketClient;
    surface?: string;
}
/** A connection to the Tern daemon whose browser PiPs host this handle's tabs. */
export interface TernBrowserHandle extends BrowserHandleCommon {
    kind: TernKind;
    /** The daemon connection every tab of this handle drives its PiP through. */
    tern: TernSocketClient;
}
export type BrowserHandle = PuppeteerBrowserHandle | CmuxBrowserHandle | TernBrowserHandle;
/** Controls bounded browser-handle teardown and identifies the owning resource in timeout diagnostics. */
export interface ReleaseBrowserOptions {
    kill: boolean;
    timeoutMs?: number;
    resource?: string;
}
export declare function browserKey(kind: BrowserKind): string;
export interface AcquireBrowserOptions {
    cwd: string;
    viewport?: {
        width: number;
        height: number;
        deviceScaleFactor?: number;
    };
    signal?: AbortSignal;
}
export declare function acquireBrowser(kind: BrowserKind, opts: AcquireBrowserOptions): Promise<BrowserHandle>;
export declare function normalizeConnectedCdpUrl(rawCdpUrl: string): string;
export declare function holdBrowser(handle: BrowserHandle): void;
export declare function releaseBrowser(handle: BrowserHandle, opts: ReleaseBrowserOptions): Promise<void>;
/** Test-only accessor for the module-global browsers map. */
export declare function getBrowsersMapForTest(): ReadonlyMap<string, BrowserHandle>;
export {};
