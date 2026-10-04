/** Semantic selector engines resolved in-page by the exported Chromium query handlers. */
export type TernSemanticEngine = "label" | "placeholder" | "testid" | "alt" | "title" | "role";
/** Parsed selector, JSON-safe, resolved in-page by the Tern page kit. */
export type TernSelector = {
    engine: "css";
    query: string;
}
/** Puppeteer text engine: deepest elements whose text content includes the query. */
 | {
    engine: "text";
    query: string;
}
/** Puppeteer aria syntax `aria/Name[role="button"]`; a missing name matches any name. */
 | {
    engine: "aria";
    name?: string;
    role?: string;
} | {
    engine: "xpath";
    query: string;
}
/** CSS through open shadow roots. */
 | {
    engine: "pierce";
    query: string;
} | {
    engine: TernSemanticEngine;
    query: string;
}
/** `eN` from the last `ariaSnapshot` in this document. */
 | {
    engine: "ariaRef";
    ref: string;
}
/** Numeric id from the last `observe()` in this document. */
 | {
    engine: "id";
    id: number;
}
/** Element marked by the kit's `mark()`. */
 | {
    engine: "handle";
    token: string;
};
/** Parse a browser-tool selector string into a {@link TernSelector}. Throws ToolError on unsupported syntax. */
export declare function parseTernSelector(selector: string): TernSelector;
