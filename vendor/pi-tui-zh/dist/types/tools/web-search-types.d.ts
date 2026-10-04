/**
 * Web search response types shared by the coding agent's search providers and
 * the transcript renderer in {@link ./web-search}. Render-free, so provider code
 * can import it without loading UI components.
 */
/**
 * Display label for every search implementation: `web/*` engines and the
 * chat-model groundings. Keys are the ids providers report in
 * {@link SearchResponse.provider} and search errors.
 */
export declare const SEARCH_PROVIDER_LABELS: {
    readonly parallel: "Parallel";
    readonly perplexity: "Perplexity";
    readonly gemini: "Gemini";
    readonly anthropic: "Anthropic";
    readonly codex: "OpenAI Codex";
    readonly openai: "OpenAI API";
    readonly xai: "xAI";
    readonly openrouter: "OpenRouter";
    readonly zai: "Z.AI";
    readonly exa: "Exa";
    readonly tinyfish: "TinyFish";
    readonly jina: "Jina";
    readonly kagi: "Kagi";
    readonly tavily: "Tavily";
    readonly firecrawl: "Firecrawl";
    readonly brave: "Brave";
    readonly kimi: "Kimi";
    readonly synthetic: "Synthetic";
    readonly ollama: "Ollama";
    readonly searxng: "SearXNG";
    readonly startpage: "Startpage";
    readonly duckduckgo: "DuckDuckGo";
    readonly ecosia: "Ecosia";
    readonly google: "Google";
    readonly mojeek: "Mojeek";
    readonly public: "Public Web";
};
/** Id of a search implementation; see {@link SEARCH_PROVIDER_LABELS}. */
export type SearchProviderId = keyof typeof SEARCH_PROVIDER_LABELS;
/** Label for a provider id; ids from older transcripts fall back to the raw id. */
export declare function getSearchProviderLabel(id: SearchProviderId): string;
/** Source returned by search (all providers) */
export interface SearchSource {
    title: string;
    url: string;
    snippet?: string;
    /** ISO date string or relative ("2d ago") */
    publishedDate?: string;
    /** Age in seconds for consistent formatting */
    ageSeconds?: number;
    author?: string;
}
/** Citation with text reference (LLM-mediated providers) */
export interface SearchCitation {
    url: string;
    title: string;
    citedText?: string;
}
/** Usage metrics */
export interface SearchUsage {
    inputTokens?: number;
    outputTokens?: number;
    /** Anthropic: number of web search requests made */
    searchRequests?: number;
    /** Perplexity: combined token count */
    totalTokens?: number;
}
/** Unified response across providers */
export interface SearchResponse {
    provider: SearchProviderId | "none";
    /** Synthesized answer text (LLM-mediated providers) */
    answer?: string;
    /** Search result sources */
    sources: SearchSource[];
    /** Text citations with context */
    citations?: SearchCitation[];
    /** Intermediate search queries (anthropic) */
    searchQueries?: string[];
    /** Follow-up question suggestions (provider-dependent) */
    relatedQuestions?: string[];
    /** Token usage metrics */
    usage?: SearchUsage;
    /** Model used */
    model?: string;
    /** Request ID for debugging */
    requestId?: string;
    /** Authentication mode used by the provider (e.g. oauth, api-key) */
    authMode?: string;
}
