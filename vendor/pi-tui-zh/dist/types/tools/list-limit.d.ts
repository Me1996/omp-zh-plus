import type { LimitsMeta } from "./output-meta.js";
/** Items retained after applying output limits and their metadata. */
export interface ListLimitResult<T> {
    items: T[];
    limitReached?: number;
    meta: Partial<LimitsMeta>;
}
/** Limits applied to result lists and display previews. */
export interface ListLimitOptions {
    limit?: number;
    headLimit?: number;
    limitType?: "match" | "result";
}
/** Apply result and preview limits while retaining truncation metadata. */
export declare function applyListLimit<T>(items: T[], options: ListLimitOptions): ListLimitResult<T>;
