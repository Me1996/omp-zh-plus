import type { SetupScene } from "./types.js";
/**
 * Preview and persist the terminal glyph preset. Skipped once the Glyph
 * Protocol handshake confirmed the terminal renders omp's bundled icons: every
 * row renders cleanly there, and the default `unicode` preset already upgrades
 * to nerd at runtime while staying safe on terminals without the protocol.
 */
export declare const glyphSetupScene: SetupScene;
