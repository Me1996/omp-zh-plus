/** Cached author photos supplied by the command host. */
export interface AvatarSource {
    get(email: string, cwd: string): string | null | undefined;
}
/**
 * Deterministic 5x5 mirrored identicon rendered as half-block rows (3 lines,
 * 10 columns). Used while an avatar loads and when none exists.
 */
export declare function identiconLines(email: string, colorize: (hex: string, text: string) => string): string[];
