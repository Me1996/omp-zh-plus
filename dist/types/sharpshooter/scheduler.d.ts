import type { ModelRegistry } from "../config/model-registry.js";
import type { Settings } from "../config/settings.js";
export declare function startSharpshooterScheduler(options: {
    agentDir: string;
    cwd: string;
    settings: Settings;
    modelRegistry: ModelRegistry;
    sessionId: string;
}): () => void;
