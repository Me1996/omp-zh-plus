import type { EvalLanguage } from "../eval.js";
export * from "./javascript.js";
export * from "./python.js";
/** Formats an arbitrary eval-code prefix for display without changing the executed source. */
export declare function formatEvalCodeForDisplay(source: string, language: EvalLanguage): string;
