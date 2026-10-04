import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
import type { Judge } from "@oh-my-pi/pi-ai";
import { type Rule } from "../../capability/rule.js";
import { type TtsrOutput } from "../../export/ttsr.js";
import type { TtsrToolInspector } from "../../session/ttsr-outputs.js";
export interface ParsedGeneratedRule {
    rule: Rule;
    fileContent: string;
}
export type GeneratedRuleParseResult = ParsedGeneratedRule | {
    error: string;
};
export interface RuleHistoryValidation {
    matched: boolean;
    feedback?: string;
    /** No judge could answer the rule's `question`; regenerating the rule cannot fix that. */
    judgeUnavailable?: boolean;
}
export interface ParsedRuleHistoryValidation {
    candidate: ParsedGeneratedRule;
    validation: RuleHistoryValidation;
    repairedCondition: boolean;
}
export type OmfgRuleSourceLevel = "project" | "user";
export declare function extractGeneratedRuleJson(text: string): string | null;
export declare function sanitizeRuleName(rawName: string): string;
export declare function buildOmfgRuleForPath(ruleName: string, fileContent: string, filePath: string, level: OmfgRuleSourceLevel): Rule;
/** Completed assistant outputs in `messages`, as TTSR rules see them. */
export declare function historyOutputs(messages: readonly AgentMessage[], inspector: TtsrToolInspector): TtsrOutput[];
export declare function parseGeneratedRule(text: string): GeneratedRuleParseResult;
/**
 * Check a rule against earlier assistant outputs the way TTSR would evaluate
 * them live: `condition`/`astCondition` must match an in-scope output; a
 * `question` rule must pass its scope/prefilter and get a yes from `judge` on
 * one of the most recent in-scope outputs.
 */
export declare function validateRuleAgainstAssistantHistory(rule: Rule, outputs: readonly TtsrOutput[], judge: Judge | undefined): Promise<RuleHistoryValidation>;
export declare function validateParsedRuleAgainstAssistantHistory(candidate: ParsedGeneratedRule, outputs: readonly TtsrOutput[], judge: Judge | undefined): Promise<ParsedRuleHistoryValidation>;
