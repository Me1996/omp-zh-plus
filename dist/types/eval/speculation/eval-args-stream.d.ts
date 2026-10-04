export declare const MAX_EVAL_STREAM_ARGUMENT_BYTES: number;
export type EvalStreamLanguage = "js" | "py" | "rb" | "jl";
export interface EvalArgsStreamSnapshot {
    readonly revision: number;
    readonly language?: EvalStreamLanguage;
    readonly codePrefix: string;
    readonly reset?: boolean;
    readonly timeout?: number;
    readonly complete: boolean;
    /** True when this snapshot replaced, rather than appended to, the preceding provider buffer. */
    readonly restart: boolean;
}
export type EvalArgsStreamResult = {
    kind: "snapshot";
    snapshot: EvalArgsStreamSnapshot;
} | {
    kind: "disabled";
    reason: string;
    restart: boolean;
};
/** Stateful decoder for cumulative provider-owned eval argument buffers. */
export declare class EvalArgsStreamDecoder {
    #private;
    update(raw: string): EvalArgsStreamResult;
    matchesFinal(args: Readonly<Record<string, unknown>>): boolean;
}
