import type { SpinnerFramesOverride } from "./symbols.js";
export type ColorValue = string | number;
export interface ThemeJson {
    $schema?: string;
    name: string;
    vars?: Record<string, ColorValue>;
    colors: Omit<Record<ThemeColor | ThemeBg, ColorValue>, "thinkingMax"> & {
        thinkingMax?: ColorValue;
    };
    export?: {
        pageBg?: ColorValue;
        cardBg?: ColorValue;
        infoBg?: ColorValue;
    };
    /**
     * The terminal this theme was made for, for hosts that paint the terminal
     * themselves (Tern). omp never sets the terminal's colors: its TUI draws on
     * whatever background the terminal has. A host derives absent fields from
     * `colors`.
     */
    terminal?: {
        /** Terminal background. */
        background?: ColorValue;
        /** Default text. */
        foreground?: ColorValue;
        /** The window around the terminal: sidebar, tab bar, title bar. */
        chrome?: ColorValue;
        /** Lifted surfaces: popovers, menus, buttons. */
        widget?: ColorValue;
        /** ANSI colors 0–15: exactly 16. */
        ansi?: ColorValue[];
    };
    symbols?: {
        preset?: "unicode" | "nerd" | "ascii";
        overrides?: Record<string, string>;
        spinnerFrames?: SpinnerFramesOverride;
    };
}
export type ThemeColor = "accent" | "border" | "borderAccent" | "borderMuted" | "success" | "error" | "warning" | "muted" | "dim" | "text" | "thinkingText" | "userMessageText" | "customMessageText" | "customMessageLabel" | "toolTitle" | "toolOutput" | "mdHeading" | "mdLink" | "mdLinkUrl" | "mdCode" | "mdCodeBlock" | "mdCodeBlockBorder" | "mdQuote" | "mdQuoteBorder" | "mdHr" | "mdListBullet" | "toolDiffAdded" | "toolDiffRemoved" | "toolDiffContext" | "syntaxComment" | "syntaxKeyword" | "syntaxFunction" | "syntaxVariable" | "syntaxString" | "syntaxNumber" | "syntaxType" | "syntaxOperator" | "syntaxPunctuation" | "thinkingOff" | "thinkingMinimal" | "thinkingLow" | "thinkingMedium" | "thinkingHigh" | "thinkingXhigh" | "thinkingMax" | "bashMode" | "pythonMode" | "statusLineSep" | "statusLineModel" | "statusLinePath" | "statusLineGitClean" | "statusLineGitDirty" | "statusLineContext" | "statusLineSpend" | "statusLineStaged" | "statusLineDirty" | "statusLineUntracked" | "statusLineOutput" | "statusLineCost" | "statusLineSubagents";
/** Check if a string is a valid ThemeColor value */
export declare function isValidThemeColor(color: string): color is ThemeColor;
export type ThemeBg = "selectedBg" | "userMessageBg" | "customMessageBg" | "toolPendingBg" | "toolSuccessBg" | "toolErrorBg" | "statusLineBg";
/** Check if a string is a valid ThemeBg value */
export declare function isValidThemeBg(color: string): color is ThemeBg;
export type ColorMode = "truecolor" | "256color";
