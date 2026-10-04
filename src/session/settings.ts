import { combine, effect, register, type SettingValueOf } from "../config/registry";
import { cfgEditMode } from "../edit/settings";
import { cfgEvalJs } from "../eval/settings";
import {
	SERVICE_TIER_ANTHROPIC_OPTIONS,
	SERVICE_TIER_ANTHROPIC_VALUES,
	SERVICE_TIER_GOOGLE_OPTIONS,
	SERVICE_TIER_GOOGLE_VALUES,
	SERVICE_TIER_INHERIT_OPTIONS,
	SERVICE_TIER_INHERIT_SETTING_VALUES,
	SERVICE_TIER_OPENAI_OPTIONS,
	SERVICE_TIER_OPENAI_VALUES,
} from "../config/service-tier";
import {
	TINY_MODEL_DEVICE_DEFAULT,
	TINY_MODEL_DEVICE_SETTING_OPTIONS,
	TINY_MODEL_DEVICE_SETTING_VALUES,
} from "../tiny/device";
import {
	TINY_MODEL_DTYPE_DEFAULT,
	TINY_MODEL_DTYPE_SETTING_OPTIONS,
	TINY_MODEL_DTYPE_SETTING_VALUES,
} from "../tiny/dtype";
import { DEFAULT_WEB_SEARCH_TIMEOUT_SECONDS, MAX_WEB_SEARCH_TIMEOUT_SECONDS } from "../web/search/types";
import { DEFAULT_USAGE_RESERVE_PCT } from "@oh-my-pi/pi-ai/auth-storage";
import { configureProviderMaxInFlightRequests } from "@oh-my-pi/pi-ai/stream";
import { THINKING_EFFORTS } from "@oh-my-pi/pi-catalog/effort";
import { formatKeyHint } from "@oh-my-pi/pi-tui-zh/app-keybindings";
import { AUTO_THINKING, getConfiguredThinkingLevelMetadata, getThinkingLevelMetadata } from "@oh-my-pi/pi-tui-zh/thinking";

const EMPTY_STRING_ARRAY: string[] = [];
const EMPTY_NUMBER_RECORD: Record<string, number> = {};
const EMPTY_STRING_ARRAYS_RECORD: Record<string, string[]> = {};
const DEFAULT_TOOL_CALL_LOOP_EXEMPT_TOOLS: string[] = ["wait"];

// Power assertions: macOS IOKit, Linux login1/ScreenSaver, Windows execution state.
export const cfgPowerSleepPrevention = register({
	id: "power.sleepPrevention",
	type: "enum",
	values: ["off", "idle", "display", "system"] as const,
	default: "idle",
	ui: {
		tab: "interaction",
		group: "电源",
		label: "防休眠",
		description:
			"Prevent the system sleeping during active sessions. Each level is cumulative — it adds the flags of all lower levels.",
		options: [
			{
				value: "off",
				label: "关闭",
				description: "不阻止任何休眠",
			},
			{
				value: "idle",
				label: "阻止空闲休眠",
				description: "会话开启期间保持系统唤醒（macOS `caffeinate -i`）",
			},
			{
				value: "display",
				label: "阻止显示器休眠",
				description: "同时防止显示器空闲休眠（macOS `caffeinate -i -d`）",
			},
			{
				value: "system",
				label: "阻止系统休眠",
				description:
					"Also block all system sleep on AC and declare the user active (macOS `caffeinate -i -d -s -u`)",
			},
		],
	},
});

export const cfgPrewalkEnabled = register({
	id: "prewalk.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "model",
		group: "Prewalk",
		label: "启用 Prewalk",
		description:
			"先在当前模型上开始,然后在计划提示的待办列表出现后的第一次编辑/写入时切换到快速/廉价模型(默认 'smol' 角色)——强模型负责规划、提交待办并开始实现,然后移交。可通过 --prewalk / --no-prewalk 按会话覆盖。",
	},
});

function isLimitRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveLimit(limit: unknown): limit is number {
	return typeof limit === "number" && Number.isFinite(limit) && limit > 0;
}

/** Per-provider request limits floored to whole numbers ≥ 1; non-positive or non-numeric entries are dropped. */
export function normalizeProviderMaxInFlightRequests(value: unknown): Record<string, number> {
	const normalized: Record<string, number> = {};
	if (!isLimitRecord(value)) return normalized;
	for (const provider in value) {
		const limit = value[provider];
		if (isPositiveLimit(limit)) normalized[provider] = Math.max(1, Math.floor(limit));
	}
	return normalized;
}

/**
 * Per-provider request limits floored to whole numbers ≥ 1.
 *
 * @throws Error naming every provider whose limit is not a positive number.
 */
export function validateProviderMaxInFlightRequests(value: unknown): Record<string, number> {
	if (isLimitRecord(value)) {
		const invalidProviders: string[] = [];
		for (const provider in value) if (!isPositiveLimit(value[provider])) invalidProviders.push(provider);
		if (invalidProviders.length > 0) {
			throw new Error(`Provider request limits must be positive numbers: ${invalidProviders.join(", ")}`);
		}
	}
	return normalizeProviderMaxInFlightRequests(value);
}

export const cfgProvidersMaxInFlightRequests = register({
	id: "providers.maxInFlightRequests",
	type: "record",
	default: EMPTY_NUMBER_RECORD,
	validate: validateProviderMaxInFlightRequests,
	normalize: validateProviderMaxInFlightRequests,
	ui: {
		tab: "providers",
		group: "服务",
		label: "最大并发请求数",
		description:
			'每个 provider id(例如 “openai” 或 “anthropic”)的最大并发 LLM 请求数,在使用此配置根的本地 OMP 进程之间共享。未列出的提供商不受限制。',
	},
});
effect(cfgProvidersMaxInFlightRequests, limits =>
	configureProviderMaxInFlightRequests(normalizeProviderMaxInFlightRequests(limits)),
);

export const cfgProvidersOpenaiCodexCodeMode = register({
	id: "providers.openai-codex.codeMode",
	type: "enum",
	values: ["off", "on", "auto"] as const,
	default: "off",
	ui: {
		tab: "providers",
		group: "服务",
		label: "Codex 代码模式",
		description:
			"Route Codex code_mode_only models (GPT-5.6) through eval. The direct tools are eval, ask, todo, yield, think, checkpoint, and rewind. Use eval cells for other session tools. Mirrors codex-rs Code Mode. 'auto' follows the model catalog flag.",
	},
});

export const cfgProvidersOpenaiCodexCodeModeDirectTools = register({
	id: "providers.openai-codex.codeModeDirectTools",
	type: "array",
	default: EMPTY_STRING_ARRAY,
	ui: {
		tab: "providers",
		group: "服务",
		label: "Codex 代码模式直接工具",
		description:
			"Extra direct tools for Codex Code Mode. The standard direct tools are eval, ask, todo, yield, think, checkpoint, and rewind.",
	},
});

/**
 * Settings that change the Code Mode tool partition. `edit.mode` belongs here because it renames
 * `EditTool` on the wire (`apply_patch` vs `edit`), which the namespace metadata is keyed by.
 */
export const cfgCodeModeInputs = combine({
	codeMode: cfgProvidersOpenaiCodexCodeMode,
	directTools: cfgProvidersOpenaiCodexCodeModeDirectTools,
	evalJs: cfgEvalJs,
	editMode: cfgEditMode,
});

export const cfgImagesDescribeForTextModels = register({
	id: "images.describeForTextModels",
	type: "boolean",
	default: true,
	ui: {
		tab: "model",
		group: "视觉",
		label: "为文本模型描述图片",
		description:
			"当图片附加到不支持视觉的模型时,将其保存在 local:// 下,并注入来自支持视觉模型的描述,而不是丢弃它",
	},
});

// ────────────────────────────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────────────────────────────

// Reasoning and prompts
export const cfgDefaultThinkingLevel = register({
	id: "defaultThinkingLevel",
	type: "enum",
	values: [...THINKING_EFFORTS, AUTO_THINKING],
	default: "high",
	ui: {
		tab: "model",
		group: "思考",
		label: "思考级别",
		description: "支持思考的模型的推理深度",
		options: [getConfiguredThinkingLevelMetadata(AUTO_THINKING), ...THINKING_EFFORTS.map(getThinkingLevelMetadata)],
	},
});

export const cfgHideThinkingBlock = register({
	id: "hideThinkingBlock",
	type: "boolean",
	default: false,
	ui: {
		tab: "model",
		group: "思考",
		label: "隐藏思考块",
		description: "在助手回复中隐藏思考块",
	},
});

export const cfgProseOnlyThinking = register({
	id: "proseOnlyThinking",
	type: "boolean",
	default: true,
	ui: {
		tab: "model",
		group: "思考",
		label: "仅正文思考",
		description: "从思考摘要中省略代码块,并用省略号替换",
	},
});

export const cfgOmitThinking = register({
	id: "omitThinking",
	type: "boolean",
	default: false,
	ui: {
		tab: "model",
		group: "思考",
		label: "省略思考摘要",
		description: "指示上游提供商完全省略响应中的思考摘要(在支持的情况下)",
	},
});

export const cfgExternalThinking = register({
	id: "externalThinking",
	type: "boolean",
	default: false,
	ui: {
		tab: "model",
		group: "思考",
		label: "外部思考",
		description: "私有草稿区，不展示给用户；会禁用受支持的 GPT/Claude/Gemini 推理",
		warning: "At your own risk: providers have flagged this request shape as abuse, up to account-level enforcement",
	},
});

export const cfgModelLoopGuardEnabled = register({
	id: "model.loopGuard.enabled",
	type: "boolean",
	default: true,
	// Kill switch shared with pi-ai's stream-level guard (`utils/thinking-loop.ts`); only `1` disables.
	env: { name: "PI_NO_THINKING_LOOP_GUARD", parse: raw => (raw === "1" ? false : undefined) },
	ui: {
		tab: "model",
		group: "思考",
		label: "循环防护",
		description: "为模型推理和正文启用自动流循环检测",
	},
});

export const cfgModelLoopGuardCheckAssistantContent = register({
	id: "model.loopGuard.checkAssistantContent",
	type: "boolean",
	default: true,
	ui: {
		tab: "model",
		group: "思考",
		label: "循环防护扫描正文",
		description: "除思考日志外,也将循环防护应用于助手正文消息",
	},
});

export const cfgModelLoopGuardToolCallReminder = register({
	id: "model.loopGuard.toolCallReminder",
	type: "boolean",
	default: true,
	ui: {
		tab: "model",
		group: "思考",
		label: "循环防护工具调用提醒",
		description:
			"当 Gemini 推理流连续发出多个规划头却不调用工具时,中断它并注入一条提醒,要求其发出工具调用(需要启用循环防护)",
	},
});

export const cfgModelToolCallLoopGuardEnabled = register({
	id: "model.toolCallLoopGuard.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "model",
		group: "思考",
		label: "工具调用循环防护",
		description: "检测跨轮次的连续相同工具调用,并注入纠正性引导",
	},
});

export const cfgModelToolCallLoopGuardThreshold = register({
	id: "model.toolCallLoopGuard.threshold",
	type: "number",
	default: 5,
	ui: {
		tab: "model",
		group: "思考",
		label: "工具调用循环阈值",
		description: "触发纠正性引导所需的连续相同工具调用次数",
	},
});

export const cfgModelToolCallLoopGuardExemptTools = register({
	id: "model.toolCallLoopGuard.exemptTools",
	type: "array",
	default: DEFAULT_TOOL_CALL_LOOP_EXEMPT_TOOLS,
	ui: {
		tab: "model",
		group: "思考",
		label: "工具调用循环豁免工具",
		description: "允许连续重复而不会触发跨轮次循环防护的工具名称",
	},
});

export const cfgInlineToolDescriptors = register({
	id: "inlineToolDescriptors",
	type: "enum",
	values: ["auto", "on", "off"] as const,
	default: "auto",
	ui: {
		tab: "model",
		group: "提示词",
		label: "内联工具描述符",
		description:
			"在系统提示中渲染完整工具描述符,并从提供商工具 schema 中剥离顶层/嵌套描述,使描述文本只发送一次。Auto 对 Gemini 模型启用此功能,其他情况禁用",
		options: [
			{
				value: "auto",
				label: "自动",
				description: "对 Gemini 模型内联描述符;其他情况保留在工具 schema 中",
			},
			{ value: "on", label: "开启", description: "始终在系统提示中内联描述符" },
			{ value: "off", label: "关闭", description: "仅将描述符保留在提供商工具 schema 中" },
		],
	},
});

export const cfgIncludeModelInPrompt = register({
	id: "includeModelInPrompt",
	type: "boolean",
	default: true,
	ui: {
		tab: "model",
		group: "提示词",
		label: "在提示中显示模型",
		description: "在系统提示中显示当前模型标识,让代理知道自己使用的是哪个模型",
	},
});

export const cfgIncludeWorkspaceTree = register({
	id: "includeWorkspaceTree",
	type: "boolean",
	default: false,
	ui: {
		tab: "model",
		group: "提示词",
		label: "包含工作区目录树",
		description:
			"在系统提示中渲染工作区目录树。警告:文件被修改时,这可能会破坏跨会话的 prompt 缓存。",
	},
});

export const cfgSkillful = register({
	id: "skillful",
	type: "boolean",
	default: true,
	ui: {
		tab: "model",
		group: "提示词",
		label: "在提示中列出技能",
		description:
			"List available skills in the system prompt; disable to save context and toggle per-session with /skillful",
	},
});

/** Personality preset. */
export type Personality = SettingValueOf<typeof cfgPersonality>;

export const cfgPersonality = register({
	id: "personality",
	type: "enum",
	values: ["default", "friendly", "pragmatic", "none"] as const,
	default: "default",
	ui: {
		tab: "model",
		group: "提示词",
		label: "个性",
		description: "渲染到系统提示个性块中的沟通风格",
		options: [
			{
				value: "default",
				label: "默认",
				description: "简洁、以证据为先的工程师;信息密集、面向行动的回复",
			},
			{
				value: "friendly",
				label: "友好",
				description: "温暖、鼓励的协作者,注重推进动力和士气",
			},
			{
				value: "pragmatic",
				label: "务实",
				description: "直接、高效的工程师,注重清晰和严谨",
			},
			{ value: "none", label: "无", description: "完全省略个性块" },
		],
	},
});

// Sampling
export const cfgTemperature = register({
	id: "temperature",
	type: "number",
	default: -1,
	ui: {
		tab: "model",
		group: "采样",
		label: "温度",
		description: "采样温度(0 = 确定性,1 = 创造性,-1 = 提供商默认)",
		options: [
			{ value: "-1", label: "默认", description: "使用提供商默认值" },
			{ value: "0", label: "0", description: "确定性" },
			{ value: "0.2", label: "0.2", description: "聚焦" },
			{ value: "0.5", label: "0.5", description: "均衡" },
			{ value: "0.7", label: "0.7", description: "创造性" },
			{ value: "1", label: "1", description: "最大多样性" },
		],
	},
});

export const cfgTopP = register({
	id: "topP",
	type: "number",
	default: -1,
	ui: {
		tab: "model",
		group: "采样",
		label: "Top P",
		description: "核采样截断值 (0-1,-1 = 提供商默认)",
		options: [
			{ value: "-1", label: "默认", description: "使用提供商默认值" },
			{ value: "0.1", label: "0.1", description: "非常聚焦" },
			{ value: "0.3", label: "0.3", description: "聚焦" },
			{ value: "0.5", label: "0.5", description: "均衡" },
			{ value: "0.9", label: "0.9", description: "广泛" },
			{ value: "1", label: "1", description: "无核过滤" },
		],
	},
});

export const cfgTopK = register({
	id: "topK",
	type: "number",
	default: -1,
	ui: {
		tab: "model",
		group: "采样",
		label: "Top K",
		description: "从 top-K tokens 中采样 (-1 = 提供商默认)",
		options: [
			{ value: "-1", label: "默认", description: "使用提供商默认值" },
			{ value: "1", label: "1", description: "贪心最高 token" },
			{ value: "20", label: "20", description: "聚焦" },
			{ value: "40", label: "40", description: "均衡" },
			{ value: "100", label: "100", description: "广泛" },
		],
	},
});

export const cfgMinP = register({
	id: "minP",
	type: "number",
	default: -1,
	ui: {
		tab: "model",
		group: "采样",
		label: "Min P",
		description: "最小概率阈值 (0-1,-1 = 提供商默认)",
		options: [
			{ value: "-1", label: "默认", description: "使用提供商默认值" },
			{ value: "0.01", label: "0.01", description: "非常宽松" },
			{ value: "0.05", label: "0.05", description: "均衡" },
			{ value: "0.1", label: "0.1", description: "严格" },
		],
	},
});

export const cfgPresencePenalty = register({
	id: "presencePenalty",
	type: "number",
	default: -1,
	ui: {
		tab: "model",
		group: "采样",
		label: "存在惩罚",
		description: "对引入已存在 token 的惩罚 (-1 = 提供商默认)",
		options: [
			{ value: "-1", label: "默认", description: "使用提供商默认值" },
			{ value: "0", label: "0", description: "无惩罚" },
			{ value: "0.5", label: "0.5", description: "轻度新颖" },
			{ value: "1", label: "1", description: "鼓励新颖" },
			{ value: "2", label: "2", description: "强烈新颖" },
		],
	},
});

export const cfgRepetitionPenalty = register({
	id: "repetitionPenalty",
	type: "number",
	default: -1,
	ui: {
		tab: "model",
		group: "采样",
		label: "重复惩罚",
		description: "对重复 token 的惩罚 (-1 = 提供商默认)",
		options: [
			{ value: "-1", label: "默认", description: "使用提供商默认值" },
			{ value: "0.8", label: "0.8", description: "允许重复" },
			{ value: "1", label: "1", description: "无惩罚" },
			{ value: "1.1", label: "1.1", description: "轻度惩罚" },
			{ value: "1.2", label: "1.2", description: "均衡" },
			{ value: "1.5", label: "1.5", description: "强烈惩罚" },
		],
	},
});

const providerDefaultWhenNegative = (value: number): number | undefined => (value >= 0 ? value : undefined);

/** Agent sampling options; a negative sampling setting means "provider default" (`undefined`). */
export const cfgSampling = combine(
	{
		temperature: cfgTemperature,
		topP: cfgTopP,
		topK: cfgTopK,
		minP: cfgMinP,
		presencePenalty: cfgPresencePenalty,
		repetitionPenalty: cfgRepetitionPenalty,
		hideThinkingSummary: cfgOmitThinking,
	},
	values => ({
		temperature: providerDefaultWhenNegative(values.temperature),
		topP: providerDefaultWhenNegative(values.topP),
		topK: providerDefaultWhenNegative(values.topK),
		minP: providerDefaultWhenNegative(values.minP),
		presencePenalty: providerDefaultWhenNegative(values.presencePenalty),
		repetitionPenalty: providerDefaultWhenNegative(values.repetitionPenalty),
		hideThinkingSummary: values.hideThinkingSummary,
	}),
);

export const cfgTextVerbosity = register({
	id: "textVerbosity",
	type: "enum",
	values: ["low", "medium", "high"] as const,
	default: "medium",
	ui: {
		tab: "model",
		group: "采样",
		label: "文本详细程度",
		description: "OpenAI Responses 和 Codex 的响应详细程度(low、medium 或 high)",
		options: [
			{ value: "low", label: "低", description: "偏好简洁的回复" },
			{ value: "medium", label: "中", description: "在简洁与详细之间平衡(默认)" },
			{ value: "high", label: "高", description: "偏好详细的回复" },
		],
	},
});

export const cfgTierOpenai = register({
	id: "tier.openai",
	type: "enum",
	values: SERVICE_TIER_OPENAI_VALUES,
	default: "none",
	ui: {
		tab: "model",
		group: "采样",
		label: "服务层级 — OpenAI",
		description:
			"OpenAI / OpenAI-Codex 请求以及经由 OpenRouter 路由的 OpenAI 系模型的处理层级(none = 省略)。以 `service_tier` 字段发送。",
		options: SERVICE_TIER_OPENAI_OPTIONS,
	},
});

export const cfgTierAnthropic = register({
	id: "tier.anthropic",
	type: "enum",
	values: SERVICE_TIER_ANTHROPIC_VALUES,
	default: "none",
	ui: {
		tab: "model",
		group: "采样",
		label: "服务层级 — Anthropic",
		description:
			'Claude 请求的处理层级。`priority` 在受支持的直接 Anthropic 模型上实现快速模式(`speed: “fast”`);在 Bedrock/Vertex Claude 和经由 OpenRouter 时被忽略。',
		options: SERVICE_TIER_ANTHROPIC_OPTIONS,
	},
});

export const cfgTierGoogle = register({
	id: "tier.google",
	type: "enum",
	values: SERVICE_TIER_GOOGLE_VALUES,
	default: "none",
	ui: {
		tab: "model",
		group: "采样",
		label: "服务层级 — Google",
		description:
			"Gemini(Google AI Studio + Vertex)请求以及经由 OpenRouter 路由的 Google 系模型的处理层级(none = 省略)。作为顶层 `serviceTier` 字段发送。",
		options: SERVICE_TIER_GOOGLE_OPTIONS,
	},
});

export const cfgTierSubagent = register({
	id: "tier.subagent",
	type: "enum",
	values: SERVICE_TIER_INHERIT_SETTING_VALUES,
	default: "inherit",
	ui: {
		tab: "model",
		group: "采样",
		label: "服务层级 — 子代理",
		description:
			"派生的 task/eval 子代理的服务层级。Inherit = 匹配主代理当前的各家族层级(跟随 /fast);选择某个值则将其应用于子代理模型所属的家族。",
		options: SERVICE_TIER_INHERIT_OPTIONS,
	},
});

export const cfgTierAdvisor = register({
	id: "tier.advisor",
	protocolDefault: ["rpc", "acp"],
	type: "enum",
	values: SERVICE_TIER_INHERIT_SETTING_VALUES,
	default: "none",
	ui: {
		tab: "model",
		group: "采样",
		label: "服务层级 — 顾问",
		description:
			"顾问模型的服务层级。None = 标准处理;Inherit = 匹配主代理当前的各家族层级;选择某个值则将其应用于顾问模型所属的家族。",
		options: SERVICE_TIER_INHERIT_OPTIONS,
		condition: "advisorEnabled",
	},
});

// Retries
export const cfgRetryEnabled = register({ id: "retry.enabled", type: "boolean", default: true });

export const cfgRetryMaxRetries = register({
	id: "retry.maxRetries",
	type: "number",
	default: 10,
	ui: {
		tab: "model",
		group: "重试与回退",
		label: "重试次数",
		description: "API 错误时的最大重试次数",
		options: [
			{ value: "1", label: "1 次重试" },
			{ value: "2", label: "2 次重试" },
			{ value: "3", label: "3 次重试" },
			{ value: "5", label: "5 次重试" },
			{ value: "10", label: "10 次重试" },
		],
	},
});

export const cfgRetryBaseDelayMs = register({ id: "retry.baseDelayMs", type: "number", default: 500 });

export const cfgRetryMaxDelayMs = register({
	id: "retry.maxDelayMs",
	type: "number",
	default: 5 * 60 * 1000,
	ui: {
		tab: "model",
		group: "重试与回退",
		label: "最大重试延迟",
		description:
			"重试之间的最大等待时间（毫秒）。当提供商要求等待更久且无凭据或模型回退可用时，请求将快速失败而不是休眠等待（如 3 小时的 Anthropic 限流窗口）。0 表示不设上限——让会话通过提供商声明的配额重置自动恢复。",
	},
});

export const cfgRetryWaitForUsageReset = register({
	id: "retry.waitForUsageReset",
	type: "boolean",
	default: false,
	ui: {
		tab: "model",
		group: "重试与回退",
		label: "等待用量重置",
		get description() {
			return `When a provider reports usage-limit exhaustion with a reset time (5-hour or weekly quota windows on any provider), sleep until the reset instead of failing fast past retry.maxDelayMs. Waits are abortable (${formatKeyHint("escape")}) but also hold subagents, so leave off for unattended runs.`;
		},
	},
});

export const cfgRetryModelFallback = register({
	id: "retry.modelFallback",
	type: "boolean",
	default: true,
	ui: {
		tab: "model",
		group: "重试与回退",
		label: "重试模型回退",
		description: "允许重试恢复切换到已配置的回退模型",
	},
});

export const cfgRetryUsageAwareFallback = register({
	id: "retry.usageAwareFallback",
	type: "boolean",
	default: false,
	ui: {
		tab: "model",
		group: "重试与回退",
		label: "用量感知回退",
		description:
			"在达到硬用量限制之前,使用可靠的 coding-plan 配额报告优先选择同提供商的账户,然后是已配置的回退模型。普通的已配置 API keys 不在考虑范围内。",
	},
});

export const cfgRetryUsageReservePct = register({
	id: "retry.usageReservePct",
	type: "number",
	default: DEFAULT_USAGE_RESERVE_PCT,
	ui: {
		tab: "model",
		group: "重试与回退",
		label: "预留余量",
		description:
			"当剩余百分比低于此值时,将 coding-plan 模型视为接近上限。未知或未映射的用量保持主模型不变。",
		condition: "usageAwareFallbackEnabled",
		options: [
			{ value: "5", label: "5%", description: "仅在几乎耗尽时触发" },
			{ value: "10", label: "10%", description: "均衡的安全余量" },
			{ value: "15", label: "15%", description: "保守" },
			{ value: "20", label: "20%", description: "早期保护" },
			{ value: "25", label: "25%", description: "非常保守" },
		],
	},
});

export const cfgRetryUsageReservePolicy = register({
	id: "retry.usageReservePolicy",
	type: "enum",
	values: ["confirm", "auto", "fail-closed"] as const,
	default: "confirm",
	ui: {
		tab: "model",
		group: "重试与回退",
		label: "预留策略",
		description: "当所有同提供商的 coding-plan 账户都处于预留余量之内时该怎么做。",
		condition: "usageAwareFallbackEnabled",
		options: [
			{
				value: "confirm",
				label: "交互式确认",
				description: "在确认前让交互会话保持使用主账户;后台代理自动回退",
			},
			{
				value: "auto",
				label: "自动回退",
				description: "始终选择下一个符合条件的已配置回退",
			},
			{
				value: "fail-closed",
				label: "安全失败",
				description: "不消耗预留配额,也不选择回退",
			},
		],
	},
});

export const cfgRetryFallbackChains = register({
	id: "retry.fallbackChains",
	type: "record",
	default: EMPTY_STRING_ARRAYS_RECORD,
	ui: {
		tab: "model",
		group: "重试与回退",
		label: "重试回退链",
		description:
			'将模型角色、模型选择器(“provider/model-id”)或提供商通配符(“provider/*”)映射到有序回退选择器的 JSON 对象,例如 {"default":["openai/gpt-4o-mini"],"google-antigravity/*":["google/*","google-vertex/*"]}。面向模型的键在该模型/提供商处于活跃状态时生效,与角色无关;“provider/*”条目保留失败模型的 id 并更换提供商。带 id 前缀的通配符(“openrouter/google/*”)会重新加上失败模型裸 id 的前缀(google-antigravity/gemini-x -> openrouter/google/gemini-x),用作键时只匹配该前缀下的该提供商 id。回退条目可携带显式的思考档位后缀(“provider/model:low”、“:high”、“:max”、“:off”);裸条目继承失败轮次的档位,而“provider/*”条目始终继承。',
	},
});

export const cfgRetryFallbackRevertPolicy = register({
	id: "retry.fallbackRevertPolicy",
	type: "enum",
	values: ["cooldown-expiry", "从不"] as const,
	default: "cooldown-expiry",
	ui: {
		tab: "model",
		group: "重试与回退",
		label: "回退还原策略",
		description: "回退后何时返回主模型",
		options: [
			{
				value: "cooldown-expiry",
				label: "冷却期结束",
				description: "抑制窗口结束后返回主模型",
			},
			{ value: "从不", label: "从不", description: "一直使用回退模型,直到手动更改" },
		],
	},
});

/** Retry/backoff and usage-aware fallback policy (`retry.*` except fallback chains/revert policy). */
export const cfgRetry = combine({
	enabled: cfgRetryEnabled,
	maxRetries: cfgRetryMaxRetries,
	baseDelayMs: cfgRetryBaseDelayMs,
	maxDelayMs: cfgRetryMaxDelayMs,
	waitForUsageReset: cfgRetryWaitForUsageReset,
	modelFallback: cfgRetryModelFallback,
	usageAwareFallback: cfgRetryUsageAwareFallback,
	usageReservePct: cfgRetryUsageReservePct,
	usageReservePolicy: cfgRetryUsageReservePolicy,
});

/** Retry/backoff policy ({@link cfgRetry}). */
export type RetrySettings = SettingValueOf<typeof cfgRetry>;

export const cfgProvidersAnthropicServerSideFallback = register({
	id: "providers.anthropic.serverSideFallback",
	type: "boolean",
	default: false,
	ui: {
		tab: "model",
		group: "重试与回退",
		label: "Anthropic 服务端回退 (Fable 5)",
		description:
			"When a Claude Fable 5 / Mythos 5 request is blocked by Anthropic's safety classifier, retry it on Claude Opus 5 server-side (Anthropic `server-side-fallback-2026-06-01` beta). Opt-in — leaving this off preserves the pre-fallback behavior for every request.",
	},
});

/**
 * Anthropic subscription slow mode (`off` | `auto`). Deliberately has no
 * `/settings` UI: `/slow on|off` on an Anthropic model is the only switch.
 * `auto` switches to low priority automatically when a Claude subscription
 * hits its 5-hour limit and Anthropic offers it. Wrap-up allowance tracking
 * runs either way; this only gates the low-priority lane.
 */
export const cfgProvidersAnthropicSlowMode = register({
	id: "providers.anthropic.slowMode",
	type: "enum",
	values: ["off", "auto"] as const,
	default: "off" as const,
});

// Provider selection
export const cfgProvidersOllamaCloudMaxConcurrency = register({
	id: "providers.ollama-cloud.maxConcurrency",
	type: "number",
	default: 3,
	ui: {
		tab: "providers",
		group: "服务",
		label: "Ollama Cloud 最大并发数",
		description: "每个进程的 Ollama Cloud 子代理最大并发运行数;0 禁用该提供商特定限制",
	},
});

export const cfgProvidersWebSearchTimeoutSeconds = register({
	id: "providers.webSearchTimeoutSeconds",
	type: "number",
	default: DEFAULT_WEB_SEARCH_TIMEOUT_SECONDS,
	ui: {
		tab: "providers",
		group: "服务",
		label: "Web 搜索超时",
		description: `web_search 前进到下一个回退前,每个提供商搜索传输的硬超时(秒)(最大 ${MAX_WEB_SEARCH_TIMEOUT_SECONDS})`,
		options: [
			{ value: "30", label: "30 秒" },
			{ value: "60", label: "1 分钟" },
			{ value: "120", label: "2 分钟" },
			{ value: "180", label: "3 分钟" },
			{ value: "300", label: "5 分钟" },
		],
	},
});

export const cfgProvidersAntigravityEndpoint = register({
	id: "providers.antigravityEndpoint",
	type: "enum",
	values: ["auto", "production", "sandbox"] as const,
	default: "auto",
	ui: {
		tab: "providers",
		group: "服务",
		label: "Antigravity 端点模式",
		description: "google-antigravity 提供商的端点路由策略(chat、search、image、discovery)",
		options: [
			{
				value: "auto",
				label: "自动",
				description: "尝试生产端点,5xx/429 时故障转移到沙箱",
			},
			{
				value: "production",
				label: "仅生产",
				description: "仅强制使用生产端点",
			},
			{
				value: "sandbox",
				label: "仅沙箱",
				description: "仅强制使用沙箱端点",
			},
		],
	},
});

export const cfgProvidersFireworksTier = register({
	id: "providers.fireworksTier",
	type: "enum",
	values: ["standard", "priority"] as const,
	default: "standard",
	ui: {
		tab: "providers",
		group: "Fireworks",
		label: "Fireworks 层级",
		description:
			'Fireworks 请求的服务路径。Priority 发送 `service_tier: “priority”` 以在高峰流量期间以更高价格换取更高可靠性;Standard 省略它。Fast (`-fast`) 模型忽略此项——Fast 有它自己的服务路径。',
		options: [
			{ value: "standard", label: "标准", description: "默认服务路径(无 service_tier)" },
			{
				value: "priority",
				label: "优先",
				description: "优先服务路径:更高可靠性,按 token 溢价计费",
			},
		],
	},
});

export const cfgProvidersTinyModelDevice = register({
	id: "providers.tinyModelDevice",
	type: "enum",
	values: TINY_MODEL_DEVICE_SETTING_VALUES,
	default: TINY_MODEL_DEVICE_DEFAULT,
	env: {
		name: "PI_TINY_DEVICE",
		parse: raw => TINY_MODEL_DEVICE_SETTING_VALUES.find(value => value === raw.trim().toLowerCase()),
	},
	ui: {
		tab: "providers",
		group: "小模型",
		label: "小模型设备",
		description:
			"Inference backend for local tiny models (titles + memory): an ONNX execution provider, or `mlx` to download MLX weights and run them through mlx-lm on Apple silicon. Default uses CPU-only ONNX. The PI_TINY_DEVICE env var overrides this.",
		options: TINY_MODEL_DEVICE_SETTING_OPTIONS,
	},
});

export const cfgProvidersTinyModelDtype = register({
	id: "providers.tinyModelDtype",
	type: "enum",
	values: TINY_MODEL_DTYPE_SETTING_VALUES,
	default: TINY_MODEL_DTYPE_DEFAULT,
	env: {
		name: "PI_TINY_DTYPE",
		parse: raw => TINY_MODEL_DTYPE_SETTING_VALUES.find(value => value === raw.trim().toLowerCase()),
	},
	ui: {
		tab: "providers",
		group: "小模型",
		label: "小模型精度",
		description:
			"ONNX quantization/precision for local tiny models. Default uses each model's shipped dtype (q4); lower precision is faster, higher is more faithful. Ignored by the MLX backend (its repos are pre-quantized 4-bit). The PI_TINY_DTYPE env var overrides this.",
		options: TINY_MODEL_DTYPE_SETTING_OPTIONS,
	},
});

export const cfgProvidersAutoThinkingMaxEffort = register({
	id: "providers.autoThinkingMaxEffort",
	type: "enum",
	values: ["xhigh", "max"] as const,
	default: "xhigh",
	ui: {
		tab: "model",
		group: "思考",
		label: "自动思考上限",
		description:
			"`auto` 分类器可解析的最高档位。`xhigh` 让分类器比最高档低一档,因此只有显式的 `ultrathink` 才能达到 `max`;`max` 允许分类器判定为例外的一轮,在支持的模型上计入最高档费用。",
		condition: "autoThinkingActive",
		options: [
			{ value: "xhigh", label: "xhigh", description: "分类器在 xhigh 处停止(默认)" },
			{ value: "max", label: "max", description: "在模型支持的情况下,分类器可解析为 max" },
		],
	},
});

export const cfgFeaturesUnexpectedStopDetection = register({
	id: "features.unexpectedStopDetection",
	type: "enum",
	values: ["none", "mechanical", "smart"] as const,
	default: "mechanical",
	ui: {
		tab: "interaction",
		group: "代理",
		label: "异常停止",
		description:
			"Automatically recover when the assistant stops without a visible message. Smart also classifies text-only stops with a small model.",
		options: [
			{ value: "none", label: "无", description: "已禁用" },
			{
				value: "mechanical",
				label: "机械判定",
				description: "对没有可见助手消息的停止进行重试；工具调用除外（默认）",
			},
			{
				value: "smart",
				label: "智能",
				description: "机械判定 + 用小模型对纯文本停止分类",
			},
		],
	},
});

export const cfgProvidersKimiApiFormat = register({
	id: "providers.kimiApiFormat",
	type: "enum",
	values: ["auto", "openai", "anthropic"] as const,
	default: "auto",
	ui: {
		tab: "providers",
		group: "协议",
		label: "Kimi API 格式",
		description: "Kimi Code 提供商的 API 格式(auto 跟随模型实时元数据)",
		options: [
			{ value: "auto", label: "自动", description: "使用模型服务端声明的协议" },
			{ value: "openai", label: "OpenAI", description: "api.kimi.com" },
			{ value: "anthropic", label: "Anthropic", description: "api.moonshot.ai" },
		],
	},
});

export const cfgProvidersOpenaiWebsockets = register({
	id: "providers.openaiWebsockets",
	type: "enum",
	values: ["auto", "off", "on"] as const,
	default: "auto",
	ui: {
		tab: "providers",
		group: "协议",
		label: "OpenAI WebSockets",
		description: "OpenAI Codex 模型的 websocket 策略(auto 使用模型默认,on 强制,off 禁用)",
		options: [
			{ value: "auto", label: "自动", description: "使用模型/提供商默认 websocket 行为" },
			{ value: "off", label: "关闭", description: "禁用 OpenAI Codex 模型的 websockets" },
			{ value: "on", label: "开启", description: "强制 OpenAI Codex 模型使用 websockets" },
		],
	},
});

export const cfgProvidersOpenaiLiveSteering = register({
	id: "providers.openaiLiveSteering",
	type: "boolean",
	default: true,
	ui: {
		tab: "providers",
		group: "协议",
		label: "OpenAI Live Steering",
		description:
			"Deliver messages typed while a GPT-6 response streams into that response over the Codex WebSocket, instead of waiting for the next tool boundary",
	},
});

export const cfgProvidersCacheRetention = register({
	id: "providers.cacheRetention",
	type: "enum",
	values: ["auto", "short", "long", "none"] as const,
	default: "auto",
	ui: {
		tab: "providers",
		group: "协议",
		label: "提示缓存保留",
		description:
			"Prompt-cache retention forwarded to providers that support it (Anthropic, Bedrock, OpenRouter, OpenAI)",
		options: [
			{
				value: "auto",
				label: "自动",
				description:
					"Provider default — Anthropic OAuth subscriber sessions default to 1h, API keys use 5m; PI_CACHE_RETENTION still applies",
			},
			{
				value: "short",
				label: "短（5 分钟）",
				description: "最便宜的缓存写入；配合缓存预热可在空闲时保持短条目存活",
			},
			{
				value: "long",
				label: "长（1 小时）",
				description: "在 provider 支持的范围内设置 1h TTL；写入成本更高，仅在活动运行期间预热",
			},
			{ value: "none", label: "关闭", description: "禁用提示缓存与缓存亲和路由" },
		],
	},
});

export const cfgProvidersCacheWarming = register({
	id: "providers.cacheWarming",
	type: "enum",
	values: ["off", "streaming", "idle"] as const,
	default: "idle",
	ui: {
		tab: "providers",
		group: "协议",
		label: "缓存预热",
		description:
			"Re-send the last request with a one-token output budget shortly before its prompt-cache entry expires",
		options: [
			{ value: "off", label: "关闭", description: "禁用缓存预热" },
			{
				value: "streaming",
				label: "流式输出",
				description: "在长时间工具执行期间保护高成本前缀；当 agent 稳定后停止",
			},
			{
				value: "idle",
				label: "空闲",
				description:
					"Also refresh 5-minute entries between runs while the expected savings stay above the cost floor",
			},
		],
	},
});

export const cfgProvidersStreamFirstEventTimeoutSeconds = register({
	id: "providers.streamFirstEventTimeoutSeconds",
	type: "number",
	default: -1,
	ui: {
		tab: "providers",
		group: "超时",
		label: "流首事件超时",
		description:
			"等待模型流第一个事件的秒数;-1 使用提供商/环境默认值,0 禁用看门狗",
		options: [
			{ value: "-1", label: "自动", description: "使用提供商默认值和 PI_* 超时环境变量" },
			{ value: "0", label: "关闭", description: "禁用首事件超时" },
			{ value: "300", label: "5 分钟" },
			{ value: "600", label: "10 分钟" },
			{ value: "1800", label: "30 分钟" },
		],
	},
});

export const cfgProvidersStreamIdleTimeoutSeconds = register({
	id: "providers.streamIdleTimeoutSeconds",
	type: "number",
	default: -1,
	ui: {
		tab: "providers",
		group: "超时",
		label: "流空闲超时",
		description:
			"模型流在事件之间可保持静默的秒数;-1 使用提供商/环境默认值,0 禁用看门狗",
		options: [
			{ value: "-1", label: "自动", description: "使用提供商默认值和 PI_* 超时环境变量" },
			{ value: "0", label: "关闭", description: "禁用空闲超时" },
			{ value: "300", label: "5 分钟" },
			{ value: "600", label: "10 分钟" },
			{ value: "1800", label: "30 分钟" },
		],
	},
});

export const cfgProvidersOpenrouterVariant = register({
	id: "providers.openrouterVariant",
	type: "enum",
	values: ["default", "nitro", "floor", "online", "exacto"] as const,
	default: "default",
	ui: {
		tab: "providers",
		group: "协议",
		label: "OpenRouter 路由",
		description:
			"追加到 OpenRouter 模型 ID 的默认路由变体后缀(选择器已指定变体时覆盖)",
		options: [
			{ value: "default", label: "默认", description: "无后缀;使用 OpenRouter 默认路由" },
			{ value: "nitro", label: ":nitro", description: "优先吞吐量 / 最低延迟" },
			{ value: "floor", label: ":floor", description: "优先最便宜的可用提供商" },
			{ value: "online", label: ":online", description: "启用 OpenRouter 的 web-search 插件" },
			{
				value: "exacto",
				label: ":exacto",
				description: "精选的高质量提供商(仅为特定模型定义)",
			},
		],
	},
});

export const cfgProvidersFetch = register({
	id: "providers.fetch",
	type: "enum",
	values: ["auto", "native", "trafilatura", "lynx", "parallel", "firecrawl", "jina"] as const,
	default: "auto",
	ui: {
		tab: "providers",
		group: "服务",
		label: "抓取提供商",
		description: "fetch/read URL 工具的阅读器后端优先级",
		options: [
			{
				value: "auto",
				label: "自动",
				description: "优先级：native > trafilatura > lynx > parallel > firecrawl > jina",
			},
			{ value: "native", label: "原生", description: "进程内 HTML→Markdown 转换器(始终可用)" },
			{ value: "trafilatura", label: "Trafilatura", description: "通过 uv/pip 自动安装" },
			{ value: "lynx", label: "Lynx", description: "需要 lynx 系统包" },
			{ value: "parallel", label: "Parallel", description: "需要 PARALLEL_API_KEY" },
			{ value: "firecrawl", label: "Firecrawl", description: "需要 FIRECRAWL_API_KEY" },
			{ value: "jina", label: "Jina", description: "使用 r.jina.ai 阅读器(JINA_API_KEY 可选)" },
		],
	},
});

// Codex saved rate-limit resets (auto-redeem)
export const cfgCodexResetsAutoRedeem = register({
	id: "codexResets.autoRedeem",
	type: "enum",
	values: ["unset", "yes", "no"] as const,
	default: "unset" as const,
	ui: {
		tab: "providers",
		group: "服务",
		label: "Codex 自动赎回保存的重置",
		description:
			"自动花费保存的 Codex 限流重置:当一轮卡住且没有其他账户可接管时,恢复被耗尽的 5 小时或每周窗口阻止的账户,并抢救即将过期的额度。unset 在首次花费前询问,yes 不加提示直接花费,no 禁用这两项检查。",
		options: [
			{
				value: "unset",
				label: "未设置",
				description: "检查资格,然后在花费第一个保存的重置前询问。",
			},
			{ value: "yes", label: "是", description: "不加提示地花费符合条件的保存重置。" },
			{ value: "no", label: "否", description: "不运行保存重置自动赎回检查。" },
		],
	},
});

export const cfgCodexResetsMinBlockedMinutes = register({
	id: "codexResets.minBlockedMinutes",
	type: "number",
	default: 60,
	ui: {
		tab: "providers",
		group: "服务",
		label: "Codex 自动赎回最小阻塞",
		description:
			"仅当自然解锁——耗尽的 5 小时/每周窗口中最近的重置——至少还有这么多分钟时才自动赎回(不要为了省一次短暂的等待而花费稀缺额度)。调高它(例如 360)可忽略仅 5 小时的阻塞。",
	},
});

export const cfgCodexResetsKeepCredits = register({
	id: "codexResets.keepCredits",
	type: "number",
	default: 0,
	ui: {
		tab: "providers",
		group: "服务",
		label: "Codex 自动赎回储备",
		description:
			"绝不低于这个数量地自动花费保存的重置(0 = 最后一份额度也可能被自动花费)。即将过期的额度除外——保留的额度过期也不保留任何东西。",
	},
});

export const cfgCodexResetsSalvageHorizonHours = register({
	id: "codexResets.salvageHorizonHours",
	type: "number",
	default: 12,
	ui: {
		tab: "providers",
		group: "服务",
		label: "Codex 重置抢救时限",
		description:
			"当保存的 Codex 重置将在这么多小时内过期,且任一聊天窗口(5 小时或每周)有值得恢复的用量时,自动花费它(0 禁用过期抢救)。",
	},
});

/** Codex saved-reset auto-redeem policy (`codexResets.*`). */
export const cfgCodexResets = combine({
	autoRedeem: cfgCodexResetsAutoRedeem,
	minBlockedMinutes: cfgCodexResetsMinBlockedMinutes,
	keepCredits: cfgCodexResetsKeepCredits,
	salvageHorizonHours: cfgCodexResetsSalvageHorizonHours,
});

/** Whether automatic reset redemption asks first, spends, or remains disabled. */
export type ResetAutoRedeemMode = SettingValueOf<typeof cfgCodexResetsAutoRedeem>;

// Claude Cedar/Juniper rate-limit resets (independent auto-redeem consent)
export const cfgClaudeResetsAutoRedeem = register({
	id: "claudeResets.autoRedeem",
	type: "enum",
	values: ["unset", "yes", "no"] as const,
	default: "unset" as const,
	ui: {
		tab: "providers",
		group: "服务",
		label: "Claude 自动兑换重置",
		description:
			"Spend eligible Claude Cedar or Juniper resets automatically. Cedar is spent only for covered limits; Juniper can only recover a sole 5-hour block. unset asks before the first spend, yes spends without prompting, and no disables blocked recovery and expiry salvage.",
		options: [
			{
				value: "unset",
				label: "未设置",
				description: "检查实时资格，然后在消耗第一个 Claude reset 之前询问。",
			},
			{ value: "yes", label: "是", description: "无需提示即可消耗符合条件的 Claude reset。" },
			{ value: "no", label: "否", description: "不运行 Claude reset 自动兑换检查。" },
		],
	},
});

export const cfgClaudeResetsMinBlockedMinutes = register({
	id: "claudeResets.minBlockedMinutes",
	type: "number",
	default: 60,
	ui: {
		tab: "providers",
		group: "服务",
		label: "Claude 自动兑换最小区块",
		description:
			"Only auto-redeem when the natural unblock — the latest reset among the exhausted covered windows — is at least this many minutes away. A 5-hour-only reset is never used for a weekly or model-scoped block.",
	},
});

export const cfgClaudeResetsKeepCredits = register({
	id: "claudeResets.keepCredits",
	type: "number",
	default: 0,
	ui: {
		tab: "providers",
		group: "服务",
		label: "Claude 自动兑换储备",
		description:
			"Keep at least this many Claude resets banked (0 allows the last eligible reset to be spent automatically). The reserve also applies to expiry salvage.",
	},
});

export const cfgClaudeResetsSalvageHorizonHours = register({
	id: "claudeResets.salvageHorizonHours",
	type: "number",
	default: 12,
	ui: {
		tab: "providers",
		group: "服务",
		label: "Claude Reset 抢救时间范围",
		description:
			"Use a server-selected Cedar reset within this many hours of expiry only when its covered windows have meaningful usage to restore and the grant permits early use or a covered window is exhausted (0 disables salvage).",
	},
});

/** Claude reset auto-redeem policy (`claudeResets.*`), independent of {@link cfgCodexResets}. */
export const cfgClaudeResets = combine({
	autoRedeem: cfgClaudeResetsAutoRedeem,
	minBlockedMinutes: cfgClaudeResetsMinBlockedMinutes,
	keepCredits: cfgClaudeResetsKeepCredits,
	salvageHorizonHours: cfgClaudeResetsSalvageHorizonHours,
});

export const cfgProviderAppendOnlyContext = register({
	id: "provider.appendOnlyContext",
	type: "enum",
	values: ["auto", "on", "off"] as const,
	default: "auto",
	ui: {
		tab: "providers",
		group: "协议",
		label: "仅追加上下文",
		description:
			"缓存系统提示 + 工具规格,并保持仅追加的消息日志,使提供商前缀缓存(DeepSeek、Xiaomi/SGLang、Anthropic)以最大命中率工作。Auto 对已知的前缀缓存提供商启用。",
		options: [
			{ value: "auto", label: "自动", description: "对已知的前缀缓存提供商启用(推荐)" },
			{ value: "on", label: "开启", description: "始终启用仅追加上下文" },
			{ value: "off", label: "关闭", description: "禁用仅追加上下文" },
		],
	},
});

export const cfgThinkingBudgetsMinimal = register({ id: "thinkingBudgets.minimal", type: "number", default: 1024 });

export const cfgThinkingBudgetsLow = register({ id: "thinkingBudgets.low", type: "number", default: 2048 });

export const cfgThinkingBudgetsMedium = register({ id: "thinkingBudgets.medium", type: "number", default: 8192 });

export const cfgThinkingBudgetsHigh = register({ id: "thinkingBudgets.high", type: "number", default: 16384 });

export const cfgThinkingBudgetsXhigh = register({ id: "thinkingBudgets.xhigh", type: "number", default: 32768 });

export const cfgThinkingBudgetsMax = register({ id: "thinkingBudgets.max", type: "number", default: 32768 });

/** Token budget per thinking level (`thinkingBudgets.*`) on transports that accept reasoning token budgets. */
export const cfgThinkingBudgets = combine({
	minimal: cfgThinkingBudgetsMinimal,
	low: cfgThinkingBudgetsLow,
	medium: cfgThinkingBudgetsMedium,
	high: cfgThinkingBudgetsHigh,
	xhigh: cfgThinkingBudgetsXhigh,
	max: cfgThinkingBudgetsMax,
});
