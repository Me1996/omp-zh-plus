/** Format tool schemas as TypeScript declarations for code-mode discovery. */
export declare function generateCodeModeDeclarations(tools: ReadonlyArray<{
    name: string;
    parameters: unknown;
}>): string;
