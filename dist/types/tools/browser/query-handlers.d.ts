import type { CustomQueryHandler, default as PuppeteerInstance } from "puppeteer-core";
/** Root node Puppeteer passes to a custom query handler (the document for page-level queries). */
type QueryNode = Parameters<NonNullable<CustomQueryHandler["queryAll"]>>[0];
/**
 * `label/` handler: controls whose `<label>` text, `aria-label`, or `aria-labelledby` text contains the
 * query (case-insensitive).
 */
export declare function queryByLabel(node: QueryNode, selector: string): Element[];
/** `placeholder/` handler: elements whose `placeholder` contains the query (case-insensitive). */
export declare function queryByPlaceholder(node: QueryNode, selector: string): Element[];
/** `testid/` handler: elements whose `data-testid` equals the trimmed query. */
export declare function queryByTestId(node: QueryNode, selector: string): Element[];
/** `alt/` handler: elements whose `alt` contains the query (case-insensitive). */
export declare function queryByAlt(node: QueryNode, selector: string): Element[];
/** `title/` handler: elements whose `title` contains the query (case-insensitive). */
export declare function queryByTitle(node: QueryNode, selector: string): Element[];
/**
 * `role/` handler: `role[name="…" exact]` — explicit or implicit ARIA role, optionally filtered by
 * accessible name.
 */
export declare function queryByRole(node: QueryNode, selector: string): Element[];
/** Semantic selector prefixes (`label/`, `role/`, …) and their self-contained `queryAll` handlers. */
export declare const SEMANTIC_QUERY_HANDLERS: {
    readonly label: typeof queryByLabel;
    readonly placeholder: typeof queryByPlaceholder;
    readonly testid: typeof queryByTestId;
    readonly alt: typeof queryByAlt;
    readonly title: typeof queryByTitle;
    readonly role: typeof queryByRole;
};
/** Register the browser tool's semantic selector prefixes on a worker-local Puppeteer instance. */
export declare function registerSemanticQueryHandlers(puppeteer: typeof PuppeteerInstance): void;
export {};
