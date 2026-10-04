import { type ContextFile } from "../capability/context-file.js";
import type { LoadContext, LoadResult } from "../capability/types.js";
/**
 * Load standalone AGENTS.md files by walking up from cwd
 * (see {@link loadStandaloneContextFiles}).
 */
export declare function loadAgentsMd(ctx: LoadContext): Promise<LoadResult<ContextFile>>;
