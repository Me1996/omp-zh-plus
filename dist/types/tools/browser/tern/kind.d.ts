/** Browser kind selecting a Tern browser PiP. */
export interface TernKind {
    kind: "tern";
    /** The Tern daemon socket (`TERN_PANE_SOCKET`). */
    socketPath: string;
    /** The pane omp runs in (`TERN_PANE`), which owns the PiPs. */
    pane: number;
}
/** Inputs of {@link resolveTernKind}. */
export interface ResolveTernKindOptions {
    /** `browser.tern` setting (default true); `PI_BROWSER_TERN=0|1` overrides it. */
    settingEnabled?: boolean;
}
/**
 * Resolve the Tern browser kind, or null when omp is not in a Tern pane or
 * Tern mode is off. Mirrors `resolveCmuxKind`: the setting opts in, the env
 * var is the final override in both directions.
 */
export declare function resolveTernKind(options?: ResolveTernKindOptions | null, env?: Record<string, string | undefined>): TernKind | null;
