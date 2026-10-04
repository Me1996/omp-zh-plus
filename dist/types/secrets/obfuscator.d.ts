export interface SecretEntry {
    type: "plain" | "regex";
    content: string;
    mode?: "obfuscate" | "replace";
    replacement?: string;
    flags?: string;
    friendlyName?: string;
    /**
     * Regex entries only: literal substrings at least one of which every match
     * contains. Text containing none is skipped without running the regex.
     * Fail-safe: omitted means the regex always runs. Must be exhaustive for
     * the pattern; a wrong list here lets a secret through.
     */
    literalPrefixes?: readonly string[];
}
export type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue | undefined;
};
export type JsonRecord = {
    [key: string]: JsonValue | undefined;
};
/**
 * Invariant: every piece of state redaction reads either never changes after
 * construction (regex entries, a readonly field of a readonly array) or lives
 * in a collection bound to `#revision` (`TrackedMap`, `TrackedSet`,
 * `SecretValueSet` with a revision), whose writes bump it. The short-lived
 * reuse inside one batch or call (per-string scans, the regex scan memo,
 * sorted literal caches) is keyed by `#revision.value`, so a mint partway
 * through can never leave a stale result in use. No redaction result is kept
 * across batches.
 */
export declare class SecretObfuscator {
    #private;
    constructor(entries: SecretEntry[], key?: string | (() => string));
    hasSecrets(): boolean;
    /** Whether outbound text is currently obfuscated: secrets exist and obfuscation is switched on. */
    obfuscates(): boolean;
    /**
     * Toggle outbound obfuscation. When off, {@link obfuscate} is identity, while
     * placeholders minted earlier keep deobfuscating so prior turns stay readable.
     */
    setObfuscating(enabled: boolean): void;
    /** Obfuscate all secrets in text. Bidirectional placeholders for obfuscate mode, one-way for replace. */
    obfuscate(text: string, sharedRegexSecretValues?: ReadonlySet<string>): string;
    /**
     * Run `run` as one outbound batch (collect, then redact, over one message
     * list) so each string is scanned once for both. Nothing outlives the batch.
     * Nested calls join the outer batch.
     */
    batch<T>(run: () => T): T;
    /** Deobfuscate keyed placeholders for provider output, tool-call arguments, replay, and display. */
    deobfuscate(text: string): string;
    /** Deep-walk an object, deobfuscating string values for LIVE paths (keyed placeholders only). */
    deobfuscateObject<T>(obj: T): T;
    /** Deep-walk an object, obfuscating all string values. */
    obfuscateObject<T>(obj: T): T;
    collectRegexSecretValuesForObfuscation(text: string): ReadonlySet<string>;
    stripUnsafeFriendlyPlaceholderPrefixes(text: string, sharedRegexSecretValues: ReadonlySet<string>): string;
}
