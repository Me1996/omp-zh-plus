import type { AgentState } from "@oh-my-pi/pi-agent-core";
import type { SessionEntry, SessionHeader } from "../../session/session-entries.js";
import { SessionManager } from "../../session/session-manager.js";
import { type SubSession } from "../../session/sub-sessions.js";
import type { ExportThemeNames } from "./args.js";
export { type ExportThemeNames, parseExportArgs } from "./args.js";
/** Resolve a Bun file-loader value without parsing Windows drive letters as URL schemes. */
export declare function resolveBundledHtmlAssetPath(assetPath: string, moduleDir?: string): string;
/** Compose the standalone export template with every style and script inlined. */
export declare function getTemplate(): string;
export interface ExportOptions {
    outputPath?: string;
    /** `"web"` bundles the omp web themes; `"theme"` bundles TUI themes. */
    palette?: "web" | "theme";
    /** Legacy single TUI theme name. Prefer `themeNames` for dual-theme exports. */
    themeName?: string;
    /** Dark and light TUI themes to bundle when `palette` is `"theme"`. */
    themeNames?: ExportThemeNames;
    /** Embed subagent session transcripts found next to the session file (default true). */
    includeSubSessions?: boolean;
}
/**
 * Generate CSS custom properties for one export theme.
 *
 * The single-argument theme-name form remains available to callers that need
 * one TUI palette. Standalone HTML uses `generateThemeStyles()` below.
 */
export declare function generateThemeVars(palette?: "web" | "theme" | (string & {}), themeName?: string): Promise<string>;
/** Generate dark, light, and auto-following CSS rules for a standalone viewer. */
export declare function generateThemeStyles(palette: "web" | "theme", themeNames?: ExportThemeNames, legacyThemeName?: string): Promise<string>;
export interface SessionData {
    header: SessionHeader | null;
    entries: SessionEntry[];
    leafId: string | null;
    systemPrompt?: string;
    tools?: {
        name: string;
        description: string;
    }[];
    subSessions?: Record<string, SubSession>;
}
/** Snapshot the session (plus optional agent state) into the JSON shape the viewer renders. */
export declare function buildSessionData(sm: SessionManager, state?: AgentState): SessionData;
/** Export session to HTML using SessionManager and AgentState. */
export declare function exportSessionToHtml(sm: SessionManager, state?: AgentState, options?: ExportOptions | string): Promise<string>;
/** Export session file to HTML (standalone). */
export declare function exportFromFile(inputPath: string, options?: ExportOptions | string): Promise<string>;
