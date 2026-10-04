import type { SelectList } from "../components/select-list.js";
import type { SgrMouseEvent } from "../mouse.js";
/** Route overlay-local mouse input past a panel's top border into its SelectList child. */
export declare function routeSelectListMouseWithTopBorder(selectList: SelectList, event: SgrMouseEvent, line: number, col: number): void;
