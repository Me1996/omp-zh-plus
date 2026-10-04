interface PlainSecret {
    readonly value: string;
    readonly prefix: string;
}
/** Irreversible, deliberately conservative terminal-row redaction for public streams. */
export declare class StreamRedactor {
    #private;
    constructor(patterns: readonly RegExp[], plainSecrets: readonly PlainSecret[]);
    /** Build a redactor from configured secrets, the environment, and user regex sources. */
    static load(cwd: string, extraPatterns: readonly string[]): Promise<StreamRedactor>;
    /** Redact one ANSI terminal row, dropping styling whenever any sensitive span is found. */
    redactRow(row: string): string;
}
export {};
