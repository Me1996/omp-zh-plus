import { type SkillsSettings } from "../extensibility/settings.js";
import { type SkillWarning } from "../extensibility/skills.js";
/** Public skill listing entry: the fields a machine consumer may rely on. */
export interface SkillSummary {
    name: string;
    description: string;
    filePath: string;
    baseDir: string;
    source: string;
    hide: boolean;
}
export interface SkillsCommandResult {
    skills: SkillSummary[];
    warnings: SkillWarning[];
}
/**
 * Discover skills for a directory exactly as a session would and report them.
 * Internal skill metadata (`_source`, `containRoot`) is deliberately omitted
 * from the result shape.
 */
export declare function runSkillsCommand(options?: {
    cwd?: string;
    skillsSettings?: Partial<SkillsSettings>;
}): Promise<SkillsCommandResult>;
/**
 * `omp skill list [dir] [--json]`: report the skills a session in `dir` would
 * resolve. Terminal output is one `name<TAB>description` row per skill on
 * stdout, with notices and warnings on stderr; `--json` emits the full result
 * including discovery warnings.
 */
export declare function handleSkillList(args: string[], cwd: string, json: boolean): Promise<number>;
