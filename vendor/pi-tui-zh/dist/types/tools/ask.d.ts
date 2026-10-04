import type { NativeToolView, ToolRenderResult } from "./renderer.js";
import { type Component } from "../index.js";
import type { RenderResultOptions } from "./renderer.js";
import { type Theme } from "../theme/theme.js";
/** Result for a single question */
export interface QuestionResult {
    id: string;
    question: string;
    options: string[];
    multi: boolean;
    selectedOptions: string[];
    customInput?: string;
    /** Optional note attached to the selected answer in the rich ask dialog. */
    note?: string;
    /** True when the answer was auto-selected because the dialog timed out. */
    timedOut?: boolean;
}
/** Answers and redirect metadata displayed for an ask tool result. */
export interface AskToolDetails {
    question?: string;
    options?: string[];
    multi?: boolean;
    selectedOptions?: string[];
    customInput?: string;
    /** Optional note attached to the selected answer in the rich ask dialog. */
    note?: string;
    /** True when the answer was auto-selected because the dialog timed out. */
    timedOut?: boolean;
    /** Multi-part question mode */
    results?: QuestionResult[];
    /** Chat redirect: the user chose "Chat about this" instead of answering. */
    chatRedirect?: boolean;
    /** Questions surfaced when chatRedirect is true. */
    questions?: string[];
}
interface AskRenderOption {
    label: string;
    description?: string;
}
interface AskRenderArgs {
    question?: string;
    options?: AskRenderOption[];
    multi?: boolean;
    questions?: Array<{
        id: string;
        question: string;
        options: AskRenderOption[];
        multi?: boolean;
    }>;
}
/**
 * Marker glyph for a question option. Single-choice questions render circular radio
 * buttons (pick one); multi-select questions render rectangular checkboxes (pick many).
 */
export declare function optionMarker(uiTheme: Theme, multi: boolean | undefined, selected: boolean): string;
/** Render question forms and their recorded answers. */
export declare const askToolRenderer: {
    describeCall(args: AskRenderArgs): NativeToolView | undefined;
    describeResult(result: ToolRenderResult<AskToolDetails>, _options?: RenderResultOptions, args?: AskRenderArgs): NativeToolView | undefined;
    mergeCallAndResult: true;
    renderCall(args: AskRenderArgs, _options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(result: {
        content: Array<{
            type: string;
            text?: string;
        }>;
        details?: AskToolDetails;
    }, _options: RenderResultOptions, uiTheme: Theme): Component;
};
export {};
