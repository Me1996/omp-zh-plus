import { type Component } from "../tui.js";
import type { AdvisorMessageDetails } from "./messages.js";
import { type Theme } from "../theme/index.js";
import { type NativeUiEvent } from "../native/node.js";
/** The advisor card: shared by the controlled expansion getter and native toggles. */
export interface AdvisorMessageCard extends Component {
    /** Transcript-wide expansion (`Ctrl+O`); clears a toggle made in the terminal. */
    setExpanded(expanded: boolean): void;
    handleNativeEvent(event: NativeUiEvent): void;
}
/**
 * Display-only transcript card for advisor notes injected into the primary
 * session. Styled as a distinct voice so notes never blend into thinking
 * output (whose `thinkingText` color equals `toolOutput` in most themes):
 * a bold `customMessageLabel` header tag (skill-card convention), a heavy
 * rail tinted per-note severity, and the note body on the default text color.
 *
 * `getExpanded` owns expansion; a native toggle overrides it for this card
 * until the next transcript-wide change.
 */
export declare function createAdvisorMessageCard(details: AdvisorMessageDetails | undefined, getExpanded: () => boolean, uiTheme: Theme): AdvisorMessageCard;
