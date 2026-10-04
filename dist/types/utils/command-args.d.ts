/** Split command arguments, optionally enforcing complete quotes and shell-style escapes. */
export declare function parseCommandArgs(argsString: string, options?: {
    strict?: boolean;
}): string[];
/**
 * Substitute argument placeholders in template content
 * Supports $1, $2, ... for positional args, $@ and $ARGUMENTS for all args
 *
 * Note: Replacement happens on the template string only. Argument values
 * containing patterns like $1, $@, or $ARGUMENTS are NOT recursively substituted.
 */
export declare function substituteArgs(content: string, args: string[]): string;
