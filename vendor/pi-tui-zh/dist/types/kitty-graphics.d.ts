/**
 * Kitty graphics: Unicode placeholder placement (`U=1` + U+10EEEE), with
 * runtime feature state and env overrides.
 *
 * Unicode placeholders let a transmitted image be displayed by writing ordinary
 * text cells — the placeholder char U+10EEEE plus row/column combining
 * diacritics — instead of a cursor-positioned `a=p` direct placement. The image
 * then participates in the normal text grid, so it survives horizontal slicing,
 * reflow and overlapping draws (each cell names its own row+column, so a sliced
 * row still maps to the correct sub-region). See kitty
 * `docs/graphics-protocol.rst` "Unicode placeholders for relative placements".
 *
 * This module is intentionally free of `./terminal-capabilities` imports so the
 * dependency stays one-way (capabilities → kitty-graphics) and no import cycle
 * forms. Protocol gating (`imageProtocol === Kitty`) lives in the caller.
 */
/** Kitty Unicode placeholder base character (U+10EEEE, Plane 16 PUA). */
export declare const KITTY_PLACEHOLDER = "\uDBFB\uDEEE";
/** Largest row/column index expressible with the diacritic table (one cell each). */
export declare const KITTY_PLACEHOLDER_MAX_CELLS: number;
export interface KittyGraphicsFeatures {
    /** Display images via Unicode placeholders instead of direct `a=p` placement. */
    unicodePlaceholders: boolean;
}
/**
 * Whether the detected terminal renders Kitty Unicode placeholders (`U=1` +
 * U+10EEEE with row/column diacritics).
 *
 * Kitty, Ghostty and Otty advertise placeholder support directly. A multiplexer
 * cannot use cursor-positioned placements because the outer terminal does not
 * know pane scroll/reflow state. An explicit `PI_FORCE_IMAGE_PROTOCOL=kitty`
 * opts into placeholders under any multiplexer — matching `timg -pk`.
 * Automatic Herdr fallback stays off because its pane marker does not prove
 * that the experimental Kitty renderer is enabled.
 *
 * `PI_NO_KITTY_PLACEHOLDERS=1` and `PI_KITTY_PLACEHOLDERS=0` remain hard
 * opt-outs; `PI_KITTY_PLACEHOLDERS=1` explicitly opts in anywhere else.
 */
export declare function detectKittyUnicodePlaceholdersSupport(terminalId: string, env?: NodeJS.ProcessEnv): boolean;
export declare function getKittyGraphics(): Readonly<KittyGraphicsFeatures>;
export declare function setKittyGraphics(partial: Partial<KittyGraphicsFeatures>): void;
/** Whether a `columns`×`rows` placeholder grid fits within the diacritic table. */
export declare function kittyPlaceholdersFit(columns: number, rows: number): boolean;
/**
 * Virtual placement APC (`a=p,U=1`): tells the terminal that placeholder cells
 * carrying image id `i` should display the transmitted image, scaled to fit the
 * `c`×`r` cell box. Re-emitting with a stable `placementId` replaces in place.
 */
export declare function encodeKittyVirtualPlacement(opts: {
    imageId: number;
    placementId?: number;
    columns: number;
    rows: number;
}): string;
/**
 * Build the placeholder cell grid as one string per row. The image id is carried
 * in each row's foreground color and the placement id (if any) in its underline
 * color; every cell names its explicit row+column diacritic (robust to slicing,
 * unlike left-inheritance). Returns exactly `rows` strings.
 */
export declare function encodeKittyPlaceholderGrid(opts: {
    imageId: number;
    placementId?: number;
    columns: number;
    rows: number;
}): string[];
/**
 * Full placeholder render: the virtual-placement APC prefixes line 0, and every
 * line carries placeholder cells. Returns exactly `rows` lines (no cursor moves).
 */
export declare function renderKittyPlaceholderLines(opts: {
    imageId: number;
    placementId?: number;
    columns: number;
    rows: number;
}): string[];
