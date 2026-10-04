/** Local model the `tiny-models` CLI downloads when none is named. */
export declare const DEFAULT_TINY_TITLE_LOCAL_MODEL_KEY = "lfm2.5-230m";
export interface TinyTitleLocalModelSpec {
    key: string;
    /** ONNX export loaded by transformers.js on every platform. */
    repo: string;
    dtype: "q4";
    /** Pre-quantized MLX export loaded by mlx-lm when `PI_TINY_DEVICE=mlx`. */
    mlxRepo: string;
    label: string;
    description: string;
    contextNote: string;
    /** Model family emits hidden reasoning unless the chat template disables it. */
    reasoning?: boolean;
    /** Reason the ONNX backend refuses this model before loading the runtime; the MLX backend ignores it. */
    onnxUnsupportedReason?: string;
}
export declare const TINY_TITLE_LOCAL_MODELS: readonly [{
    readonly key: "lfm2.5-230m";
    readonly repo: "LiquidAI/LFM2.5-230M-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "LiquidAI/LFM2.5-230M-MLX-4bit";
    readonly label: "LFM2.5 230M";
    readonly description: "Recommended local model; fastest LFM2.5 option, about 214 MB cached.";
    readonly contextNote: "Best balance among the current compact title models.";
}, {
    readonly key: "lfm2.5-350m";
    readonly repo: "onnx-community/LFM2.5-350M-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "LiquidAI/LFM2.5-350M-MLX-4bit";
    readonly label: "LFM2.5 350M";
    readonly description: "Larger LFM2.5 option, about 292 MB cached; tends toward terse titles.";
    readonly contextNote: "Use when compact labels are preferred over descriptive titles.";
}, {
    readonly key: "falcon-h1-90m";
    readonly repo: "onnx-community/Falcon-H1-Tiny-90M-Instruct-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/Falcon-H1-Tiny-90M-Instruct-4bit";
    readonly label: "Falcon H1 Tiny 90M";
    readonly description: "Smallest option, about 147 MB cached; lower fidelity on complex prompts.";
    readonly contextNote: "Use on constrained machines where download size matters most.";
}];
export type TinyTitleLocalModelKey = (typeof TINY_TITLE_LOCAL_MODELS)[number]["key"];
export declare function isTinyTitleLocalModelKey(value: string): value is TinyTitleLocalModelKey;
export declare function getTinyTitleModelSpec(key: TinyTitleLocalModelKey): (typeof TINY_TITLE_LOCAL_MODELS)[number];
/** Recommended local model for memory tasks when none is named. */
export declare const DEFAULT_MEMORY_LOCAL_MODEL_KEY = "lfm2-1.2b";
/**
 * Local models for Mnemopi memory tasks (fact extraction + consolidation).
 * These are larger (1B-1.7B) than the title models: structured extraction and
 * faithful summarization need more capacity than 3-6 word titles. All q4.
 * Ranking/recipe rationale lives in docs/local-models.md.
 */
export declare const TINY_MEMORY_LOCAL_MODELS: readonly [{
    readonly key: "qwen3-1.7b";
    readonly repo: "onnx-community/Qwen3-1.7B-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/Qwen3-1.7B-4bit";
    readonly label: "Qwen3 1.7B";
    readonly description: "MLX only (providers.tinyModelDevice=mlx): onnxruntime-node cannot run this ONNX export's RotaryEmbedding cache updates.";
    readonly contextNote: "Blocked on the ONNX backend to avoid the unsupported RotaryEmbedding runtime path.";
    readonly reasoning: true;
    readonly onnxUnsupportedReason: "onnxruntime-node does not support Qwen3 RotaryEmbedding cache updates in onnx-community/Qwen3-1.7B-ONNX";
}, {
    readonly key: "llama3.2:3b";
    readonly repo: "onnx-community/Llama-3.2-3B-Instruct-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/Llama-3.2-3B-Instruct-4bit";
    readonly label: "Llama 3.2 3B";
    readonly description: "Larger Llama 3.2 option for local memory/classifier tasks; higher quality potential at higher disk/RAM/latency cost.";
    readonly contextNote: "Use when larger model capacity is preferred over faster load times.";
}, {
    readonly key: "gemma-3-1b";
    readonly repo: "onnx-community/gemma-3-1b-it-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/gemma-3-1b-it-4bit";
    readonly label: "Gemma 3 1B";
    readonly description: "Best consolidation/dedup; lighter footprint, but leaks small talk during extraction.";
    readonly contextNote: "Use when consolidation quality and size matter most.";
}, {
    readonly key: "qwen2.5-1.5b";
    readonly repo: "onnx-community/Qwen2.5-1.5B-Instruct";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/Qwen2.5-1.5B-Instruct-4bit";
    readonly label: "Qwen2.5 1.5B";
    readonly description: "Best extraction granularity (atomic facts); weaker consolidation.";
    readonly contextNote: "Use when fine-grained, deduplicatable facts matter more than summaries.";
}, {
    readonly key: "lfm2-1.2b";
    readonly repo: "onnx-community/LFM2-1.2B-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/LFM2-1.2B-4bit";
    readonly label: "LFM2 1.2B";
    readonly description: "Fastest load; solid all-rounder, slightly noisier extraction labels.";
    readonly contextNote: "Use when local startup cost is the priority.";
}];
export type TinyMemoryLocalModelKey = (typeof TINY_MEMORY_LOCAL_MODELS)[number]["key"];
export declare function isTinyMemoryLocalModelKey(value: string): value is TinyMemoryLocalModelKey;
export declare function getTinyMemoryModelSpec(key: TinyMemoryLocalModelKey): (typeof TINY_MEMORY_LOCAL_MODELS)[number];
/** Return whether a memory local model may emit reasoning tokens before answers. */
export declare function isTinyMemoryReasoningModelKey(key: TinyMemoryLocalModelKey): boolean;
/** Any local model key (title or memory), used by the shared inference worker. */
export type TinyLocalModelKey = TinyTitleLocalModelKey | TinyMemoryLocalModelKey;
/** Resolve a local model spec by key across both the title and memory registries. */
export declare function getTinyLocalModelSpec(key: string): TinyTitleLocalModelSpec | undefined;
export declare function isTinyLocalModelKey(value: string): value is TinyLocalModelKey;
/** Combined local model registry (title + memory) for the shared tiny-models CLI. */
export declare const TINY_LOCAL_MODELS: readonly [{
    readonly key: "lfm2.5-230m";
    readonly repo: "LiquidAI/LFM2.5-230M-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "LiquidAI/LFM2.5-230M-MLX-4bit";
    readonly label: "LFM2.5 230M";
    readonly description: "Recommended local model; fastest LFM2.5 option, about 214 MB cached.";
    readonly contextNote: "Best balance among the current compact title models.";
}, {
    readonly key: "lfm2.5-350m";
    readonly repo: "onnx-community/LFM2.5-350M-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "LiquidAI/LFM2.5-350M-MLX-4bit";
    readonly label: "LFM2.5 350M";
    readonly description: "Larger LFM2.5 option, about 292 MB cached; tends toward terse titles.";
    readonly contextNote: "Use when compact labels are preferred over descriptive titles.";
}, {
    readonly key: "falcon-h1-90m";
    readonly repo: "onnx-community/Falcon-H1-Tiny-90M-Instruct-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/Falcon-H1-Tiny-90M-Instruct-4bit";
    readonly label: "Falcon H1 Tiny 90M";
    readonly description: "Smallest option, about 147 MB cached; lower fidelity on complex prompts.";
    readonly contextNote: "Use on constrained machines where download size matters most.";
}, {
    readonly key: "qwen3-1.7b";
    readonly repo: "onnx-community/Qwen3-1.7B-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/Qwen3-1.7B-4bit";
    readonly label: "Qwen3 1.7B";
    readonly description: "MLX only (providers.tinyModelDevice=mlx): onnxruntime-node cannot run this ONNX export's RotaryEmbedding cache updates.";
    readonly contextNote: "Blocked on the ONNX backend to avoid the unsupported RotaryEmbedding runtime path.";
    readonly reasoning: true;
    readonly onnxUnsupportedReason: "onnxruntime-node does not support Qwen3 RotaryEmbedding cache updates in onnx-community/Qwen3-1.7B-ONNX";
}, {
    readonly key: "llama3.2:3b";
    readonly repo: "onnx-community/Llama-3.2-3B-Instruct-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/Llama-3.2-3B-Instruct-4bit";
    readonly label: "Llama 3.2 3B";
    readonly description: "Larger Llama 3.2 option for local memory/classifier tasks; higher quality potential at higher disk/RAM/latency cost.";
    readonly contextNote: "Use when larger model capacity is preferred over faster load times.";
}, {
    readonly key: "gemma-3-1b";
    readonly repo: "onnx-community/gemma-3-1b-it-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/gemma-3-1b-it-4bit";
    readonly label: "Gemma 3 1B";
    readonly description: "Best consolidation/dedup; lighter footprint, but leaks small talk during extraction.";
    readonly contextNote: "Use when consolidation quality and size matter most.";
}, {
    readonly key: "qwen2.5-1.5b";
    readonly repo: "onnx-community/Qwen2.5-1.5B-Instruct";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/Qwen2.5-1.5B-Instruct-4bit";
    readonly label: "Qwen2.5 1.5B";
    readonly description: "Best extraction granularity (atomic facts); weaker consolidation.";
    readonly contextNote: "Use when fine-grained, deduplicatable facts matter more than summaries.";
}, {
    readonly key: "lfm2-1.2b";
    readonly repo: "onnx-community/LFM2-1.2B-ONNX";
    readonly dtype: "q4";
    readonly mlxRepo: "mlx-community/LFM2-1.2B-4bit";
    readonly label: "LFM2 1.2B";
    readonly description: "Fastest load; solid all-rounder, slightly noisier extraction labels.";
    readonly contextNote: "Use when local startup cost is the priority.";
}];
