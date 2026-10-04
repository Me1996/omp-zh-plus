import { prompt } from "@oh-my-pi/pi-utils";
/** Prompt families used by llm-git's standard commit algorithm. */
export type ConventionalPromptFamily = "analysis" | "fast" | "map" | "reduce" | "summary" | "summary-rewrite";
/** Render a static system section and Handlebars-templated user section. */
export declare function renderConventionalPrompt(family: ConventionalPromptFamily, context?: prompt.TemplateContext): {
    system: string;
    user: string;
};
