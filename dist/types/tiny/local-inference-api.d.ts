import { type Api, type Context, type Model, type SimpleStreamOptions } from "@oh-my-pi/pi-ai";
import { AssistantMessageEventStream } from "@oh-my-pi/pi-ai/utils/event-stream";
import type { TinyChatMessage } from "./title-protocol.js";
/** Convert unified conversation context into the tiny worker's chat format. */
export declare function buildLocalInferenceMessages(context: Context): TinyChatMessage[];
/** Stream a tiny local model completion through the shared assistant event protocol. */
export declare function streamLocalInferenceSimple(model: Model<Api>, context: Context, options?: SimpleStreamOptions): AssistantMessageEventStream;
/** Register the local-inference transport with the shared API registry. */
export declare function registerLocalInferenceApi(): void;
