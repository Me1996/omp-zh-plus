import { type BashInterceptorRule } from "../exec/settings.js";
export interface InterceptionResult {
    /** If true, the bash command should be blocked */
    block: boolean;
    /** Error message to return instead of executing */
    message?: string;
    /** Suggested tool to use instead */
    suggestedTool?: string;
}
/**
 * Check if a bash command should be intercepted.
 *
 * @param command The bash command to check
 * @param availableTools Set of tool names that are available
 * @returns InterceptionResult indicating if the command should be blocked
 */
export declare function checkBashInterception(command: string, availableTools: string[], rules?: BashInterceptorRule[], originalCommand?: string): InterceptionResult;
