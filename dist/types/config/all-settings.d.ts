/**
 * Every settings domain, in settings-panel order. Importing this module registers every setting;
 * {@link orderedSettings} lists them by domain order, then declaration order within a domain;
 * `PLACED_DOMAINS` splice a domain into another domain's rows.
 */
import { type AnySetting } from "./registry.js";
/** Every registered setting: domains in panel order, each in declaration order. */
export declare function orderedSettings(): readonly AnySetting[];
