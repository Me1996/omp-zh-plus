export interface CredentialPattern {
    /** Model-visible friendly label for reversible placeholders. */
    name: string;
    source: string;
    flags?: string;
    /**
     * Literal substrings at least one of which every match of `source`
     * contains. The obfuscator skips the regex over text containing none of
     * them (`includes` beats a lookbehind regex by orders of magnitude, and the
     * whole provider context is scanned on every request). Must be exhaustive
     * for the pattern's alternatives; a pattern without this field is always
     * scanned. Case-insensitive patterns are matched case-insensitively.
     */
    literalPrefixes?: readonly string[];
}
export interface CredentialPrefixRule {
    /** Regex source matching the fixed provider prefix. */
    readonly source: string;
    /** `token` redacts from the prefix through non-whitespace; the special modes preserve their introducer semantics. */
    readonly mode: "token" | "line" | "bearer-token";
}
/**
 * Credential introducers which are sensitive before a complete high-entropy token
 * has been typed. Stream redaction deliberately applies these without the normal
 * length or entropy gates.
 */
export declare const CREDENTIAL_PREFIX_RULES: readonly CredentialPrefixRule[];
/** Anchored vendor-prefix credential shapes. No generic keyword/entropy rules: a coding agent must still be able to read identifiers like `token_expiry_seconds`. */
export declare const CREDENTIAL_PATTERNS: readonly CredentialPattern[];
