import { type GeneratedImage, type ImageGenerationResult, type Model } from "@oh-my-pi/pi-ai";
import { type ModelRegistry } from "../config/model-registry.js";
import type { CustomTool } from "../extensibility/custom-tools/types.js";
export declare const imageGenSchema: import("@oh-my-pi/omptype").FluentType<{
    action?: string | undefined;
    aspect_ratio?: "16:9" | "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | undefined;
    changes?: string[] | undefined;
    composition?: string | undefined;
    image_size?: "1024x1024" | "1024x1536" | "1536x1024" | undefined;
    input?: {
        data?: string | undefined;
        mime_type?: string | undefined;
        path?: string | undefined;
    }[] | undefined;
    lighting?: string | undefined;
    model?: string | undefined;
    scene?: string | undefined;
    style?: string | undefined;
    subject: string;
    text?: string | undefined;
}, {
    action?: string | undefined;
    aspect_ratio?: "16:9" | "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | undefined;
    changes?: string[] | undefined;
    composition?: string | undefined;
    image_size?: "1024x1024" | "1024x1536" | "1536x1024" | undefined;
    input?: {
        data?: string | undefined;
        mime_type?: string | undefined;
        path?: string | undefined;
    }[] | undefined;
    lighting?: string | undefined;
    model?: string | undefined;
    scene?: string | undefined;
    style?: string | undefined;
    subject: string;
    text?: string | undefined;
}>;
export type ImageGenParams = typeof imageGenSchema.infer;
interface ImageGenToolDetails {
    provider: string;
    model: string;
    imageCount: number;
    imagePaths: string[];
    images: GeneratedImage[];
    responseText?: string;
    usage?: ImageGenerationResult["usage"];
}
export declare const imageGenTool: CustomTool<typeof imageGenSchema, ImageGenToolDetails>;
export declare function getImageGenTools(_modelRegistry?: ModelRegistry, _activeModel?: Model): Promise<Array<CustomTool<typeof imageGenSchema, ImageGenToolDetails>>>;
export declare function getImageGenToolsWithRegistry(_modelRegistry: ModelRegistry, _activeModel?: Model): Promise<Array<CustomTool<typeof imageGenSchema, ImageGenToolDetails>>>;
export {};
