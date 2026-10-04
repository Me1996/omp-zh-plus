/**
 * Standalone TUI model picker used by `omp setup speech`.
 *
 * One-shot {@link selectStandaloneItem} prompt: resolve on select/cancel and
 * let the adapter tear the UI down. The standalone TUI auto-renders on input,
 * so no manual render wiring is needed.
 */
import { type SelectItem } from "../components/select-list.js";
/**
 * Show a single-column model picker and resolve with the chosen item's value,
 * or `null` if the user cancelled. `currentValue` pre-selects the matching row.
 */
export declare function selectSetupModel(title: string, items: SelectItem[], currentValue: string): Promise<string | null>;
