import type { ElementHandle, Page } from "puppeteer-core";
/** Options accepted by tab.screenshot(). */
export interface ScreenshotOptions {
    selector?: string;
    fullPage?: boolean;
    silent?: boolean;
    annotate?: boolean;
    format?: "png" | "jpeg";
    quality?: number;
    ifChanged?: boolean;
    threshold?: number;
}
/** Stateful screenshot result returned when change detection is enabled. */
export interface ScreenshotChangeResult {
    path?: string;
    changed: boolean;
    revision: number;
    pixelChangeRatio: number;
}
/** A previous PNG capture and its monotonic scope-local revision. */
export interface ScreenshotHistory {
    png: Uint8Array;
    revision: number;
}
/** Options accepted by tab.diffScreenshot(). */
export interface DiffScreenshotOptions {
    threshold?: number;
    output?: string;
}
/** Pixel-diff summary returned by tab.diffScreenshot(). */
export interface DiffScreenshotResult {
    pixelChangeRatio: number;
    changed: boolean;
    diffPath: string;
}
/** PDF margins accepted by tab.pdf(). */
export interface PdfMargin {
    top?: string | number;
    bottom?: string | number;
    left?: string | number;
    right?: string | number;
}
/** Options accepted by tab.pdf(). */
export interface PdfOptions {
    path?: string;
    format?: "letter" | "legal" | "tabloid" | "ledger" | "a0" | "a1" | "a2" | "a3" | "a4" | "a5" | "a6";
    landscape?: boolean;
    scale?: number;
    printBackground?: boolean;
    margin?: PdfMargin;
    pageRanges?: string;
}
/** One numbered interactive element rendered over an annotated screenshot. */
export interface ScreenshotAnnotationTarget {
    id: number;
    role: string;
    name?: string;
    x: number;
    y: number;
    width: number;
    height: number;
}
/** Decoded 8-bit PNG pixels in RGBA order. */
export interface DecodedPng {
    width: number;
    height: number;
    pixels: Uint8Array;
}
/** Resolve the history bucket for a page, full-page, or selector capture. */
export declare function screenshotScope(opts: ScreenshotOptions): string;
/** Validate and normalize a changed-pixel ratio threshold. */
export declare function screenshotThreshold(value: number | undefined): number;
/** Validate JPEG quality and reject quality on PNG captures. */
export declare function screenshotQuality(opts: ScreenshotOptions): number | undefined;
/**
 * Capture a page or element screenshot without crossing the worker boundary.
 * Puppeteer hands back a plain `Uint8Array`, not a Node `Buffer`: encode it with
 * `.toBase64()`, never `.toString("base64")` (which serializes decimal bytes).
 */
export declare function captureScreenshotBuffer(page: Page, opts: ScreenshotOptions, signal: AbortSignal | undefined, resolveSelector: (selector: string) => Promise<ElementHandle | null>, format?: "png" | "jpeg"): Promise<Uint8Array>;
/** Page function (self-contained): draw numbered outlines for `payload.targets` under a root tagged with `payload.token`. */
export declare function installAnnotationOverlayInPage(payload: {
    token: string;
    targets: ScreenshotAnnotationTarget[];
}): void;
/** Page function (self-contained): remove the overlay installed with `token`. */
export declare function removeAnnotationOverlayInPage(token: string): void;
/** Install numbered annotation overlays and return an abort-aware cleanup function. */
export declare function installScreenshotAnnotations(page: Page, targets: readonly ScreenshotAnnotationTarget[], signal: AbortSignal | undefined): Promise<() => Promise<void>>;
/** Format an explicitly delimited, page-derived annotation legend. */
export declare function formatScreenshotLegend(targets: readonly ScreenshotAnnotationTarget[]): string;
/** Decode an unpaletted, non-interlaced 8-bit PNG into RGBA pixels. */
export declare function decodePng(buffer: Uint8Array): DecodedPng;
/** Encode RGBA pixels as a non-interlaced 8-bit PNG. */
export declare function encodePng(image: DecodedPng): Buffer;
/** Calculate the fraction of pixels that differ beyond rasterizer noise between two PNG images. */
export declare function pngPixelChangeRatio(previous: Uint8Array, current: Uint8Array): number;
/** Build a PNG that highlights changed pixels in magenta over a dimmed current image. */
export declare function createPngDiff(baseline: Uint8Array, current: Uint8Array): {
    png: Buffer;
    pixelChangeRatio: number;
};
