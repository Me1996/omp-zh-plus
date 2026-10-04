import type { ImageContent, Model } from "@oh-my-pi/pi-ai";
export declare const MAX_IMAGE_INPUT_BYTES: number;
export declare const SUPPORTED_INPUT_IMAGE_MIME_TYPES: Set<string>;
/**
 * Ollama and its local-backend family decode image input through llama.cpp /
 * `stb_image`, which is compiled without WebP support, so a WebP upload fails
 * with an opaque HTTP 400. Detect those models so the resize pipeline encodes
 * to PNG/JPEG instead — the automatic equivalent of `OMP_NO_WEBP=1`.
 */
export declare function modelLacksWebpSupport(model: Pick<Model, "provider" | "api" | "imageInputDecoder"> | undefined): boolean;
/**
 * `true` when `model` cannot decode WebP, otherwise `undefined` so the
 * `OMP_NO_WEBP` env fallback in {@link resizeImage} still applies. Feed straight
 * into {@link ImageResizeOptions.excludeWebP}.
 */
export declare function webpExclusionForModel(model: Pick<Model, "provider" | "api"> | undefined): true | undefined;
export declare class ImageInputTooLargeError extends Error {
    readonly bytes: number;
    readonly maxBytes: number;
    constructor(bytes: number, maxBytes: number);
}
/**
 * Raised when image bytes cannot be decoded — a truncated stream, a payload
 * with a hole in the middle, or bytes that are not the container they claim.
 * Failing at ingress keeps them out of the transcript, where they would
 * otherwise be persisted and rejected by the provider on every later request,
 * with no way to resume the session.
 */
export declare class InvalidImageDataError extends Error {
    readonly reason: string;
    constructor(label: string, mimeType: string, reason: string);
}
/**
 * Why an image cannot be decoded, or `null` when it decodes.
 *
 * A full decode is the only check that matches what vision backends accept: a
 * middle-elided PNG keeps its signature, its header, and even a well-formed
 * `IEND` trailer, so header sniffing and chunk-framing walks both pass it —
 * while real-world images that decoders render happily do have odd framing, so
 * a structural walk rejects payloads providers accept. Decoding is the ground
 * truth on both sides. Callers on hot paths must cache the verdict.
 */
export declare function imageDecodeFailureReason(image: ImageContent): Promise<string | null>;
/** Converts an image to PNG, rejecting when the runtime cannot decode or encode it. */
export declare function convertImageToPng(image: ImageContent): Promise<ImageContent>;
/**
 * Content-addressed identity of an image payload, stable across components and
 * transcript rebuilds. Callers key their own per-image state by this instead of
 * positional ids like `${toolCallId}:${index}`, which go stale when the images
 * behind a position are replaced.
 */
export declare function imagePayloadKey(image: ImageContent): string;
/**
 * The PNG conversion of `image` when one is still resident, else `undefined`.
 * Synchronous so renderers can use an already-converted image on the spot
 * instead of scheduling another async re-render.
 */
export declare function cachedPngConversion(image: ImageContent): ImageContent | undefined;
/**
 * Converts `image` to PNG at most once per distinct payload: concurrent callers
 * share one in-flight conversion and later callers hit {@link pngCache}.
 * Kitty-graphics renderers use this because `convertImageToPng` is a full
 * decode plus re-encode, and the same image is delivered repeatedly (read-result
 * replay) and rebuilt from scratch on resume, rewind, and `/tree` navigation.
 *
 * Rejections are not cached — a payload that failed to decode is retried by the
 * next caller, matching {@link convertImageToPng}'s contract.
 */
export declare function convertImageToPngShared(image: ImageContent): Promise<ImageContent>;
export declare function ensureSupportedImageInput(image: ImageContent): Promise<ImageContent | null>;
