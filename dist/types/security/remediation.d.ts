import type { IsoBackendKind } from "@oh-my-pi/pi-natives";
import type { IsolationHandle, WorktreeBaseline } from "../task/worktree.js";
export interface SecurityRemediationRequest {
    cwd: string;
    findingIds: string[];
    isolationId?: string;
    preferredBackend?: IsoBackendKind;
}
export interface SecurityRemediationWorkspace {
    id: string;
    repositoryRoot: string;
    worktreePath: string;
    findingIds: string[];
    backend: IsoBackendKind;
    fellBack: boolean;
    fallbackReason: string | null;
    cleanup(): Promise<void>;
}
/** Source checkout a remediation workspace is copied from, with its dirty-state baseline. */
export interface SecurityRemediationContext {
    repoRoot: string;
    baseline: WorktreeBaseline;
}
export interface SecurityRemediationDependencies {
    prepareContext?: (cwd: string) => Promise<SecurityRemediationContext>;
    createIsolation?: (repositoryRoot: string, id: string, preferred?: IsoBackendKind) => Promise<IsolationHandle>;
    cleanupIsolation?: (handle: IsolationHandle) => Promise<void>;
    createId?: () => string;
}
export declare function assertSecurityRemediationBaselineClean(baseline: WorktreeBaseline): void;
export declare function prepareSecurityRemediationWorkspace(request: SecurityRemediationRequest, dependencies?: SecurityRemediationDependencies): Promise<SecurityRemediationWorkspace>;
