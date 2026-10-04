import { type Api, completeSimple, type Model, type Usage } from "@oh-my-pi/pi-ai";
import type { ToolSession } from "../tools/index.js";
import type { LoadedImageInput } from "./image-loading.js";
/** Vision-capable model selected for an explicit image question. */
export interface ResolvedImageQuestionModel {
    model: Model<Api>;
    selectedPattern: string | undefined;
}
/** Text and accounting returned by one explicit image question. */
export interface ImageQuestionResult {
    text: string;
    model: string;
    usage: Usage;
}
/** Resolve the vision model used by `read <image>?q=<question>`. */
export declare function resolveImageQuestionModel(session: ToolSession): ResolvedImageQuestionModel;
/** Ask the resolved vision model a question about an already-loaded image. */
export declare function askImageQuestion(session: ToolSession, resolved: ResolvedImageQuestionModel, image: LoadedImageInput, question: string, signal: AbortSignal | undefined, completeImpl?: typeof completeSimple): Promise<ImageQuestionResult>;
