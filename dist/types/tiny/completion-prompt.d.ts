import type { TextGenerationPipeline } from "@huggingface/transformers";
interface TextChatTemplateOptions {
    addGenerationPrompt: boolean;
    enableThinking: boolean;
}
/**
 * Render a text chat after removing generation-mask statements unsupported by
 * the Transformers.js CommonJS template parser.
 */
export declare function renderTextChatTemplate(tokenizer: TextGenerationPipeline["tokenizer"], messages: readonly {
    role: string;
    content: string;
}[], options: TextChatTemplateOptions): string;
export {};
