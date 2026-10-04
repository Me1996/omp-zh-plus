export declare const replaceEditSchema: import("@oh-my-pi/omptype").FluentType<{
    new_string: string;
    old_string: string;
    path: string;
    replace_all?: boolean | undefined;
}, {
    new_string: string;
    old_string: string;
    path: string;
    replace_all?: boolean | undefined;
}>;
export type ReplaceParams = typeof replaceEditSchema.infer;
/** Internal batch form produced only by the Cursor exec bridge. */
export interface ReplaceBatchParams {
    path: string;
    edits: Omit<ReplaceParams, "path">[];
}
export declare const patchEditEntrySchema: import("@oh-my-pi/omptype").FluentType<{
    diff?: string | undefined;
    op?: "create" | "delete" | "update" | undefined;
    rename?: string | undefined;
}, {
    diff?: string | undefined;
    op?: "create" | "delete" | "update" | undefined;
    rename?: string | undefined;
}>;
export type PatchEditEntry = typeof patchEditEntrySchema.infer;
export declare const patchEditSchema: import("@oh-my-pi/omptype").FluentType<{
    edits: {
        diff?: string | undefined;
        op?: "create" | "delete" | "update" | undefined;
        rename?: string | undefined;
    }[];
    path: string;
}, {
    edits: {
        diff?: string | undefined;
        op?: "create" | "delete" | "update" | undefined;
        rename?: string | undefined;
    }[];
    path: string;
}>;
export type PatchParams = typeof patchEditSchema.infer;
export declare const applyPatchSchema: import("@oh-my-pi/omptype").FluentType<{
    input: string;
}, {
    input: string;
}>;
export type ApplyPatchParams = typeof applyPatchSchema.infer;
export declare const hashlineEditParamsSchema: import("@oh-my-pi/omptype").FluentType<{
    input: string;
}, {
    input: string;
}>;
export type HashlineParams = typeof hashlineEditParamsSchema.infer;
export declare const sloppyEditSchema: import("@oh-my-pi/omptype").FluentType<{
    input: string;
}, {
    input: string;
}>;
export type SloppyParams = typeof sloppyEditSchema.infer;
