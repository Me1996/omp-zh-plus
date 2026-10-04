import type { AgentsHubDeps } from "@oh-my-pi/pi-tui-zh/overlays/agents-hub";
import type { EffectiveExtensionRoots } from "../capability/types.js";
import type { ModelRegistry } from "../config/model-registry.js";
import type { Settings } from "../config/settings.js";
export declare function createAgentsHubDeps(cwd: string, settings: Settings, modelRegistry: ModelRegistry, extensionRoots: () => EffectiveExtensionRoots, activeModelPattern?: string, defaultModelPattern?: string): AgentsHubDeps;
