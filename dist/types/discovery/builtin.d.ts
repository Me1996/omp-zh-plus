/** Ancestor directories (cwd spelling) through the optional inclusive stop directory, compared canonically. */
export declare function getAncestorDirs(cwd: string, stopAt?: string | null): Array<{
    dir: string;
    depth: number;
}>;
