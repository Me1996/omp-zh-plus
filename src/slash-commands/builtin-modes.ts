import { clearSubmittedText, restoreDetachedDraft } from "./helpers/draft";
import * as path from "node:path";
import { AgentBusyError } from "@oh-my-pi/pi-agent-core";
import { formatKeyHint } from "@oh-my-pi/pi-tui-zh/app-keybindings";
import { prompt } from "@oh-my-pi/pi-utils";
import {
	formatModelString,
	getModelMatchPreferences,
	resolveCliModel,
	type ResolveCliModelResult,
} from "../config/model-resolver";
import type { Settings } from "../config/settings";
import {
	applyModelPreset,
	deleteModelPreset,
	formatModelPresetSwitch,
	getModelPresetNames,
	isCleanModelPresetSwitch,
	isValidModelPresetName,
	modelPresetSavedMessage,
	type ModelPresetSession,
	saveModelPreset,
} from "../config/model-presets";
import { describeLoopCondition } from "../modes/loop-condition";
import { describeLoopLimitRuntime } from "../modes/loop-limit";
import type { InteractiveModeContext } from "../modes/types";
import ratchetKickoffPrompt from "../prompts/ratchet-kickoff.md" with { type: "text" };
import type { AgentSession } from "../session/agent-session";
import { CLI_THINKING_LEVELS, getConfiguredThinkingLevelMetadata } from "@oh-my-pi/pi-tui-zh/thinking";
import { noThinkingMessage, resolveThinkingArgument } from "./helpers/effort";
import { commandConsumed, errorMessage, usage } from "./helpers/parse";
import { handleSecurityCommand } from "./helpers/security";
import type { ParsedSlashCommand, SlashCommandSpec, TuiSlashCommandRuntime } from "./types";

import {
	cfgComputerDisplay,
	cfgComputerEnabled,
	cfgComputerMaxHeight,
	cfgComputerMaxWidth,
	cfgRatchetEnabled,
} from "../tools/settings";
import { cfgSkillful } from "../session/settings";
import { formatSlowModeResetClock } from "../session/anthropic-slow-mode";
import { cfgExtendedContext } from "../session/context-settings";
import { cfgGoalEnabled } from "../goals/settings";
import { cfgPlanEnabled } from "../plan-mode/settings";

export function refreshStatusLine(ctx: InteractiveModeContext): void {
	ctx.statusLine.invalidate();
	ctx.ui.requestRender();
}

/**
 * Resolve a `/model` / `/switch` selector the way `omp bench` and `--model`
 * do: exact `provider/id`, fuzzy ids (`opus`), role aliases (`@smol`, `smol`),
 * and `:level` thinking suffixes. Unqualified selectors prefer the session's
 * `--models` scope, else the authenticated set, before the full catalog.
 */
function resolveSessionModelSelector(
	selector: string,
	session: AgentSession,
	settings: Settings,
): ResolveCliModelResult {
	const scoped = session.scopedModels.map(entry => entry.model);
	return resolveCliModel({
		cliModel: selector,
		modelRegistry: session.modelRegistry,
		availableModels: scoped.length > 0 ? scoped : undefined,
		settings,
		preferences: getModelMatchPreferences(settings),
	});
}

async function runWithDetachedModeDraft(
	command: ParsedSlashCommand,
	runtime: TuiSlashCommandRuntime,
	run: () => Promise<boolean>,
): Promise<void> {
	const { editor } = runtime.ctx;
	if (!runtime.draftDetached) editor.clearDraft();
	try {
		const submitted = await run();
		const hasAttachments = (runtime.input?.images?.length ?? 0) > 0 || (runtime.input?.imageLinks?.length ?? 0) > 0;
		if (!submitted && hasAttachments) {
			if (runtime.draftDetached) {
				// Newer typing may already sit in the editor: merge the submission
				// back beside it so each draft's image markers keep their images.
				restoreDetachedDraft(editor, command.text, runtime.input?.images, runtime.input?.imageLinks);
				return;
			}
			editor.pendingImages = [...(runtime.input?.images ?? []), ...editor.pendingImages];
			editor.pendingImageLinks = [
				...(runtime.input?.imageLinks ?? runtime.input?.images?.map(() => undefined) ?? []),
				...editor.pendingImageLinks,
			];
			editor.imageLinks = editor.pendingImageLinks.length > 0 ? editor.pendingImageLinks : undefined;
		}
	} catch (error) {
		if (runtime.draftDetached) {
			// The caller already took this draft out of the editor before
			// dispatch (Ctrl+Enter's `handleFollowUp`, or `onSubmit` for these
			// mode commands); it owns restoring the submission and reporting
			// the error so a submission that failed after newer text was typed
			// merges with it once, instead of being silently dropped here.
			throw error;
		}
		if (!editor.getText() && editor.pendingImages.length === 0) {
			editor.setText(command.text);
			editor.pendingImages = runtime.input?.images ? [...runtime.input.images] : [];
			editor.pendingImageLinks = runtime.input?.imageLinks ? [...runtime.input.imageLinks] : [];
			editor.imageLinks = editor.pendingImageLinks.length > 0 ? editor.pendingImageLinks : undefined;
		}
		runtime.ctx.showError(error instanceof Error ? error.message : String(error));
	}
}

/** `/fast status` label for the active model: "ultra" for the Ultrafast tier, "on" for priority, else "off". */
function formatFastModeStatus(session: AgentSession): string {
	if (session.isUltrafastModeEnabled()) return "ultra";
	return session.isFastModeEnabled() ? "on" : "off";
}

const FAST_USAGE = "用法:/fast [on|ultra|off|status]";

/**
 * `/fast [on|ultra|off|status]` for the active model: `on` selects the
 * family's `priority` tier, `ultra` the OpenAI `ultrafast` tier, `off` clears
 * either. Bare invocation toggles between off and priority. Returns the
 * user-facing reply, or `undefined` for an unknown argument.
 */
function runFastCommand(arg: string, session: AgentSession): string | undefined {
	switch (arg) {
		case "":
		case "toggle":
			return `快速模式已${session.toggleFastMode() ? "启用" : "禁用"}。`;
		case "on":
			return session.setFastMode(true) ? "快速模式已启用。" : "当前模型不支持快速模式。";
		case "ultra":
		case "ultrafast":
			return session.setUltrafastMode(true)
				? "Ultrafast 模式已启用。"
				: "当前模型不支持 Ultrafast。";
		case "off":
			session.setFastMode(false);
			return "快速模式已禁用。";
		case "status":
			return `快速模式:${formatFastModeStatus(session)}。`;
		default:
			return undefined;
	}
}

const SLOW_UNSUPPORTED =
	"当前模型没有慢速模式:/slow 在 OpenAI/Google 模型上使用 flex 层级,在 Anthropic 订阅上使用低优先级。";

/**
 * `/slow [on|off|status]` for the active model: the `flex` service tier on
 * OpenAI/Google, subscription low priority (`providers.anthropic.slowMode`
 * `auto`/`off`) on Anthropic. Bare invocation toggles. Returns the user-facing
 * reply, or `undefined` for an unknown argument.
 */
function runSlowCommand(arg: string, session: AgentSession): string | undefined {
	if (arg !== "" && arg !== "toggle" && arg !== "on" && arg !== "off" && arg !== "status") return undefined;
	const anthropic = session.model?.provider === "anthropic";
	if (arg === "status") {
		const label = anthropic ? session.getAnthropicSlowModeLabel() : undefined;
		if (!session.isSlowModeEnabled()) return label ? `慢速模式已关闭(${label})。` : "慢速模式已关闭。";
		if (!anthropic) return "慢速模式已开启(flex 层级)。";
		return label ? `慢速模式已开启(${label})。` : "慢速模式已开启(在 Claude 会话限额处以低优先级运行)。";
	}
	const enabled = arg === "on" || (arg !== "off" && !session.isSlowModeEnabled());
	if (!session.setSlowMode(enabled)) return SLOW_UNSUPPORTED;
	if (!session.isSlowModeEnabled()) {
		return anthropic
			? "慢速模式已关闭:达到 Claude 用量限额时,请求可能获得短暂的收尾余量,之后等待限额重置。"
			: "慢速模式已关闭。";
	}
	if (!anthropic) return "慢速模式已开启:请求使用 flex 层级(成本更低、延迟更高)。";
	const resetsAtSec = session.getAnthropicSlowModeLane()?.activeResetsAtSec();
	return resetsAtSec !== undefined
		? `慢速模式已开启:继续以低优先级运行,直到限额在 ${formatSlowModeResetClock(resetsAtSec)} 重置。每周限额仍然有效,等待空闲容量时响应可能暂停。`
		: "慢速模式已开启:当你的 Claude 订阅达到会话限额且 Anthropic 提供低优先级时,请求会在收尾余量之后切换到低优先级。";
}

/** `/extended-context status` label for the premium long-context window setting. */
function formatExtendedContextStatus(settings: Settings): string {
	return cfgExtendedContext.get(settings) ? "on" : "off";
}

/** Applies an `/extended-context` argument and returns its operator feedback. */
function applyExtendedContextCommand(settings: Settings, args: string): string | undefined {
	const arg = args.trim().toLowerCase();
	const current = cfgExtendedContext.get(settings);
	if (!arg || arg === "toggle") {
		const enabled = !current;
		cfgExtendedContext.set(settings, enabled);
		return `扩展上下文已${enabled ? "启用" : "禁用"}。`;
	}
	if (arg === "on") {
		cfgExtendedContext.set(settings, true);
		return "扩展上下文已启用。";
	}
	if (arg === "off") {
		cfgExtendedContext.set(settings, false);
		return "扩展上下文已禁用。";
	}
	if (arg === "status") return `扩展上下文:${formatExtendedContextStatus(settings)}。`;
	return undefined;
}

/** Detailed, session-effective `/computer status` diagnostics. */
function formatComputerUseStatus(session: AgentSession): string {
	const enabled = cfgComputerEnabled.get(session.settings);
	const active = session.getEvalPreludes().some(definition => definition.name === "computer");
	const configured = {
		display: cfgComputerDisplay.get(session.settings),
		maxWidth: cfgComputerMaxWidth.get(session.settings),
		maxHeight: cfgComputerMaxHeight.get(session.settings),
	};
	return [
		`Computer use:${enabled ? "已启用" : "已禁用"}`,
		`prelude:${active ? "活动" : "非活动"}`,
		`configured: display=${configured.display}, maxWidth=${configured.maxWidth}, maxHeight=${configured.maxHeight}`,
	].join(" · ");
}

/**
 * Apply a session-scoped computer-use toggle; the session's setting listener
 * reconciles the prompt without a mid-session cache-busting rebuild.
 * The override is never persisted to settings.json.
 */
function applyComputerUseToggle(session: AgentSession, enable: boolean): string {
	const previous = cfgComputerEnabled.get(session.settings);
	cfgComputerEnabled.override(session.settings, enable);
	if (enable && !session.getEvalPreludes().some(definition => definition.name === "computer")) {
		cfgComputerEnabled.override(session.settings, previous);
		return "本会话中不可用 Computer use。";
	}
	return enable
		? `已为本会话启用 Computer use。${formatComputerUseStatus(session)}`
		: "已为本会话禁用 Computer use。";
}

/** Tools the ratchet loop needs: the eval kernel hosts `ratchet()`, `task` runs its analyzer. */
const RATCHET_REQUIRED_TOOLS = ["eval", "task"] as const;

/**
 * Arm `/ratchet`: enable the ratchet prelude for this session (override, never persisted) and
 * render the kickoff prompt carrying the user's request as data.
 */
function prepareRatchet(session: AgentSession, request: string): { kickoff: string } | { error: string } {
	const tools = session.getEnabledToolNames();
	const missing = RATCHET_REQUIRED_TOOLS.filter(tool => !tools.includes(tool));
	if (missing.length > 0) return { error: `/ratchet 需要 ${missing.join(" 和 ")} 工具处于活动状态。` };
	const previous = cfgRatchetEnabled.get(session.settings);
	if (!previous) cfgRatchetEnabled.override(session.settings, true);
	if (!session.getEvalPreludes().some(definition => definition.name === "ratchet")) {
		if (!previous) cfgRatchetEnabled.override(session.settings, previous);
		return { error: "本会话中不可用 ratchet eval prelude。" };
	}
	const kickoff = prompt.render(ratchetKickoffPrompt, { request: request.trim() || undefined, tools }).trim();
	return { kickoff };
}

const AUTOCOMPLETE_DETAIL_LIMIT = 48;

function shortDetail(value: string, limit = AUTOCOMPLETE_DETAIL_LIMIT): string {
	const singleLine = value.replace(/\s+/g, " ").trim();
	return singleLine.length <= limit ? singleLine : `${singleLine.slice(0, limit - 1)}…`;
}

export function formatTokenCount(value: number): string {
	return value.toLocaleString();
}

export const BUILTIN_MODE_SLASH_COMMANDS: ReadonlyArray<SlashCommandSpec> = [
	{
		name: "security",
		icon: "shield",
		description: "规划、运行、检查、导入并对比 OMP 原生安全扫描",
		allowArgs: true,
		acpInputHint: "<plan|scan|status|cancel|scans|show|import|export|validate|compare|disposition>",
		subcommands: [
			{ name: "plan", description: "创建不可变的安全扫描计划" },
			{ name: "scan", description: "启动计划好的或新规划的原生扫描" },
			{ name: "status", description: "显示原生扫描操作状态" },
			{ name: "cancel", description: "取消正在运行的原生扫描" },
			{ name: "scans", description: "列出已存储的项目安全扫描" },
			{ name: "show", description: "渲染扫描或 security:// 资源" },
			{ name: "import", description: "导入 SARIF 或 Codex Security 捆绑包" },
			{ name: "export", description: "导出规范捆绑包、SARIF 或报告" },
			{ name: "validate", description: "用 OMP 原生工具验证一条发现" },
			{ name: "compare", description: "对比两次扫描间的发现谱系" },
			{ name: "disposition", description: "为发现设置处置意见及理由" },
		],
		handle: handleSecurityCommand,
	},
	{
		name: "settings",
		icon: "settings",
		description: "打开设置菜单",
		handleTui: (_command, runtime) => {
			runtime.ctx.showSettingsSelector();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "setup",
		aliases: ["providers"],
		icon: "gear",
		description: "打开提供商设置",
		allowArgs: true,
		subcommands: [{ name: "providers", description: "配置登录与网页搜索提供商" }],
		handleTui: async (command, runtime) => {
			const args = command.args.trim().toLowerCase();
			const opensProviders = args === "" || args === "providers";
			if (opensProviders) {
				await runtime.ctx.showProviderSetup();
			} else {
				runtime.ctx.showWarning(`用法:/${command.name} [providers]`);
			}
			clearSubmittedText(runtime);
		},
	},
	{
		name: "plan",
		icon: "plan",
		description: "切换计划模式(代理先规划再执行)",
		inlineHint: "[prompt]",
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => {
			if (!cfgPlanEnabled.get(runtime.ctx.settings)) return "计划:设置中已禁用";
			if (runtime.ctx.planModeEnabled) {
				const planFile = runtime.ctx.planModePlanFilePath;
				return `计划:开启${planFile ? ` (${path.basename(planFile)})` : ""}`;
			}
			if (runtime.ctx.goalModeEnabled) return "计划:被目标模式阻塞";
			return "计划:关闭";
		},
		handleTui: async (command, runtime) => {
			await runWithDetachedModeDraft(command, runtime, () =>
				runtime.ctx.handlePlanModeCommand(command.args || undefined, runtime.input),
			);
		},
	},
	{
		name: "plan-review",
		icon: "plan",
		description: "重新打开最新计划的评审(仅计划模式)",
		getTuiAutocompleteDescription: runtime =>
			runtime.ctx.planModeEnabled ? "计划评审:可用" : "计划评审:计划模式未激活",
		handleTui: async (_command, runtime) => {
			await runtime.ctx.openPlanReview();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "vibe",
		icon: "wave",
		description: "切换 vibe 模式(直接持久化的 fast/good 工作会话;只读工具集)",
		inlineHint: "[prompt]",
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => {
			if (runtime.ctx.vibeModeEnabled) return "Vibe:开启";
			if (runtime.ctx.planModeEnabled) return "Vibe:被计划模式阻塞";
			if (runtime.ctx.goalModeEnabled) return "Vibe:被目标模式阻塞";
			return "Vibe:关闭";
		},
		handleTui: async (command, runtime) => {
			await runWithDetachedModeDraft(command, runtime, () =>
				runtime.ctx.handleVibeModeCommand(command.args || undefined, runtime.input),
			);
		},
	},
	{
		name: "goal",
		icon: "goal",
		description: "切换目标模式(本会话的持久自治目标)",
		subcommands: [
			{ name: "set", description: "设置或替换目标", usage: "<objective>" },
			{ name: "show", description: "显示当前目标详情" },
			{ name: "pause", description: "暂停当前目标" },
			{ name: "resume", description: "恢复已暂停的目标" },
			{ name: "drop", description: "丢弃当前目标" },
			{ name: "budget", description: "调整 token 预算", usage: "<N|off>" },
		],
		inlineHint: "[objective]",
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => {
			if (!cfgGoalEnabled.get(runtime.ctx.settings)) return "目标:设置中已禁用";
			if (runtime.ctx.planModeEnabled) return "目标:被计划模式阻塞";
			const state = runtime.ctx.session.getGoalModeState();
			return state ? `目标:${state.goal.status} (${shortDetail(state.goal.objective)})` : "目标:关闭";
		},
		handleTui: async (command, runtime) => {
			await runWithDetachedModeDraft(command, runtime, () =>
				runtime.ctx.handleGoalModeCommand(command.args || undefined, runtime.input),
			);
		},
	},
	{
		name: "guided-goal",
		icon: "compass",
		description: "让代理在对话中采访你,然后设置目标模式",
		inlineHint: "[rough objective]",
		allowArgs: true,
		handleTui: async (command, runtime) => {
			await runWithDetachedModeDraft(command, runtime, () =>
				runtime.ctx.handleGuidedGoalCommand(command.args || undefined, runtime.input),
			);
		},
	},
	{
		name: "loop",
		icon: "loop",
		get description() {
			return `切换循环模式。启用后,你下一条发送的提示会在每次让出后重新提交。可用次数/时长限制它,或用 \`--until '<cmd>'\` / \`--while '<cmd>'\` 门控——命令的退出状态决定是否运行下一轮。${formatKeyHint("escape")} 挂起进行中的循环;再次 /loop 禁用。`;
		},
		inlineHint: "[count|duration] [--while|--until '<cmd>'] [prompt]",
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => {
			if (!runtime.ctx.loopModeEnabled) return "循环:关闭";
			if (runtime.ctx.loopModePaused) return "循环:已暂停";
			const bounds = [
				runtime.ctx.loopLimit ? describeLoopLimitRuntime(runtime.ctx.loopLimit) : undefined,
				runtime.ctx.loopCondition ? describeLoopCondition(runtime.ctx.loopCondition) : undefined,
			].filter((part): part is string => part !== undefined);
			if (bounds.length > 0) return `循环:开启 (${bounds.join(", ")})`;
			if (runtime.ctx.loopPrompt) return "循环:开启(重复提示)";
			return "循环:开启(等待下一条提示)";
		},
		handleTui: async (command, runtime) => {
			const prompt = await runtime.ctx.handleLoopCommand(command.args);
			clearSubmittedText(runtime);
			// Surface any inline prompt so the dispatcher returns it and the normal
			// submit flow runs the first loop iteration (recording it as the loop prompt).
			if (prompt) return { prompt };
		},
	},
	{
		name: "queue",
		icon: "inbox",
		description: "将一条消息排队到代理让出之后发送",
		inlineHint: "<message>",
		allowArgs: true,
		handleTui: async (command, runtime) => {
			await runtime.ctx.handleQueueCommand(
				command.args,
				runtime.draftDetached ? { ...runtime.input, text: command.text } : undefined,
			);
		},
	},
	{
		name: "model",
		aliases: ["models"],
		icon: "model",
		description: "为本会话切换模型",
		acpDescription: "Show current model selection",
		getTuiAutocompleteDescription: runtime => {
			const model = runtime.ctx.session.model;
			return model ? `模型:${model.provider}/${model.id}` : "模型:未选择";
		},
		handle: async (command, runtime) => {
			if (command.args) {
				const selector = command.args.trim();
				const resolved = resolveSessionModelSelector(selector, runtime.session, runtime.settings);
				const match = resolved.model;
				if (!match) {
					return usage(
						`未知模型:${selector}。用 ACP \`session/setModel\` 走选择器,或用 /model 列出可用模型。`,
						runtime,
					);
				}
				try {
					await runtime.session.setModel(match);
					if (resolved.thinkingLevel !== undefined) runtime.session.setThinkingLevel(resolved.thinkingLevel);
					await runtime.output(`模型已设为 ${match.provider}/${match.id}。`);
					await runtime.notifyTitleChanged?.();
					await runtime.notifyConfigChanged?.();
					return commandConsumed();
				} catch (err) {
					return usage(`设置模型失败:${errorMessage(err)}`, runtime);
				}
			}

			const model = runtime.session.model;
			await runtime.output(
				model ? `当前模型:${model.provider}/${model.id}` : "当前未选择模型。",
			);
			return commandConsumed();
		},
		handleTui: (_command, runtime) => {
			runtime.ctx.showModelSelector();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "switch",
		icon: "swap",
		get description() {
			return `为本会话切换模型(同 ${formatKeyHint("alt+p")});接受模糊 id、provider/id、@role、:level`;
		},
		acpDescription: "Switch model for this session only",
		acpInputHint: "[model]",
		inlineHint: "[model]",
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => {
			const model = runtime.ctx.session.model;
			return model ? `模型:${model.provider}/${model.id}` : "模型:未选择";
		},
		handle: async (command, runtime) => {
			const selector = command.args.trim();
			if (!selector) {
				const model = runtime.session.model;
				await runtime.output(
					model ? `当前模型:${model.provider}/${model.id}` : "当前未选择模型。",
				);
				return commandConsumed();
			}
			const resolved = resolveSessionModelSelector(selector, runtime.session, runtime.settings);
			if (!resolved.model) return usage(`未知模型:${selector}`, runtime);
			try {
				await runtime.session.setModelTemporary(resolved.model, resolved.thinkingLevel);
				await runtime.output(`会话级模型:${formatModelString(resolved.model)}。`);
				await runtime.notifyTitleChanged?.();
				await runtime.notifyConfigChanged?.();
				return commandConsumed();
			} catch (err) {
				return usage(`切换模型失败:${errorMessage(err)}`, runtime);
			}
		},
		handleTui: async (command, runtime) => {
			clearSubmittedText(runtime);
			const selector = command.args.trim();
			if (!selector) {
				runtime.ctx.showModelSelector({ temporaryOnly: true });
				return;
			}
			const resolved = resolveSessionModelSelector(selector, runtime.ctx.session, runtime.ctx.settings);
			if (!resolved.model) {
				runtime.ctx.showError(`未知模型:${selector}`);
				return;
			}
			if (resolved.warning) runtime.ctx.showStatus(resolved.warning);
			await runtime.ctx.switchSessionModel(resolved.model, resolved.thinkingLevel);
		},
	},
	{
		name: "fast",
		icon: "fast",
		description:
			"切换快速服务(OpenAI service_tier=priority 或 ultrafast,Anthropic speed=fast,Google priority)",
		acpDescription: "Toggle fast mode",
		acpInputHint: "[on|ultra|off|status]",
		subcommands: [
			{ name: "on", description: "启用快速模式(priority 层级)" },
			{ name: "ultra", description: "启用 Ultrafast(OpenAI API,或提供它的 Codex 模型)" },
			{ name: "off", description: "禁用快速模式" },
			{ name: "status", description: "显示快速模式状态" },
		],
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => `快速:${formatFastModeStatus(runtime.ctx.session)}`,
		handle: async (command, runtime) => {
			const message = runFastCommand(command.args.trim().toLowerCase(), runtime.session);
			if (message === undefined) return usage(FAST_USAGE, runtime);
			await runtime.output(message);
			return commandConsumed();
		},
		handleTui: (command, runtime) => {
			const message = runFastCommand(command.args.trim().toLowerCase(), runtime.ctx.session);
			refreshStatusLine(runtime.ctx);
			runtime.ctx.showStatus(message ?? FAST_USAGE);
			clearSubmittedText(runtime);
		},
	},
	{
		name: "slow",
		icon: "fast",
		description:
			"切换慢速模式:OpenAI/Google 用 flex 层级;Anthropic 上在 Claude 会话限额后以低优先级继续",
		acpDescription: "Toggle slow mode",
		acpInputHint: "[on|off|status]",
		subcommands: [
			{ name: "on", description: "flex 层级,或 Anthropic 在会话限额时的低优先级(自动)" },
			{ name: "off", description: "标准服务;停止 Anthropic 低优先级" },
			{ name: "status", description: "显示慢速模式状态" },
		],
		allowArgs: true,
		getTuiAutocompleteDescription: runtime =>
			runtime.ctx.session.isSlowModeEnabled() ? "慢速模式:开启" : "慢速模式:关闭",
		handle: async (command, runtime) => {
			const message = runSlowCommand(command.args.trim().toLowerCase(), runtime.session);
			if (message === undefined) return usage("用法:/slow [on|off|status]", runtime);
			await runtime.output(message);
			return commandConsumed();
		},
		handleTui: (command, runtime) => {
			const message = runSlowCommand(command.args.trim().toLowerCase(), runtime.ctx.session);
			refreshStatusLine(runtime.ctx);
			runtime.ctx.showStatus(message ?? "用法:/slow [on|off|status]");
			clearSubmittedText(runtime);
		},
	},
	{
		name: "skillful",
		icon: "compass",
		description: "切换在系统提示中列出可用技能(仅本会话)",
		acpDescription: "Toggle skill listing",
		acpInputHint: "[on|off|status]",
		subcommands: [
			{ name: "on", description: "在本会话的提示中列出技能" },
			{ name: "off", description: "本会话省略技能列表" },
			{ name: "status", description: "显示技能列表状态" },
		],
		allowArgs: true,
		getTuiAutocompleteDescription: runtime =>
			`技能列表:${cfgSkillful.get(runtime.ctx.session.settings) ? "开" : "关"}`,
		handle: async (command, runtime) => {
			const arg = command.args.trim().toLowerCase();
			if (arg === "status") {
				await runtime.output(
					`技能列表:${cfgSkillful.get(runtime.session.settings) ? "开" : "关"}(会话覆盖;默认来自 skillful 设置)。`,
				);
				return commandConsumed();
			}
			if (!arg || arg === "toggle" || arg === "on" || arg === "off") {
				const enabled =
					arg === "on"
						? await runtime.session.setSkillful(true)
						: arg === "off"
							? await runtime.session.setSkillful(false)
							: await runtime.session.toggleSkillful();
				await runtime.output(`本会话的技能列表已${enabled ? "启用" : "禁用"}。`);
				return commandConsumed();
			}
			return usage("用法:/skillful [on|off|status]", runtime);
		},
		handleTui: async (command, runtime) => {
			const arg = command.args.trim().toLowerCase();
			if (arg === "status") {
				runtime.ctx.showStatus(`技能列表:${cfgSkillful.get(runtime.ctx.session.settings) ? "开" : "关"}。`);
				clearSubmittedText(runtime);
				return;
			}
			if (!arg || arg === "toggle" || arg === "on" || arg === "off") {
				const enabled =
					arg === "on"
						? await runtime.ctx.session.setSkillful(true)
						: arg === "off"
							? await runtime.ctx.session.setSkillful(false)
							: await runtime.ctx.session.toggleSkillful();
				runtime.ctx.showStatus(`本会话的技能列表已${enabled ? "启用" : "禁用"}。`);
				clearSubmittedText(runtime);
				return;
			}
			runtime.ctx.showStatus("用法:/skillful [on|off|status]");
			clearSubmittedText(runtime);
		},
	},
	{
		name: "extended-context",
		icon: "expand",
		description: "切换扩展上下文窗口",
		acpDescription: "Toggle extended context",
		acpInputHint: "[on|off|status]",
		subcommands: [
			{ name: "on", description: "启用更大的上下文窗口" },
			{ name: "off", description: "使用默认或标准计价的上下文窗口" },
			{ name: "status", description: "显示扩展上下文状态" },
		],
		allowArgs: true,
		getTuiAutocompleteDescription: runtime =>
			`扩展上下文:${formatExtendedContextStatus(runtime.ctx.settings)}`,
		handle: async (command, runtime) => {
			const output = applyExtendedContextCommand(runtime.settings, command.args);
			if (!output) return usage("用法:/extended-context [on|off|status]", runtime);
			await runtime.output(output);
			return commandConsumed();
		},
		handleTui: (command, runtime) => {
			const output = applyExtendedContextCommand(runtime.ctx.settings, command.args);
			refreshStatusLine(runtime.ctx);
			runtime.ctx.showStatus(output ?? "用法:/extended-context [on|off|status]");
			clearSubmittedText(runtime);
		},
	},
	{
		name: "computer",
		icon: "computer",
		description: "为本会话切换原生 computer-use eval prelude",
		acpDescription: "Toggle computer use",
		acpInputHint: "[on|off|status]",
		subcommands: [
			{ name: "on", description: "为本会话启用 computer use" },
			{ name: "off", description: "为本会话禁用 computer use" },
			{ name: "status", description: "显示 computer use 状态" },
		],
		allowArgs: true,
		getTuiAutocompleteDescription: runtime =>
			`Computer:${cfgComputerEnabled.get(runtime.ctx.session.settings) ? "开" : "关"}`,
		handle: async (command, runtime) => {
			const arg = command.args.trim().toLowerCase();
			if (arg === "status") {
				await runtime.output(formatComputerUseStatus(runtime.session));
				return commandConsumed();
			}
			if (!arg || arg === "toggle" || arg === "on" || arg === "off") {
				const enable = arg === "off" ? false : arg === "on" || !cfgComputerEnabled.get(runtime.session.settings);
				await runtime.output(applyComputerUseToggle(runtime.session, enable));
				return commandConsumed();
			}
			return usage("用法:/computer [on|off|status]", runtime);
		},
		handleTui: async (command, runtime) => {
			const arg = command.args.trim().toLowerCase();
			if (arg === "status") {
				runtime.ctx.showStatus(formatComputerUseStatus(runtime.ctx.session));
				clearSubmittedText(runtime);
				return;
			}
			if (!arg || arg === "toggle" || arg === "on" || arg === "off") {
				const enable =
					arg === "off" ? false : arg === "on" || !cfgComputerEnabled.get(runtime.ctx.session.settings);
				runtime.ctx.showStatus(applyComputerUseToggle(runtime.ctx.session, enable));
				clearSubmittedText(runtime);
				return;
			}
			runtime.ctx.showStatus("用法:/computer [on|off|status]");
			clearSubmittedText(runtime);
		},
	},
	{
		name: "ratchet",
		icon: "loop",
		description: "为 LLM 流程构建(或复用)eval,然后无人值守地爬山优化",
		inlineHint: "[flow and goal]",
		allowArgs: true,
		handle: (command, runtime) => {
			const armed = prepareRatchet(runtime.session, command.args);
			if ("error" in armed) return usage(armed.error, runtime);
			return { prompt: armed.kickoff };
		},
		handleTui: async (command, runtime) => {
			const { session } = runtime.ctx;
			const armed = prepareRatchet(session, command.args);
			clearSubmittedText(runtime);
			if ("error" in armed) {
				runtime.ctx.showWarning(armed.error);
				return;
			}
			// Same delivery as /guided-goal: the kickoff is a hidden developer message queued behind
			// any in-flight run; the agent's batched `ask` is the first thing the user sees.
			const images = runtime.input?.images?.length ? runtime.input.images : undefined;
			if (session.isStreaming) {
				await session.followUp(armed.kickoff, images, { synthetic: true });
				return;
			}
			try {
				await session.prompt(armed.kickoff, images ? { synthetic: true, images } : { synthetic: true });
			} catch (error) {
				if (!(error instanceof AgentBusyError)) throw error;
				await session.followUp(armed.kickoff, images, { synthetic: true });
			}
		},
	},
	{
		name: "prewalk",
		icon: "prewalk",
		description: "武装或重启一次性的模型交接",
		allowArgs: true,
		acpDescription: "Arm or restart prewalk",
		acpInputHint: "[restart]",
		subcommands: [{ name: "restart", description: "回到 @default 并重新武装到 @smol 的交接" }],
		handle: async (command, runtime) => {
			const arg = command.args.trim().toLowerCase();
			if (arg && arg !== "restart") return usage("用法:/prewalk [restart]", runtime);
			const target = resolveSessionModelSelector("@smol", runtime.session, runtime.settings);
			if (target.error || !target.model) {
				return usage(target.error ?? '未找到模型 "@smol"', runtime);
			}
			if (!runtime.session.modelRegistry.hasConfiguredAuth(target.model)) {
				return usage(`${target.model.provider}/${target.model.id} 没有 API key`, runtime);
			}
			if (arg === "restart") {
				const source = resolveSessionModelSelector("@default", runtime.session, runtime.settings);
				if (source.error || !source.model) {
					return usage(source.error ?? '未找到模型 "@default"', runtime);
				}
				if (!runtime.session.modelRegistry.hasConfiguredAuth(source.model)) {
					return usage(`${source.model.provider}/${source.model.id} 没有 API key`, runtime);
				}
				const result = await runtime.session.restartPrewalk(
					source.model,
					source.thinkingLevel,
					target.model,
					target.thinkingLevel,
				);
				if (result === "rejected") return commandConsumed();
				const restartSource = `${source.model.provider}/${source.model.id}`;
				await runtime.output(
					result === "armed"
						? `Prewalk 已重启:用 @default (${restartSource}) 规划,在下一次编辑/写入(todo 门控)时切换到 @smol (${target.model.provider}/${target.model.id})。`
						: `Prewalk 已重置:使用 @default (${restartSource});@smol 解析为相同的模型和思考级别,因此未武装交接。`,
				);
				return commandConsumed();
			}
			const armed = runtime.session.armPrewalk(target.model, target.thinkingLevel);
			if (armed) {
				await runtime.output(
					`Prewalk 开启:将在下一次编辑/写入(todo 门控)时切换到 ${target.model.provider}/${target.model.id}。`,
				);
			}
			return commandConsumed();
		},
	},
	{
		name: "modelpreset",
		icon: "model",
		description: "保存并切换模型预设(角色模型 + 思考级别)",
		acpDescription: "Manage model presets",
		acpInputHint: "[list|save|switch|delete] [name]",
		inlineHint: "[save|switch|delete|list] [name]",
		subcommands: [
			{ name: "list", description: "列出已保存的预设" },
			{ name: "save", description: "保存当前角色模型与思考级别", usage: "<name>" },
			{ name: "switch", description: "应用一个已保存的预设", usage: "<name>" },
			{ name: "delete", description: "删除一个已保存的预设", usage: "<name>" },
		],
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => {
			const count = getModelPresetNames(runtime.ctx.settings).length;
			return count > 0 ? `预设:已保存 ${count} 个` : "预设:无";
		},
		handle: async (command, runtime) => {
			const outcome = await runPresetsCommand(command.args, runtime.settings, runtime.session);
			if (outcome.usage) return usage(outcome.message, runtime);
			await runtime.output(outcome.message);
			if (outcome.switched) await runtime.notifyTitleChanged?.();
			if (outcome.changedConfig) await runtime.notifyConfigChanged?.();
			return commandConsumed();
		},
		handleTui: async (command, runtime) => {
			clearSubmittedText(runtime);
			const { ctx } = runtime;
			let args = command.args;
			if (!args.trim()) {
				const names = getModelPresetNames(ctx.settings);
				if (names.length === 0) {
					ctx.showStatus(NO_PRESETS_MESSAGE);
					return;
				}
				const picked = await ctx.showHookSelector("切换到模型预设", names);
				if (picked === undefined) return;
				args = `switch ${picked}`;
			}
			const outcome = await runPresetsCommand(args, ctx.settings, ctx.session);
			if (outcome.switched) {
				ctx.statusLine.invalidate();
				ctx.updateEditorBorderColor();
			}
			if (outcome.failed || outcome.usage) ctx.showWarning(outcome.message);
			else ctx.showStatus(outcome.message);
			ctx.ui.requestRender();
		},
	},
	{
		name: "effort",
		icon: "gauge",
		get description() {
			return `为本会话设置推理强度(思考级别、智能程度);${formatKeyHint("shift+tab")} 循环切换级别`;
		},
		acpDescription: "Set or show reasoning effort (thinking level, intelligence)",
		acpInputHint: "[level]",
		inlineHint: "[level]",
		allowArgs: true,
		subcommands: CLI_THINKING_LEVELS.map(level => ({
			name: level,
			description: getConfiguredThinkingLevelMetadata(level).description,
		})),
		getTuiAutocompleteDescription: runtime =>
			`思考:${runtime.ctx.session.configuredThinkingLevel() ?? "模型默认"}`,
		handle: async (command, runtime) => {
			const session = runtime.session;
			if (!command.args.trim()) {
				await runtime.output(
					session.model?.reasoning
						? `思考:${session.configuredThinkingLevel() ?? "模型默认"}\n可用:${session.getAvailableEffortSelectors().join(", ")}`
						: noThinkingMessage(session),
				);
				return commandConsumed();
			}
			const resolved = resolveThinkingArgument(session, command.args);
			if ("error" in resolved) return usage(resolved.error, runtime);
			session.setThinkingLevel(resolved.level);
			await runtime.output(`思考级别已设为 ${resolved.level}。`);
			// `setThinkingLevel` emits `thinking_level_changed`, which hosts with a
			// session-lifetime subscription (ACP) already turn into a config push.
			await runtime.notifyConfigChanged?.({ handledBySessionEvent: true });
			return commandConsumed();
		},
		handleTui: (command, runtime) => {
			clearSubmittedText(runtime);
			const { ctx } = runtime;
			if (!command.args.trim()) {
				if (ctx.session.model?.reasoning) ctx.showThinkingSelector();
				else ctx.showStatus(noThinkingMessage(ctx.session));
				return;
			}
			const resolved = resolveThinkingArgument(ctx.session, command.args);
			if ("error" in resolved) {
				ctx.showError(resolved.error);
				return;
			}
			// thinking_level_changed refreshes the status line and editor border.
			ctx.session.setThinkingLevel(resolved.level);
			ctx.showStatus(`思考级别已设为 ${resolved.level}。`);
		},
	},
];

const PRESETS_USAGE = "用法:/modelpreset [list | save <name> | switch <name> | delete <name>]";
const NO_PRESETS_MESSAGE = "没有已保存的模型预设。使用 /modelpreset save <name> 创建一个。";

interface PresetsCommandOutcome {
	message: string;
	usage?: boolean;
	failed?: boolean;
	switched?: boolean;
	changedConfig?: boolean;
}

/** Shared by the ACP and TUI handlers of `/modelpreset`; `args` is everything after the command name. */
async function runPresetsCommand(
	args: string,
	settings: Settings,
	session: ModelPresetSession,
): Promise<PresetsCommandOutcome> {
	const [sub = "list", ...rest] = args.trim().split(/\s+/).filter(Boolean);
	const name = rest.join(" ");
	switch (sub) {
		case "list": {
			const names = getModelPresetNames(settings);
			return { message: names.length > 0 ? `模型预设:${names.join(", ")}` : NO_PRESETS_MESSAGE };
		}
		case "save": {
			if (!name) return { message: "用法:/modelpreset save <name>", usage: true };
			if (!isValidModelPresetName(name)) {
				return {
					message: `无效的预设名 "${name}":以字母开头,后续可用字母、数字、- 或 _`,
					usage: true,
				};
			}
			saveModelPreset(settings, name);
			return { message: modelPresetSavedMessage(settings, name), changedConfig: true };
		}
		case "switch": {
			if (!name) return { message: "用法:/modelpreset switch <name>", usage: true };
			const result = await applyModelPreset(settings, session, name);
			const message = formatModelPresetSwitch(name, result);
			const wroteRoles = result.kind === "switched" || result.kind === "failed";
			return {
				message,
				failed: !isCleanModelPresetSwitch(result),
				switched: result.kind === "switched",
				changedConfig: wroteRoles,
			};
		}
		case "delete": {
			if (!name) return { message: "用法:/modelpreset delete <name>", usage: true };
			const result = deleteModelPreset(settings, name);
			if (result === "deleted") return { message: `已删除模型预设 "${name}"`, changedConfig: true };
			if (result === "project") {
				return {
					message: `预设 "${name}" 由项目或 --config 文件定义;请到那里移除`,
					failed: true,
				};
			}
			return { message: `未找到预设:${name}`, failed: true };
		}
		default:
			return { message: PRESETS_USAGE, usage: true };
	}
}
