/**
 * One `/skill:<name>` token delimited by whitespace or line edges. Group 1 is
 * the leading delimiter (empty at line start), group 2 the skill name: a bare
 * name or a collision-namespaced `<namespace>/<name>` (exactly one `/`; deeper
 * paths never match). Global so callers can walk every token; reset
 * `lastIndex` before reuse.
 */
export declare const SKILL_TOKEN_RE: RegExp;
/**
 * Whether `/skill:<name>` tokens in `text` are invocations rather than content
 * belonging to another slash command or local-execution sigil.
 */
export declare function allowsSkillTokens(text: string): boolean;
/** Whether model mentions may collapse in this draft; local execution consumes its body verbatim. */
export declare function allowsModelMentions(text: string): boolean;
