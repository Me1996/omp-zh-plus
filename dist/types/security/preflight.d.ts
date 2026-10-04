import type { SecurityAuthRef, SecurityModelRef, SecurityOutputPlan, SecurityScanPlan } from "./contracts/index.js";
export type SecurityTargetRequest = {
    kind: "repository";
    includePaths?: string[];
    excludePaths?: string[];
} | {
    kind: "scoped_path";
    includePaths: string[];
    excludePaths?: string[];
} | {
    kind: "ref_diff";
    baseRevision: string;
    headRevision: string;
    includePaths?: string[];
    excludePaths?: string[];
} | {
    kind: "working_tree";
    includePaths?: string[];
    excludePaths?: string[];
};
export interface SecurityPlanRequest {
    cwd: string;
    target: SecurityTargetRequest;
    knowledgeBasePaths?: string[];
    outputRoot: string;
    archiveExisting?: boolean;
    model: SecurityModelRef;
    account: SecurityAuthRef;
    config: unknown;
    workflowFingerprint: string;
    signal?: AbortSignal;
    createdAt?: string;
}
export interface SecurityPlanFreshnessInput {
    config: unknown;
    workflowFingerprint: string;
    signal?: AbortSignal;
}
export interface SecurityGitAdapter {
    root(cwd: string, signal?: AbortSignal): Promise<string | null>;
    headSha(cwd: string, signal?: AbortSignal): Promise<string | null>;
    resolveRef(cwd: string, refName: string, signal?: AbortSignal): Promise<string | null>;
    diffTree(cwd: string, base: string, head: string, signal?: AbortSignal): Promise<string>;
    status(cwd: string, signal?: AbortSignal): Promise<string>;
    files(cwd: string, signal?: AbortSignal): Promise<string[]>;
    untracked(cwd: string, signal?: AbortSignal): Promise<string[]>;
}
export declare const DEFAULT_SECURITY_GIT_ADAPTER: SecurityGitAdapter;
export declare class StaleSecurityScanPlanError extends Error {
    readonly expected: string;
    readonly actual: string;
    constructor(expected: string, actual: string);
}
/** Lexical containment check: `candidate` equals `root` or lies beneath it (no normalization). */
export declare function pathIsWithin(candidate: string, root: string): boolean;
export declare function pathMatchesSecurityScope(relativePath: string, includePaths: readonly string[], excludePaths: readonly string[]): boolean;
export interface PreparedSecurityOutput {
    root: string;
    archivedTo?: string;
}
export declare function prepareSecurityOutputDirectory(output: SecurityOutputPlan, archiveSuffix?: string): Promise<PreparedSecurityOutput>;
export declare function createSecurityScanPlan(request: SecurityPlanRequest, adapter?: SecurityGitAdapter): Promise<SecurityScanPlan>;
export declare function assertSecurityScanPlanFresh(plan: SecurityScanPlan, freshness: SecurityPlanFreshnessInput, adapter?: SecurityGitAdapter): Promise<void>;
