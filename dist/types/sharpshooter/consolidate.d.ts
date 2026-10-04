import type { ModelRegistry } from "../config/model-registry.js";
import type { Settings } from "../config/settings.js";
import { type SharpshooterSessionDeltas } from "./queue.js";
export interface SharpshooterConsolidationResult {
    ran: boolean;
    reason?: "not_due" | "locked" | "empty" | "no_model" | "error";
    sessions?: number;
    deltas?: number;
    error?: string;
}
export declare function renderSharpshooterSessions(groups: readonly SharpshooterSessionDeltas[]): string;
export declare function runSharpshooterConsolidation(options: {
    agentDir: string;
    cwd: string;
    settings: Settings;
    modelRegistry: ModelRegistry;
    sessionId: string;
    force?: boolean;
}): Promise<SharpshooterConsolidationResult>;
