/**
 * Conservative shell command tokenizer shared by the bash approval-pattern
 * matcher and the gh-cache invalidator.
 *
 * Splits a bash command into independent command segments, each a list of word
 * tokens. Handles single/double-quoted strings, backslash escapes, and the
 * standard operators (`;`, `&&`, `||`, `|`, `&`, `(`, `)`, newlines) as segment
 * boundaries so callers treat the pieces as independent command sequences.
 *
 * It is deliberately not a full POSIX parser — heredocs, command substitution,
 * and arithmetic expansion are out of scope; callers fall through when they
 * cannot find the structure they need.
 */
export declare function tokenizeShellSegments(command: string): string[][];
/** A command in a conservative, flat `&&` chain. */
interface LiteralShellCommandSegment {
    /** Original segment text with quoting and escaping preserved. */
    text: string;
    /** Literal argv after shell quote removal. */
    argv: string[];
}
/**
 * Parses the deliberately small command language eligible for compound-command
 * approval: two or more literal argv commands joined only by `&&`.
 *
 * Anything that needs shell interpretation beyond quote removal is rejected.
 * In particular, this excludes expansion, globbing, redirection, comments,
 * assignments, control flow, shell wrappers/interpreters, and commands that
 * mutate the current shell. Rejection is a normal result: callers must retain
 * their existing approval behavior.
 */
export declare function extractLiteralAndChainSegments(command: string): LiteralShellCommandSegment[] | null;
/**
 * A flat shell command segment with the context needed to decide interception.
 *
 * @see extractFlatShellCommandSegments
 */
interface FlatShellCommandSegment {
    /** Original segment text with quoting and escaping preserved. */
    text: string;
    /**
     * True when this segment consumes the previous stage's stdout via an
     * unquoted `|` or `|&`. Blank and comment-only continuation lines preserve
     * the pending pipe state. Such a stage reads piped stdin, so path-based
     * dedicated tools (read/grep/glob) cannot replace it. `||`, `;`, `&`, and
     * `&&` start an independent command and leave this false.
     */
    pipedStdin: boolean;
}
/**
 * Returns the flat shell command segments with the original text of each. Unlike
 * `tokenizeShellSegments`, this preserves quoting and escaping so the results
 * are safe to match against user-configured regular expressions, and flags
 * segments that receive piped stdin.
 *
 * The extractor deliberately declines to split syntax whose execution context
 * cannot be determined with this small scanner (heredocs, command substitution,
 * backticks, grouping, and malformed quoting). Callers must still check the
 * complete input in that case.
 */
export declare function extractFlatShellCommandSegments(command: string): FlatShellCommandSegment[];
/**
 * Parses a leading `cd <path> && ...` prefix so the bash tool can route the
 * target through its structured `cwd` parameter when the model omits it.
 *
 * Returns the single path token (quotes and backslash escapes resolved to their
 * literal value) and the command remainder after the top-level `&&`, or `null`
 * when the command does not begin with exactly `cd`, one path token, and a
 * top-level `&&`. The scanner deliberately bails on anything else in the prefix
 * — redirects (`cd /tmp 2>/dev/null && ...`), extra arguments, or paths needing
 * shell expansion (`$`, backticks, `(`) — leaving the whole command for the
 * shell instead of absorbing shell syntax into `cwd`.
 */
export declare function extractLeadingCdTarget(command: string): {
    path: string;
    rest: string;
} | null;
/**
 * Reads one shell-style word from the start of `text`: quoted and unquoted
 * runs concatenate as a shell would (`a"b c"d` → `ab cd`), quoting/escaping
 * follows the same rules as {@link tokenizeShellSegments} (no escapes inside
 * single quotes; `\"`, `\\`, `\$`, `` \` `` inside double quotes; backslash
 * escapes the next character when unquoted), and the word ends at the first
 * unquoted whitespace character (space, tab, `\n`, or `\r`) or the end of
 * the string.
 *
 * Shared so callers reading one quoted flag value (`/loop --until "…"`) do not
 * each maintain their own `indexOf`-based quote scanner, which breaks on an
 * escaped instance of the closing delimiter.
 *
 * Returns `undefined` when `text` is empty or all leading whitespace, and
 * `"unterminated"` for an unclosed quote.
 */
export declare function readShellWord(text: string): {
    value: string;
    rest: string;
} | "unterminated" | undefined;
export {};
