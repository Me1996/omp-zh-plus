import type { DeviceType } from "@huggingface/transformers";
/** ONNX Runtime execution provider accepted by transformers.js pipelines. */
export type TinyOnnxDevice = DeviceType;
/** `PI_TINY_DEVICE` value selecting the mlx-lm Python backend (Apple silicon). */
export declare const MLX_DEVICE = "mlx";
export type TinyModelDevice = TinyOnnxDevice | typeof MLX_DEVICE;
export interface TinyModelDevicePreference {
    device: TinyModelDevice;
    raw: string | undefined;
}
/** Whether the mlx-lm backend can run here: MLX ships Metal wheels for Apple silicon only. */
export declare function tinyMlxSupported(platform?: NodeJS.Platform, arch?: NodeJS.Architecture): boolean;
export declare function normalizeTinyModelDevice(value: string | undefined): TinyModelDevice | undefined;
export declare function resolveTinyModelDevicePreference(value?: string | undefined): TinyModelDevicePreference;
/**
 * ONNX execution providers to try, in order, for the requested device. `mlx`
 * is not an ONNX provider: workers that only speak ONNX (STT/TTS, or the tiny
 * worker after an MLX bootstrap failure) run CPU-only for it.
 */
export declare function tinyModelDeviceLoadOrder(preference: TinyModelDevicePreference): readonly TinyOnnxDevice[];
/** Sentinel `providers.tinyModelDevice` value meaning "use the built-in CPU default". */
export declare const TINY_MODEL_DEVICE_DEFAULT = "default";
/** Accepted values for the `providers.tinyModelDevice` setting (validation + UI). */
export declare const TINY_MODEL_DEVICE_SETTING_VALUES: readonly ["default", "gpu", "cpu", "mlx", "metal", "webgpu", "cuda", "dml", "coreml", "auto", "wasm", "webnn", "webnn-gpu", "webnn-cpu", "webnn-npu"];
/** Submenu metadata for the `providers.tinyModelDevice` setting. */
export declare const TINY_MODEL_DEVICE_SETTING_OPTIONS: readonly [{
    readonly value: "default";
    readonly label: "Default";
    readonly description: "CPU-only inference";
}, {
    readonly value: "gpu";
    readonly label: "GPU";
    readonly description: "Accelerated provider (WebGPU/Metal, CUDA, or DirectML)";
}, {
    readonly value: "cpu";
    readonly label: "CPU";
    readonly description: "CPU-only inference";
}, {
    readonly value: "mlx";
    readonly label: "MLX";
    readonly description: "Apple silicon GPU via mlx-lm (Python subprocess; macOS arm64)";
}, {
    readonly value: "metal";
    readonly label: "Metal";
    readonly description: "Alias for MLX";
}, {
    readonly value: "webgpu";
    readonly label: "WebGPU";
    readonly description: "WebGPU/Metal backend";
}, {
    readonly value: "cuda";
    readonly label: "CUDA";
    readonly description: "NVIDIA CUDA (Linux x64)";
}, {
    readonly value: "dml";
    readonly label: "DirectML";
    readonly description: "DirectML backend (Windows)";
}, {
    readonly value: "coreml";
    readonly label: "CoreML";
    readonly description: "Apple CoreML (opt-in; can fail to load)";
}, {
    readonly value: "auto";
    readonly label: "Auto";
    readonly description: "Let ONNX Runtime choose a provider";
}, {
    readonly value: "wasm";
    readonly label: "WASM";
    readonly description: "WebAssembly backend";
}, {
    readonly value: "webnn";
    readonly label: "WebNN";
    readonly description: "WebNN backend";
}, {
    readonly value: "webnn-gpu";
    readonly label: "WebNN GPU";
    readonly description: "WebNN GPU device";
}, {
    readonly value: "webnn-cpu";
    readonly label: "WebNN CPU";
    readonly description: "WebNN CPU device";
}, {
    readonly value: "webnn-npu";
    readonly label: "WebNN NPU";
    readonly description: "WebNN NPU device";
}];
/**
 * Map a `providers.tinyModelDevice` setting value onto a `PI_TINY_DEVICE` env
 * value for the worker. Returns `undefined` for the default sentinel so the
 * worker keeps its built-in CPU default; the worker still validates the
 * forwarded value via {@link normalizeTinyModelDevice}.
 */
export declare function tinyModelDeviceSettingToEnv(value: string | undefined): string | undefined;
