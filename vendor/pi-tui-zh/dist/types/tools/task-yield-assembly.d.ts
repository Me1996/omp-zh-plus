import type { YieldItem } from "./task.js";
/**
 * Output-schema shape of each declared top-level property, keyed by incremental yield label.
 * `array` sections accumulate into a list (even a lone yield); `scalar` sections keep the
 * latest yield, since the schema admits exactly one value. Undeclared labels accumulate
 * into a list only once repeated.
 */
export type YieldSectionShapes = ReadonlyMap<string, "array" | "scalar">;
/** Outcome of folding a run's yield calls into one payload, with provenance flags. */
interface AssembledYieldResult {
    data: unknown;
    schemaOverridden: boolean;
    rawText: boolean;
    missingData: boolean;
}
/**
 * Assemble typed yield calls into the final payload consumed by schema validation.
 *
 * A non-empty array `type` contributes an incremental section and never decides
 * termination by itself. A string `type` with omitted `data` makes the last
 * assistant turn the raw terminal result. Other string-typed yields contribute
 * the terminal labelled section. Untyped terminal yields keep the historical
 * "last yield wins" behavior unless no terminal yield exists, in which case
 * accumulated typed sections finalize on idle. Repeated sections merge per
 * `sectionShapes` (see {@link YieldSectionShapes}).
 */
export declare function assembleYieldResult(yieldItems: YieldItem[], lastAssistantText?: string, sectionShapes?: YieldSectionShapes): AssembledYieldResult | undefined;
export {};
