/**
 * Math font and text-style command names whose single brace argument
 * is rendered with the corresponding style. Exported for the display block
 * engine, which re-wraps inline runs inside these commands when their argument
 * contains 2-D layout so styling survives box boundaries.
 */
export declare const MATH_FONT_COMMANDS: ReadonlySet<string>;
/**
 * Painter for a LaTeX color scope (optional model + spec, e.g. `rgb`/`1,0,0` or
 * `red`): returns a function that paints already-rendered text with the scope's
 * foreground, re-asserting it after embedded foreground resets so nested color
 * runs restore to the scope color; null when the color cannot be resolved. Used
 * by the display block engine (`latex-block`) to paint structural glyphs
 * (fraction bars, stretched delimiters, matrix brackets) inside
 * `\color`/`\textcolor` scopes.
 */
export declare function latexColorScope(model: string | null, spec: string): ((text: string) => string) | null;
/**
 * Convert a bare LaTeX math fragment (no surrounding `$`/`\(` delimiters) to its
 * best-effort Unicode rendering. Unknown commands degrade to their bare name;
 * `\\` becomes a newline. Always returns a string (never throws).
 */
export declare function latexToUnicode(src: string): string;
/**
 * True when `env` is a math environment safe to auto-render without `$`/`\[`
 * delimiters. The trailing `*` of starred variants (`align*`, `equation*`) is
 * ignored; text-mode environments (`tabular`, `itemize`, …) return false.
 */
export declare function isBareMathEnvironment(env: string): boolean;
/**
 * Scan prose for math spans — `$$…$$`, `\[…\]` (display) and `$…$`, `\(…\)`
 * (inline) — and replace each with its Unicode rendering, leaving everything
 * else verbatim. Newlines inside a span collapse to spaces so the result stays
 * single-line-safe.
 *
 * Inline `$…$` uses pandoc's anti-currency heuristics: the opener must not be
 * followed by whitespace, the closer must not be preceded by whitespace nor
 * followed by a digit, and `\$` is treated as a literal dollar — so "$5 and
 * $10" is left untouched.
 */
export declare function renderMathInText(text: string): string;
