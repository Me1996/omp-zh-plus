/** True when this process is running inside a Herdr pane. */
export declare function isInsideHerdr(env?: NodeJS.ProcessEnv): boolean;
/** Terminal multiplexers omp recognizes as owning the screen grid. */
export type TerminalMultiplexer = "herdr" | "tmux" | "screen" | "zellij" | "cmux" | "wmux";
/**
 * Classify which terminal multiplexer owns the current screen grid, or `null`
 * for a direct terminal. Single source of truth for both the render-path gate
 * (`isInsideTerminalMultiplexer`) and the debug snapshot label.
 *
 * TMUX/STY/ZELLIJ, Herdr, and the CMUX/WMUX workspace/surface/remote-transport
 * markers are authoritative session signals. TERM can also survive when those
 * are stripped (`sudo` without -E, `su`, env-sanitizing launchers/ssh). Do not
 * use CMUX_SOCKET_PATH / WMUX_CLI / WMUX_PIPE here: they are CLI socket/path
 * overrides and can be set outside a CMUX/WMUX terminal. wmux is a Windows
 * multiplexer (Electron + xterm.js) modeled on cmux/herdr that repaints its
 * pane in place and exports WMUX=1 plus a native WMUX_SURFACE_ID.
 */
export declare function classifyTerminalMultiplexer(env?: NodeJS.ProcessEnv): TerminalMultiplexer | null;
/** True when a terminal multiplexer owns the current screen grid. */
export declare function isInsideTerminalMultiplexer(env?: NodeJS.ProcessEnv): boolean;
