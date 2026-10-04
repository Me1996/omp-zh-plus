import type { ApiKeyResolver } from "@oh-my-pi/pi-ai";
import type { Api, Model } from "@oh-my-pi/pi-catalog/types";
import type { ModelBrowserRegistry } from "@oh-my-pi/pi-tui-zh/overlays/model-browser";
import { type Settings } from "../config/settings.js";
export type SttState = "idle" | "recording" | "transcribing";
/** How a capture reports progress and state to its host. */
export interface SttCallbacks {
    showWarning(msg: string): void;
    showStatus(msg: string): void;
    onStateChange(state: SttState): void;
}
/** The slice of a text input the controller dictates into. */
export interface SttTarget {
    setVolatileText(text: string): void;
    clearVolatileText(): void;
    commitVolatileText(text: string): void;
    submit(): void;
    deleteBeforeCursor(count: number): void;
}
interface CaptureHandle {
    stop(): void;
}
type CaptureFactory = (onAudio: (error: Error | null, samples: Float32Array) => void) => CaptureHandle;
interface SttRegistry extends ModelBrowserRegistry {
    resolver(model: Model<Api>, sessionId?: string): ApiKeyResolver;
}
export interface STTControllerDependencies {
    settings: Settings;
    registry: SttRegistry;
    getSessionId?: () => string;
}
/** Coordinates native microphone capture with streaming local or buffered cloud transcription. */
export declare class STTController {
    #private;
    /** Creates a controller; tests may replace the hardware capture boundary. */
    constructor();
    constructor(createCapture: CaptureFactory);
    constructor(dependencies: STTControllerDependencies);
    constructor(createCapture: CaptureFactory, dependencies: STTControllerDependencies);
    get state(): SttState;
    /** Start dictating into `editor`, reporting to `options` until the capture ends. A no-op while a
     *  capture is starting, recording, or transcribing. */
    start(editor: SttTarget, options: SttCallbacks): Promise<void>;
    /** Stop the running capture and transcribe it. A capture still starting stops as soon as it is
     *  up; otherwise a no-op unless recording. */
    stop(): Promise<void>;
    /** Stop a capture that is starting or recording; otherwise start one into `editor`. */
    toggle(editor: SttTarget, options: SttCallbacks): Promise<void>;
    dispose(): void;
}
export {};
