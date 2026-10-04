import type { Page } from "puppeteer-core";
/** Render-recording lifecycle action. */
export type ReactRendersAction = "start" | "stop" | "status";
/** Aggregate render cost for one React component display name. */
export interface ReactRenderComponent {
    name: string;
    renders: number;
    totalMs: number;
}
/** React commit and component render counts collected by the hook. */
export interface ReactRendersResult {
    active?: boolean;
    commits: number;
    components: ReactRenderComponent[];
}
/** Page expression applying `action` to commit recording; evaluates to a `ReactPageEnvelope<ReactRendersResult>`. */
export declare function reactRendersSource(action: ReactRendersAction): string;
/** Start, stop, or inspect React commit recording for the current document. */
export declare function collectReactRenders(page: Page, options: {
    action: ReactRendersAction;
}, signal?: AbortSignal): Promise<ReactRendersResult>;
