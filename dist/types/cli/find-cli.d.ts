export interface FindCommandArgs {
    query: string;
    path: string;
    keywords: string[];
    hidden: boolean;
    json: boolean;
    quiet: boolean;
}
/** Run one search and print it. Exits non-zero on a bad root or when every judgment failed. */
export declare function runFindCommand(cmd: FindCommandArgs): Promise<void>;
