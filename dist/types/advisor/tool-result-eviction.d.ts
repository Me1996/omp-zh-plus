import type { AgentMessage, Tokenizer } from "@oh-my-pi/pi-agent-core";
export interface ToolResultEvictionResult {
    evicted: number;
    tokensSaved: number;
}
/**
 * Evict the advisor's stale `read`/`grep`/`glob` output from reviews before
 * the latest one.
 *
 * An advisor re-sends its own investigation output on every later request,
 * while the deltas it reviews and the notes it wrote (which live in `advise`
 * tool-call *arguments*, on assistant messages) carry the actual value.
 *
 * Rewriting history is not free: the provider re-writes the prompt cache from
 * the cut onward, while a saved token is re-read on every later request. So the
 * cut maximizes the margin f(i) = saved(i) − rewrite(i) rather than taking the
 * deepest passing cut: a big eviction must not reach back through several
 * reviews just to reclaim one small result sitting behind thousands of rewrite
 * tokens.
 *
 * Mutates `messages` in place, following compaction's in-place rewrite
 * contract (blank content, `prunedAt`, cache invalidation).
 */
export declare function evictStaleToolResults(messages: AgentMessage[], tokenizer: Tokenizer): ToolResultEvictionResult;
