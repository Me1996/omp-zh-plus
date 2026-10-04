/**
 * On-demand weights for the `smollm` word-completion engine
 * (`pi_predict::smollm`): the SmolLM2-135M base checkpoint (Apache-2.0), every
 * file pinned to one repo revision and verified by size and SHA-256.
 *
 * Format: `config.json` and `tokenizer.json` from the upstream repo, and the
 * weights as llama.cpp's `Q8_0` GGUF export (145 MB; 32 weights per 8-bit
 * block with an f16 scale) from QuantFactory/SmolLM2-135M-GGUF, which both
 * decoders run as stored. Provenance, checked against the upstream bf16
 * `model.safetensors` (269 MB): every `Q8_0` block is byte-identical to
 * quantizing it (after llama.cpp's q/k row permutation, which the loader
 * undoes) and the F32 norms are equal, so replay quality matches the bf16
 * research runs.
 *
 * Layout follows the tiny-model cache: `<tiny-models>/predict/<org>--<name>/`,
 * a cross-process install lock next to it, `.part` downloads renamed into
 * place, and a ready marker listing the pinned digests so a warm start is one
 * read and an install of other files (e.g. the bf16 weights) reads as not ready.
 *
 * Only interactive processes download (the composer on first use through
 * {@link prefetchSmolLmWeights}, shown in the download HUD, or
 * `omp tiny-models download smollm`); the prediction daemon just checks
 * {@link smolLmWeightsReady} and serves ngram until then.
 */
/** Human label for the weights (HUD, CLI). */
export declare const SMOLLM_LABEL = "SmolLM2-135M";
/** Total download size in bytes. */
export declare const SMOLLM_TOTAL_BYTES: number;
/** Directory `ensureSmolLmWeights` fills. */
export declare function getSmolLmModelDir(): string;
/** Whether the pinned weights are fully downloaded and verified (one small file read). */
export declare function smolLmWeightsReady(): Promise<boolean>;
/** Options for {@link ensureSmolLmWeights}. */
export interface EnsureSmolLmWeightsOptions {
    signal?: AbortSignal;
    /** Bytes present so far out of {@link SMOLLM_TOTAL_BYTES}, and the file being fetched. */
    onProgress?: (loaded: number, file: string) => void;
}
/**
 * Ensure the pinned SmolLM2-135M files are present and verified, downloading
 * any that are missing or corrupt, and return the model directory to pass as
 * `TextPredictorOptions.modelDir`. Cross-process safe via an OS file lock.
 *
 * @throws when a download fails, is aborted through `signal`, or does not
 * match the pinned size/digest.
 */
export declare function ensureSmolLmWeights(options?: EnsureSmolLmWeightsOptions): Promise<string>;
/**
 * Start fetching the weights in the background, shown in the download HUD,
 * unless they are ready, already downloading, or a failure is backing off.
 * Called by the composer's word-completion backend on each `smollm`
 * request, so the fetch starts on first use; cheap after that.
 */
export declare function prefetchSmolLmWeights(): void;
