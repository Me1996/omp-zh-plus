import type { ToolApprovalDecision } from "@oh-my-pi/pi-agent-core";
import type { EvalPreludeDefinition } from "../eval/preludes.js";
import { type ComputerController } from "./computer/supervisor.js";
import type { ToolSession } from "./index.js";
/** Creates the session-scoped controller used by the computer prelude. */
export type ComputerControllerFactory = (session: ToolSession) => ComputerController;
/** Capability inspection, explicitly read-only runs, and inspection-only direct calls use read approval. */
export declare function computerApproval(args: unknown): ToolApprovalDecision;
/** Create the enabled-only computer host prelude for one tool session. */
export declare function createComputerPrelude(session: ToolSession, createController?: ComputerControllerFactory): EvalPreludeDefinition;
