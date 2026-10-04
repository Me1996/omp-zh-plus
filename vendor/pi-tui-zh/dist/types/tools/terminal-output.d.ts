import type { Terminal as XtermTerminal } from "@oh-my-pi/pi-utils/vterm";
import type * as XtermModule from "@oh-my-pi/pi-utils/vterm";
/** Lazily load the headless terminal shared by PTY display paths. */
export declare function loadXtermTerminal(): Promise<typeof XtermModule.Terminal>;
/** Applies the active tool-output color while preserving safe styles from a virtual terminal row. */
export declare function styleTerminalRow(row: string, baseForeground: string): string;
/** Reads terminal screen rows as sanitized text plus only the styles the TUI may replay. */
export declare function readTerminalRows(terminal: XtermTerminal, startRow: number, rowCount: number): string[];
