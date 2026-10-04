/** Checker metadata presented by the target picker. */
export interface CleanseCheckerChoice {
    id: string;
    label: string;
    language: string;
    command: string;
}
/** Selected checker scope or free-form repair request. */
export type CleanseTargetChoice = {
    kind: "all";
} | {
    kind: "checker";
    id: string;
} | {
    kind: "request";
    request: string;
} | {
    kind: "cancel";
};
/** Pick between running every discovered checker, one specific checker, or a free-form request. */
export declare function pickCleanseTarget(checkers: readonly CleanseCheckerChoice[]): Promise<CleanseTargetChoice>;
/** One-shot text prompt for a free-form cleanse request; `null` when cancelled or left empty. */
export declare function promptCleanseRequest(): Promise<string | null>;
