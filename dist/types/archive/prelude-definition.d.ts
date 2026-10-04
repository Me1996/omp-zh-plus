import type { EvalPreludeDefinition } from "../eval/preludes.js";
import type { ToolSession } from "../tools/index.js";
/** Create the read-only archive prelude: prompt history, recent projects, past sessions, and recaps. */
export declare function createArchivePrelude(session: ToolSession): EvalPreludeDefinition;
