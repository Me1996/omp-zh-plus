import type { ModelRegistry } from "../config/model-registry.js";
import { type RoleChainCandidate } from "../config/model-resolver.js";
import { type Settings } from "../config/settings.js";
import type { CustomTool } from "../extensibility/custom-tools/types.js";
type TtsCodec = "mp3" | "wav";
type TtsBackend = "local-inference" | "xai-tts" | "openai-speech";
declare const ttsSchema: import("@oh-my-pi/omptype").FluentType<{
    bit_rate?: number | undefined;
    language: string;
    output_path: string;
    sample_rate?: number | undefined;
    text: string;
    voice_id?: string | undefined;
}, {
    bit_rate?: number | undefined;
    language?: string | undefined;
    output_path: string;
    sample_rate?: number | undefined;
    text: string;
    voice_id?: string | undefined;
}>;
interface TtsToolDetails {
    bytes: number;
    voiceId: string;
    codec: TtsCodec;
    backend: TtsBackend;
}
/** Resolve speech candidates while preserving every explicitly configured slot. */
export declare function resolveSpeechCandidates(settingsInstance: Settings, modelRegistry: ModelRegistry, wantsMp3: boolean): RoleChainCandidate[];
/**
 * Resolve the on-disk path for local synthesis. Local output is always WAV (no
 * MP3 encoder is bundled), so an `.mp3` (or any non-`.wav`) request is rewritten
 * to a sibling `.wav` and flagged so the tool result can note the substitution.
 */
export declare function resolveLocalWavPath(outputPath: string): {
    wavPath: string;
    substituted: boolean;
};
export declare const ttsTool: CustomTool<typeof ttsSchema, TtsToolDetails>;
export {};
