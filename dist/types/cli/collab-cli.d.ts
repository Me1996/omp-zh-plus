import { type CollabHostSnapshot, type CollabListOptions, type CollabResolvedLink } from "../collab/registry.js";
export interface CollabListCommandArgs {
    /** Emit deterministic machine-readable JSON. */
    json: boolean;
    /** Registry overrides (tests). */
    registry?: CollabListOptions;
}
export interface CollabLinkCommandArgs {
    selector: string;
    /** Request a view-only link instead of control access. */
    view: boolean;
    json: boolean;
    /** Registry overrides (tests). */
    registry?: CollabListOptions;
}
/** Versioned top-level JSON shape for `omp collab list --json`. */
export interface CollabListJsonOutput {
    version: number;
    hosts: CollabHostSnapshot[];
}
/** Versioned capability response for `omp collab link --json`. */
export interface CollabLinkJsonOutput extends CollabResolvedLink {
    version: number;
}
export declare function runCollabListCommand(args: CollabListCommandArgs, print?: (line: string) => void): Promise<void>;
export declare function runCollabLinkCommand(args: CollabLinkCommandArgs, print?: (line: string) => void): Promise<void>;
