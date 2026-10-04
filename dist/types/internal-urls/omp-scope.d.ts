import type { InternalUrl, ResolveContext } from "./types.js";
/** Host + path of an `omp://` URL, exactly as the handler reads it; `""` when the URL names the docs root. */
export declare function ompDocFilename(url: InternalUrl): string;
/**
 * Canonical doc path relative to `docs/` for an `omp://` URL, or `""` for the
 * docs root (`omp://`, `omp:///`, `omp://docs`, `omp://docs/`). Throws on
 * absolute paths and `..` traversal — the rejections the handler reports.
 */
export declare function ompDocRel(url: InternalUrl): string;
/** One embedded doc of a `omp://` root scope. */
interface OmpDocEntry {
    /** Canonical `omp://<rel>` URL. */
    url: string;
    /** Doc text. */
    content: string;
}
/**
 * Every embedded doc for a root scope, in docs-index (sorted) order. Empty
 * when no docs corpus is reachable.
 */
export declare function ompDocsScopeEntries(context?: ResolveContext): Promise<OmpDocEntry[]>;
export {};
