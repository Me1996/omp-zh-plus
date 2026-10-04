import { type Skill } from "../capability/skill.js";
import type { LoadContext, LoadResult } from "../capability/types.js";
export declare const SKILLSHARE_PROVIDER_ID = "skillshare";
/** Load every skill pinned by project locks (closest first) and the user lock. */
export declare function loadSkillshareSkills(ctx: LoadContext): Promise<LoadResult<Skill>>;
