/**
 * Query-derived keywords for the lexical prior: quoted phrases whole, then
 * alphanumeric tokens minus stopwords, cheaply stemmed and deduplicated.
 */
/** Keywords for the grep prior: quoted phrases whole, then tokens minus stopwords. */
export declare function keywordsFromQuery(query: string): string[];
/** {@link keywordsFromQuery} plus the caller's extra keywords, lowercased and deduplicated. */
export declare function keywords(query: string, extra: readonly string[]): string[];
