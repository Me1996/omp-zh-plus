import type { Device, NetworkConditions, Page } from "puppeteer-core";
/** Viewport dimensions accepted by runtime emulation. */
export interface EmulationViewport {
    /** Viewport width in CSS pixels. */
    width: number;
    /** Viewport height in CSS pixels. */
    height: number;
    /** Device scale factor. */
    scale?: number;
}
/** Coordinates accepted by runtime geolocation emulation. */
export interface EmulationGeolocation {
    /** Latitude in decimal degrees. */
    latitude: number;
    /** Longitude in decimal degrees. */
    longitude: number;
    /** Position accuracy in meters. */
    accuracy?: number;
}
/** HTTP basic-auth credentials applied to the page. */
export interface EmulationCredentials {
    /** Basic-auth username. */
    username: string;
    /** Basic-auth password. */
    password: string;
}
/** Custom network throughput in bytes per second plus latency in milliseconds. */
export interface EmulationNetworkConditions {
    /** Download throughput in bytes per second. */
    download: number;
    /** Upload throughput in bytes per second. */
    upload: number;
    /** Request latency in milliseconds. */
    latency: number;
}
/** Independently mergeable device, network, and media overrides for a browser tab. */
export interface BrowserEmulateOptions {
    /** Override viewport dimensions. */
    viewport?: EmulationViewport;
    /** Emulate a Puppeteer `KnownDevices` profile. */
    device?: string;
    /** Override coordinates, or clear the override with `null`. */
    geolocation?: EmulationGeolocation | null;
    /** Toggle offline mode. */
    offline?: boolean;
    /** Override the preferred color scheme. */
    colorScheme?: "dark" | "light" | "no-preference";
    /** Toggle reduced-motion preference. */
    reducedMotion?: boolean;
    /** Set extra HTTP headers, or clear them with `null`. */
    headers?: Record<string, string> | null;
    /** Set HTTP basic-auth credentials, or clear them with `null`. */
    credentials?: EmulationCredentials | null;
    /** Set a user agent, or clear it with `null` while retaining an active device UA. */
    userAgent?: string | null;
    /** Set an ICU timezone, or clear it with `null`. */
    timezone?: string | null;
    /** Set a locale, or clear it with `null`. */
    locale?: string | null;
    /** Set a CPU slowdown factor, or clear it with `null`. */
    cpuThrottling?: number | null;
    /** Set a network preset/custom profile, or clear it with `null`. */
    network?: "slow3g" | "fast3g" | EmulationNetworkConditions | null;
}
/** Result of a clipboard operation, identifying whether Chromium or the worker shim handled it. */
export interface ClipboardActionResult {
    /** Chromium page clipboard or in-worker round-trip shim. */
    source: "page" | "shim";
}
/** Clipboard text plus the source that supplied it. */
export interface ClipboardReadResult extends ClipboardActionResult {
    /** Clipboard plain text. */
    text: string;
}
type KnownDeviceMap = Readonly<Record<string, Device>>;
type KnownNetworkMap = Readonly<Record<string, NetworkConditions>>;
/** Apply a page-scoped user-agent override that remains active across navigations. */
export declare function applyUserAgentOverride(page: Page, userAgent: string): Promise<void>;
/** Owns persistent runtime emulation and clipboard state for one Puppeteer page. */
export declare class BrowserEmulationController {
    #private;
    constructor(page: Page, devices: KnownDeviceMap, networkConditions: KnownNetworkMap, baseUserAgent: string);
    /** Return all Puppeteer known-device names in stable order. */
    devices(): string[];
    /** Merge supplied overrides, apply the effective state, and return a detached state snapshot. */
    emulate(options?: BrowserEmulateOptions): Promise<BrowserEmulateOptions>;
    /** Re-apply every active override after a browser lifecycle resume. */
    reapply(): Promise<void>;
    /** Read text through the page clipboard, falling back only to a prior shim write. */
    clipboardRead(): Promise<ClipboardReadResult>;
    /** Write clipboard text through the page, retaining a worker shim only when Chromium blocks it. */
    clipboardWrite(text: string): Promise<ClipboardActionResult>;
    /** Copy the page's current selection using the platform keyboard shortcut. */
    clipboardCopy(): Promise<ClipboardActionResult>;
    /** Paste the page clipboard into the focused control using the platform keyboard shortcut. */
    clipboardPaste(): Promise<ClipboardActionResult>;
    /** Remove page listeners owned by this controller. */
    dispose(): void;
}
export {};
