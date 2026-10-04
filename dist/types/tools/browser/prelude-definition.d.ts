import type { EvalPreludeDefinition } from "../../eval/preludes.js";
import type { ToolSession } from "../../sdk.js";
/** Build the browser eval facade after an eval runtime first requests preludes. */
export declare function createBrowserPreludeDefinition(session: ToolSession, host: Pick<EvalPreludeDefinition, "invoke" | "status">): EvalPreludeDefinition;
