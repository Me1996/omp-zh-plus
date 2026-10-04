import type { TabBarTheme } from "../components/tab-bar.js";
/** Compact single-line display text for statuses; unlike titles, collapse padding and trim. */
export declare function sanitizeStatusText(text: string): string;
/** Shared tab bar theme used by fullscreen overlays (settings, agent hub). */
export declare function getTabBarTheme(): TabBarTheme;
