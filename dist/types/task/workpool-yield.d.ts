/** Item identity exposed to a workpool worker's incremental `yield` tool. */
export interface WorkPoolYieldItem {
    id: string;
    index: number;
}
/** Build the per-batch output schema used to assemble one yield per item. */
export declare function buildWorkPoolOutputSchema(items: WorkPoolYieldItem[]): Record<string, unknown>;
