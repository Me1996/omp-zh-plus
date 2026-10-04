import type { NativeToolView } from "./renderer.js";
import { type Component } from "../index.js";
import type { RenderResultOptions } from "./renderer.js";
import { type Theme } from "../theme/theme.js";
/** Streamed private scratchpad text. */
export type ThinkRenderArgs = {
    thoughts?: string;
};
/** Render private scratchpad text without a result block. */
export declare const thinkToolRenderer: {
    inline: true;
    renderCall(args: ThinkRenderArgs, _options: RenderResultOptions, uiTheme: Theme): Component;
    renderResult(): undefined;
    describeCall(args: ThinkRenderArgs, options: RenderResultOptions): NativeToolView;
    describeResult(): undefined;
};
