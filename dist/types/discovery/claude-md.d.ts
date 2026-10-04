import { type ContextFile } from "../capability/context-file.js";
import type { LoadContext, LoadResult } from "../capability/types.js";
/**
 * Load standalone CLAUDE.md files by walking up from cwd
 * (see {@link loadStandaloneContextFiles}).
 */
export declare function loadClaudeMd(ctx: LoadContext): Promise<LoadResult<ContextFile>>;
