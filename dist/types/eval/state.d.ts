import type { ToolSession } from "../tools/index.js";
/** Language identifiers used by retained-kernel lifecycle notifications. */
export type EvalStateLanguage = "python" | "js";
/** A backend's observed kernel lifecycle or successful script-load event. */
export interface EvalStateUpdate {
    language: EvalStateLanguage;
    kernelId?: string;
    alive: boolean;
    environment?: string;
    interpreter?: string;
    loadedPath?: string;
}
/** Runtime identity and bounded load history; never contains user values. */
export interface EvalRuntimeState {
    language: EvalStateLanguage;
    kernelId?: string;
    generation: number;
    alive: boolean;
    environment?: string;
    interpreter?: string;
    cwd: string;
    loadedPaths: readonly string[];
    loadedPathsOmitted: number;
    updatedAt: number;
}
/** Live-host runtime state visible to a session and its shared-kernel owners. */
export interface EvalStateSnapshot {
    sessionId: string;
    cwd: string;
    runtimes: readonly EvalRuntimeState[];
}
/**
 * Records a real retained-runtime lifecycle transition.
 *
 * Actual kernel identities are retained separately. Owner membership keeps a
 * shared base kernel visible to parent and child sessions while an owner-scoped
 * reset fork remains private to its requester. A new identity in the same
 * lineage starts a generation with empty file-load history.
 */
export declare function updateEvalState(session: ToolSession, update: EvalStateUpdate): void;
/** Returns the current process's retained runtimes relevant to this tool session. */
export declare function getEvalState(session: ToolSession): EvalStateSnapshot | undefined;
/**
 * Formats a compact, model-visible snapshot without inspecting runtime values.
 * Set historyHasEval when a resumed transcript contains eval activity: an empty
 * fresh-process registry then explicitly states that the historical state was
 * not restored.
 */
export declare function formatEvalStateContext(session: ToolSession, options?: {
    historyHasEval?: boolean;
}): string | undefined;
