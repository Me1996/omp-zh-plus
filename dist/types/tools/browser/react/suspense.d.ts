import type { Page } from "puppeteer-core";
/** Options controlling React Suspense boundary filtering. */
export interface ReactSuspenseOptions {
    onlyDynamic?: boolean;
}
/** Current and historical state for one React Suspense boundary. */
export interface ReactSuspenseBoundary {
    id: number;
    name?: string;
    state: "pending" | "resolved";
    fallback?: unknown;
    classification: "static" | "dynamic";
}
/** Page expression listing Suspense boundaries; evaluates to a `ReactPageEnvelope<ReactSuspenseBoundary[]>`. */
export declare function reactSuspenseSource(options: ReactSuspenseOptions): string;
/** List mounted React Suspense boundaries and whether each has ever suspended. */
export declare function readReactSuspense(page: Page, options?: ReactSuspenseOptions, signal?: AbortSignal): Promise<ReactSuspenseBoundary[]>;
