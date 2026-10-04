import type { YieldSectionShapes } from "@oh-my-pi/pi-tui-zh/tools/task-yield-assembly";
/**
 * Shape of every top-level output-schema property, for `assembleYieldResult`.
 *
 * Properties are collected from the root and its `allOf`/`oneOf`/`anyOf` branches, matching
 * the labels the yield gate accepts. Array-declared properties (JTD `elements` → JSON
 * `type: "array"`) accumulate into a list even when the agent emits exactly one section —
 * otherwise a single `type: ["findings"]` yield would assemble as a bare object and fail
 * array-typed validation. Other declared properties are scalar: a repeated yield (e.g. a
 * revised `explanation` after async jobs settle) replaces the earlier value instead of
 * assembling an array the schema rejects. A label declared array in one branch and scalar
 * in another gets no shape, keeping the undeclared-label merge.
 */
export declare function yieldSectionShapes(outputSchema: unknown): YieldSectionShapes;
