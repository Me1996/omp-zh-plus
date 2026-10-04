/**
 * Active theme's symbol lookup without importing `./theme` (which pulls the
 * native addon through `@oh-my-pi/pi-natives`). Key-hint formatting runs on
 * CLI paths that must stay addon-free (`omp --version`, help), so it reads the
 * active theme through this mirror; `./theme` publishes every assignment here.
 */
import { type SymbolKey } from "./symbols.js";
import type { Theme } from "./theme-class.js";
/** @internal Called by `./theme` whenever the active theme changes. */
export declare function setActiveSymbolTheme(value: Theme | undefined): void;
/** Symbol from the active theme, or the ascii preset before any theme loads. */
export declare function activeThemeSymbol(key: SymbolKey): string;
