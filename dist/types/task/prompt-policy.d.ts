import { type DelegationBias } from "@oh-my-pi/pi-catalog/compat/delegation";
import type { ToolSession } from "../index.js";
/**
 * Delegation bias of the session's active model, for tool descriptions that
 * nudge toward subagents; `eager` before a model is bound.
 */
export declare function sessionDelegationBias(session: ToolSession): DelegationBias;
