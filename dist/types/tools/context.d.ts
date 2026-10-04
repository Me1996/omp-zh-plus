import type { AgentToolContext, ToolCallContext } from "@oh-my-pi/pi-agent-core";
import type { CustomToolContext } from "../extensibility/custom-tools/types.js";
import type { ExtensionUIContext } from "../extensibility/extensions/types.js";
declare module "@oh-my-pi/pi-agent-core" {
    interface AgentToolContext extends CustomToolContext {
        ui?: ExtensionUIContext;
        hasUI?: boolean;
        toolNames?: string[];
        toolCall?: ToolCallContext;
        /** Set after the write tool's outer gate approves an `xd://` device call
         *  at the mounted tool's tier. The inner wrapper skips its tier-only
         *  prompt, while explicit policies and overrides still apply. */
        xdevApproved?: boolean;
        /** Immutable snapshot of the arguments an ACP client approved. The inner
         *  wrapper skips tier and explicit prompts only while the effective input
         *  remains equal; deny policies and provider safety checks still apply. */
        acpApprovedArgs?: unknown;
        /** Reports the approval tier resolved after an extension rewrites an
         *  xd:// device call, so dispatch metadata describes the input that ran. */
        xdevTierResolved?(tier: "read" | "write" | "exec"): void;
        /** Set only after an interactive prompt approves provider computer safety checks. */
        providerSafetyApproved?: boolean;
    }
}
export declare class ToolContextStore {
    #private;
    private readonly getBaseContext;
    constructor(getBaseContext: () => CustomToolContext);
    getContext(toolCall?: ToolCallContext): AgentToolContext;
    setUIContext(uiContext: ExtensionUIContext, hasUI: boolean): void;
    setToolNames(names: string[]): void;
}
