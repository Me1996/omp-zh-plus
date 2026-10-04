/** Snapshot post-processing switches independent of Playwright's renderer. */
export interface SnapshotPostProcessOptions {
    /** Keep interactive nodes and the structural path leading to them. */
    interactive?: boolean;
    /** Remove unnamed structural wrappers that do not contain interactive controls. */
    compact?: boolean;
    /** Append resolved link destinations to link entries. */
    urls?: boolean;
}
/** A resolved link destination keyed by its ARIA snapshot ref. */
export type AriaHrefMap = Readonly<Record<string, string>>;
/** A revisioned ARIA snapshot result returned when diff mode is enabled. */
export type AriaSnapshotDiffResult = {
    status: "full";
    revision: number;
    snapshot: string;
} | {
    status: "unchanged";
    revision: number;
} | {
    status: "delta";
    revision: number;
    baseRevision: number;
    delta: string;
};
/** One retained baseline for a particular selector and option set. */
export interface AriaSnapshotBaseline {
    url: string;
    revision: number;
    snapshot: string;
}
/** Apply interactive, compact, and URL decorations to rendered ARIA YAML. */
export declare function postProcessAriaSnapshot(snapshot: string, options?: SnapshotPostProcessOptions, hrefs?: AriaHrefMap): string;
/** Extract the distinct eN refs present in rendered snapshot YAML. */
export declare function collectAriaSnapshotRefs(snapshot: string): string[];
/** Build a stable baseline key excluding the `diff` output-mode switch. */
export declare function ariaSnapshotBaselineKey(selector: string | undefined, options: SnapshotPostProcessOptions & {
    depth?: number;
    boxes?: boolean;
}): string;
/** Update one keyed snapshot baseline and return its compact revision result. */
export declare function diffAriaSnapshot(baselines: Map<string, AriaSnapshotBaseline>, key: string, url: string, snapshot: string): AriaSnapshotDiffResult;
