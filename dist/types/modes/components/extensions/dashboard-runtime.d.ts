import type { ExtensionDashboardRuntime } from "@oh-my-pi/pi-tui-zh/overlays/extensions/extension-dashboard";
import type { Settings } from "../../../config/settings.js";
import type { CustomTool } from "../../../extensibility/custom-tools/types.js";
import type { MCPManager } from "../../../mcp/manager.js";
import type { EventBus } from "../../../utils/event-bus.js";
/** Bind the dashboard's display-only contract to the live application. */
export declare function createExtensionDashboardRuntime(options: {
    cwd: string;
    settings: Settings;
    mcpManager?: MCPManager;
    eventBus?: EventBus;
    onMcpToolsChanged?: (tools: CustomTool[]) => Promise<void> | void;
    browserMcpFilterEnabled?: () => boolean;
}): ExtensionDashboardRuntime;
