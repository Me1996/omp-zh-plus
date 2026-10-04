import { type LocalProtocolOptions } from "../internal-urls/index.js";
/**
 * Resolves a plan path to its on-disk file: internal URLs through the scheme's
 * sync locate, anything else against `cwd`. Throws for internal URLs no local file backs.
 */
export declare function resolvePlanFilePath(planFilePath: string, options: {
    localProtocolOptions: LocalProtocolOptions;
    cwd: string;
}): string;
/** Reads a plan from an internal URL or cwd-relative filesystem path. */
export declare function readPlanFile(planFilePath: string, options: {
    localProtocolOptions: LocalProtocolOptions;
    cwd: string;
}): Promise<string | null>;
/** Lists session-local plan files from newest to oldest. */
export declare function listPlanFiles(options: {
    localProtocolOptions: LocalProtocolOptions;
}): Promise<string[]>;
