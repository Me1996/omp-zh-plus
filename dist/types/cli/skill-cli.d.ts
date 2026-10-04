import { type SkillSearchSort } from "@oh-my-pi/pi-wire/skillshare";
export type SkillAction = "publish" | "version" | "tag" | "yank" | "deprecate" | "owner" | "token" | "import" | "install" | "update" | "uninstall" | "search" | "info" | "list";
export declare const SKILL_ACTIONS: readonly SkillAction[];
export interface SkillCommandArgs {
    action: SkillAction;
    args: string[];
    cwd: string;
    flags: {
        tag?: string;
        dryRun?: boolean;
        allowSecrets?: boolean;
        registry?: string;
        scope?: string;
        undo?: boolean;
        global?: boolean;
        yes?: boolean;
        json?: boolean;
        sort?: SkillSearchSort;
        package?: string[];
        expires?: number;
    };
}
export declare const SKILL_USAGE = "Usage: omp skill <action> [...]\n\nInstall and discover:\n  install [@scope/name[@range]...] [-g] [--yes]   Install skills (no specs: install from skills.json)\n  update [name...] [-g] [--yes]                   Update installed skills within their ranges\n  uninstall <name...> [-g]                        Remove installed skills\n  search <query> [--sort relevance|downloads|recent] [--json]\n  info <@scope/name[@version]> [--json]\n  list [dir] [--json]                             Skills a session in dir resolves, with warnings\n\nPublish and manage:\n  publish [dir] [--scope s] [--tag t] [--dry-run] [--allow-secrets]\n  version <patch|minor|major|x.y.z> [dir]         Bump metadata.version in SKILL.md\n  tag <@scope/name@version> <tag>                 Point a dist-tag at a version\n  tag rm <@scope/name> <tag>                      Remove a dist-tag\n  yank <@scope/name@version> [--undo]             Hide a version from range resolution\n  deprecate <@scope/name[@range]> <message|--undo>\n  owner add|rm <@scope/name> <username>\n  token create <name> [--package @scope/name]... [--expires days]\n  token ls [--json]\n  token revoke <id>\n  import <file.skill>                             Publish a Claude .skill archive\n\nManagement commands accept --registry <url> (default: skills.registryUrl).\n";
/**
 * Run one `omp skill` action and return the process exit code. Usage mistakes
 * propagate as {@link CliUsageError}; registry and validation failures are
 * printed as `skill <action>: <message>` and yield 1.
 */
export declare function runSkillCommand(cmd: SkillCommandArgs): Promise<number>;
