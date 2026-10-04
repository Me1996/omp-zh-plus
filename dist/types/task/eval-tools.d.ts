import type { EvalToolDescriptor } from "../eval/types.js";
import type { CustomTool } from "../extensibility/custom-tools/types.js";
import type { ToolSession } from "../tools/index.js";
/** Whether this session may expose kernel-defined tools to subagents (`eval.tools.enabled`). */
export declare function evalToolsEnabled(session: ToolSession): boolean;
/** Resolve named kernel-defined tools for a child session. */
export declare function describeEvalTools(session: ToolSession, names: readonly string[], signal?: AbortSignal): Promise<EvalToolDescriptor[]>;
/** List every tool currently defined across retained eval kernels. */
export declare function listEvalTools(session: ToolSession, signal?: AbortSignal): Promise<EvalToolDescriptor[]>;
/** Materialize kernel-defined descriptors as custom tools for a child session. */
export declare function createEvalCustomTools(session: ToolSession, descriptors: EvalToolDescriptor[]): CustomTool[];
