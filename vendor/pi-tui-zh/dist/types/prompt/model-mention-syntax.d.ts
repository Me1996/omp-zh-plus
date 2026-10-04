/**
 * Dependency-free `^model` mention syntax shared by the composer, message
 * rendering, and the session registry. Kept apart from `model-mentions.ts` so
 * the startup composer prepaint graph never loads the catalog or task agents.
 */
import type { Model } from "@oh-my-pi/pi-ai";
/** Whitespace-delimited token; groups are leading delimiter and selector. Reset lastIndex before reuse. */
export declare const MODEL_MENTION_RE: RegExp;
/** Submitted mention; groups are agent pseudonym and display name. */
export declare const MODEL_MENTION_TAG_RE: RegExp;
/** A user-tagged model usable as a subagent pseudonym on the current session branch. */
export interface ModelMention {
    agent: string;
    selector: string;
    name: string;
}
/** Expand a composer atom back into its canonical model selector. */
export declare function modelMentionToken(selector: string): string;
/** Encode a registered mention for the user message sent to the model. */
export declare function modelMentionTag(mention: ModelMention): string;
/** Use the catalog display name, without quotes, or the id when the name is empty. */
export declare function modelMentionDisplayName(model: Model): string;
/** Restore known submitted tags to editable selectors; leave unknown agents literal. */
export declare function expandModelMentionTags(text: string, selectorFor: (agent: string) => string | undefined): string;
