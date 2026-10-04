import type { ModelHubSource } from "@oh-my-pi/pi-tui-zh/overlays/model-hub";
import type { Settings } from "../config/settings.js";
/** Supply live model-overlay preferences and runtime resolution from the host. */
export declare function createModelBrowserSource(settings: Settings): ModelHubSource;
