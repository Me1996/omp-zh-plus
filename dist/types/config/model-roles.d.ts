/**
 * Built-in model roles and role metadata helpers.
 */
import { type Model } from "@oh-my-pi/pi-catalog/types";
import { type ModelBrowserRegistry, type ModelBrowserRoleInfo, type ModelRole } from "@oh-my-pi/pi-tui-zh/overlays/model-browser";
import type { Settings } from "./settings.js";
/** Canonical prefix for a configured model role selector. */
export declare const MODEL_ROLE_ALIAS_PREFIX = "@";
/** Legacy prefix accepted for backwards-compatible role selectors. */
export declare const LEGACY_MODEL_ROLE_ALIAS_PREFIX = "pi/";
/** Shorthand selector for the default model role. */
export declare const DEFAULT_MODEL_ROLE_ALIAS = "*";
/** Format a model role as its canonical selector. */
export declare function formatModelRoleAlias(role: string): string;
export type { ModelRole } from "@oh-my-pi/pi-tui-zh/overlays/model-browser";
export { CHAT_MODEL_ROLE_IDS, KIND_ROLE_IDS, MODEL_ROLE_IDS } from "@oh-my-pi/pi-tui-zh/overlays/model-browser";
export type ModelRoleInfo = ModelBrowserRoleInfo;
export declare const MODEL_ROLES: Record<ModelRole, ModelRoleInfo>;
export type RoleInfo = ModelRoleInfo;
/** Whether a role belongs to the non-chat model-kind section. */
export declare function isKindRole(role: string): boolean;
/** Available models eligible for a role, including keyless runner models. */
export declare function roleCandidatePool(role: string, settings: Settings, registry: ModelBrowserRegistry): Model[];
/**
 * Return the canonical set of known roles for selector/carousel UI.
 *
 * Built-ins always come first. Configured cycle order, model assignments, and
 * tag metadata can introduce additional custom roles without requiring duplicate
 * entries across settings.
 */
export declare function getKnownRoleIds(settings: Settings): string[];
/**
 * Get role info for a role name (built-in or custom).
 * Configured metadata overrides built-in defaults when present.
 */
export declare function getRoleInfo(role: string, settings: Settings): RoleInfo;
