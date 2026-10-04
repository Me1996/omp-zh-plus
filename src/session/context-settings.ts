import { combine, register, type SettingValueOf } from "../config/registry";
import { COMPACTION_METHOD_CHOICES, DEFAULT_COMPACTION_METHOD_ORDER } from "./compaction-methods";
import { SHAPE_VARIANT_NAMES } from "@oh-my-pi/snapcompact";

const EMPTY_STRING_ARRAY: string[] = [];

export const cfgWorkspaceAdditionalDirectories = register({
	id: "workspace.additionalDirectories",
	type: "array",
	default: EMPTY_STRING_ARRAY,
	ui: {
		tab: "context",
		group: "通用",
		label: "附加工作区目录",
		description:
			"作为附加根目录加入每个会话的额外工作区目录(多根工作区)。可通过 /add-dir 和 /remove-dir 实时管理。路径相对于 cwd 解析;建议使用绝对路径。代理会被告知这些根目录存在,并可以 read/grep/glob 它们。",
	},
});

// ────────────────────────────────────────────────────────────────────────
// Context
// ────────────────────────────────────────────────────────────────────────

// Context promotion
export const cfgContextPromotionEnabled = register({
	id: "contextPromotion.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "context",
		group: "通用",
		label: "自动提升上下文",
		description: "上下文溢出时提升到更大上下文的模型,而不是压缩",
	},
});

// Opt in to advertised maximum context windows and premium long-context
// tiers. Off preserves default windows and caps premium models before
// requests cross into their higher pricing tier.
export const cfgExtendedContext = register({
	id: "extendedContext",
	type: "boolean",
	default: false,
	ui: {
		tab: "context",
		group: "通用",
		label: "扩展上下文",
		description:
			"在支持的模型上使用更大的上下文窗口，可能产生溢价费用；关闭则保持默认或按标准计价收费的窗口",
	},
});

// Compaction
export const cfgCompactionEnabled = register({
	id: "compaction.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "context",
		group: "压缩",
		label: "自动压缩",
		description: "上下文过大时自动压缩",
	},
});

export const cfgCompactionExperimentalContextManagement = register({
	id: "compaction.experimentalContextManagement",
	type: "boolean",
	default: false,
	ui: {
		tab: "context",
		group: "压缩",
		label: "基于笔记的上下文窗口（实验性）",
		description: "跨上下文窗口保留持久笔记和可搜索的原始历史记录。",
	},
});

export const cfgCompactionMidTurnEnabled = register({
	id: "compaction.midTurnEnabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "context",
		group: "压缩",
		label: "轮中压缩",
		description:
			"Check thresholds at safe mid-turn tool-loop boundaries before the next provider request; subagents always check, since their whole assignment is one turn",
	},
});

export const cfgCompactionMethodOrder = register({
	id: "compaction.methodOrder",
	type: "array",
	default: [...DEFAULT_COMPACTION_METHOD_ORDER],
	ui: {
		tab: "context",
		group: "压缩",
		label: "压缩方式顺序",
		description:
			"Preferred fallback order for automatic context maintenance; unavailable or failed methods advance to the next choice",
		options: COMPACTION_METHOD_CHOICES,
		ordered: true,
	},
});

export const cfgCompactionThresholdPercent = register({
	id: "compaction.thresholdPercent",
	type: "number",
	default: -1,
	ui: {
		tab: "context",
		group: "压缩",
		label: "压缩阈值",
		description: "上下文维护的百分比阈值;设为默认以使用旧的基于预留的行为",
		options: [
			{ value: "default", label: "默认", description: "旧的基于预留的阈值" },
			{ value: "10", label: "10%", description: "极早维护" },
			{ value: "20", label: "20%", description: "很早维护" },
			{ value: "30", label: "30%", description: "较早维护" },
			{ value: "40", label: "40%", description: "中等偏早维护" },
			{ value: "50", label: "50%", description: "中点" },
			{ value: "60", label: "60%", description: "中等上下文占用" },
			{ value: "70", label: "70%", description: "均衡" },
			{ value: "75", label: "75%", description: "略激进" },
			{ value: "80", label: "80%", description: "典型阈值" },
			{ value: "85", label: "85%", description: "激进的上下文占用" },
			{ value: "90", label: "90%", description: "非常激进" },
			{ value: "95", label: "95%", description: "接近上下文上限" },
		],
	},
});

export const cfgCompactionThresholdTokens = register({
	id: "compaction.thresholdTokens",
	type: "number",
	default: -1,
	ui: {
		tab: "context",
		group: "压缩",
		label: "压缩 Token 上限",
		description: "上下文维护的固定 token 上限;设置后覆盖百分比",
		options: [
			{ value: "default", label: "默认", description: "使用基于百分比的阈值" },
			{ value: "25000", label: "25K tokens", description: "200K 窗口的 1/8" },
			{ value: "50000", label: "50K tokens", description: "200K 窗口的 1/4" },
			{ value: "100000", label: "100K tokens", description: "200K 窗口的 1/2" },
			{ value: "150000", label: "150K tokens", description: "200K 窗口的 3/4" },
			{ value: "200000", label: "200K tokens", description: "完整标准上下文窗口" },
			{ value: "300000", label: "300K tokens", description: "大上下文窗口" },
			{ value: "500000", label: "500K tokens", description: "超大上下文窗口" },
		],
	},
});

export const cfgCompactionHandoffSaveToDisk = register({
	id: "compaction.handoffSaveToDisk",
	type: "boolean",
	default: false,
	ui: {
		tab: "context",
		group: "压缩",
		label: "保存交接文档",
		description: "为自动交接流程将生成的交接文档保存为 markdown 文件",
	},
});

export const cfgCompactionRemoteStreamingV2Enabled = register({
	id: "compaction.remoteStreamingV2Enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "context",
		group: "压缩",
		label: "远程压缩 V2",
		description: "对兼容的远程压缩模型使用 Responses 流式压缩",
	},
});

export const cfgCompactionAsyncEnabled = register({
	id: "compaction.asyncEnabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "context",
		group: "压缩",
		label: "异步压缩",
		description:
			"Speculatively summarize in the background as context nears the compaction threshold, then splice the ready result in when the threshold is crossed",
	},
});

// No default: an unset reserve tells the compaction layer the user never
// chose one, so small-window recovery may swap in the proportional reserve
// (see resolveBudgetReserveTokens). A materialized 16384 here would make
// every session look explicitly configured.
export const cfgCompactionReserveTokens = register({
	id: "compaction.reserveTokens",
	type: "number",
	default: undefined,
});

export const cfgCompactionKeepRecentTokens = register({
	id: "compaction.keepRecentTokens",
	type: "number",
	default: 20000,
});

export const cfgCompactionAutoContinue = register({ id: "compaction.autoContinue", type: "boolean", default: true });

export const cfgCompactionRemoteEndpoint = register({
	id: "compaction.remoteEndpoint",
	type: "string",
	default: undefined,
});

export const cfgCompactionV2RetainedMessageBudget = register({
	id: "compaction.v2RetainedMessageBudget",
	type: "number",
	default: 64000,
});

// Idle compaction
export const cfgCompactionIdleEnabled = register({
	id: "compaction.idleEnabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "context",
		group: "压缩",
		label: "空闲压缩",
		description: "空闲时,当 token 数超过阈值则压缩上下文",
	},
});

export const cfgCompactionIdleThresholdTokens = register({
	id: "compaction.idleThresholdTokens",
	type: "number",
	default: 200000,
	ui: {
		tab: "context",
		group: "压缩",
		label: "空闲压缩阈值",
		description: "触发空闲压缩的 token 数",
		options: [
			{ value: "100000", label: "100K tokens" },
			{ value: "200000", label: "200K tokens" },
			{ value: "300000", label: "300K tokens" },
			{ value: "400000", label: "400K tokens" },
			{ value: "500000", label: "500K tokens" },
			{ value: "600000", label: "600K tokens" },
			{ value: "700000", label: "700K tokens" },
			{ value: "800000", label: "800K tokens" },
			{ value: "900000", label: "900K tokens" },
		],
	},
});

export const cfgCompactionIdleTimeoutSeconds = register({
	id: "compaction.idleTimeoutSeconds",
	type: "number",
	default: 300,
	ui: {
		tab: "context",
		group: "压缩",
		label: "空闲压缩延迟",
		description: "空闲后等待多少秒再压缩",
		options: [
			{ value: "60", label: "1 分钟" },
			{ value: "120", label: "2 分钟" },
			{ value: "300", label: "5 分钟" },
			{ value: "600", label: "10 分钟" },
			{ value: "1800", label: "30 分钟" },
			{ value: "3600", label: "1 小时" },
		],
	},
});

export const cfgCompactionSupersedeReads = register({
	id: "compaction.supersedeReads",
	type: "boolean",
	default: true,
	ui: {
		tab: "context",
		group: "压缩",
		label: "取代过期读取",
		description: "再次读取同一文件时清理较旧的读取结果(缓存感知,每轮运行)",
	},
});

export const cfgCompactionDropUseless = register({
	id: "compaction.dropUseless",
	type: "boolean",
	default: true,
	ui: {
		tab: "context",
		group: "压缩",
		label: "省略无事件结果",
		description:
			"消费后清理被标记为上下文无用的工具结果(无匹配、等待超时)(缓存感知)",
	},
});

/** Every `compaction.*` setting as one memoized snapshot (the configured compaction policy). */
export const cfgCompaction = combine({
	enabled: cfgCompactionEnabled,
	experimentalContextManagement: cfgCompactionExperimentalContextManagement,
	methodOrder: cfgCompactionMethodOrder,
	thresholdPercent: cfgCompactionThresholdPercent,
	thresholdTokens: cfgCompactionThresholdTokens,
	reserveTokens: cfgCompactionReserveTokens,
	keepRecentTokens: cfgCompactionKeepRecentTokens,
	midTurnEnabled: cfgCompactionMidTurnEnabled,
	asyncEnabled: cfgCompactionAsyncEnabled,
	handoffSaveToDisk: cfgCompactionHandoffSaveToDisk,
	autoContinue: cfgCompactionAutoContinue,
	remoteEndpoint: cfgCompactionRemoteEndpoint,
	remoteStreamingV2Enabled: cfgCompactionRemoteStreamingV2Enabled,
	v2RetainedMessageBudget: cfgCompactionV2RetainedMessageBudget,
	idleEnabled: cfgCompactionIdleEnabled,
	idleThresholdTokens: cfgCompactionIdleThresholdTokens,
	idleTimeoutSeconds: cfgCompactionIdleTimeoutSeconds,
	supersedeReads: cfgCompactionSupersedeReads,
	dropUseless: cfgCompactionDropUseless,
});

/** Configured compaction policy ({@link cfgCompaction}). */
export type CompactionSettings = SettingValueOf<typeof cfgCompaction>;

// Experimental: snapcompact inline imaging (transient, per-request; never persisted)
export const cfgSnapcompactSystemPrompt = register({
	id: "snapcompact.systemPrompt",
	type: "enum",
	values: ["none", "agents-md", "all"] as const,
	default: "none",
	ui: {
		tab: "context",
		group: "实验性",
		label: "Snapcompact 系统提示",
		description:
			"实验性:将选定的系统提示文本渲染为密集 PNG 图片,并附加到第一条用户消息(仅限视觉模型)。节省 tokens;但被成像的文本会失去 prompt 缓存。",
		options: [
			{ value: "none", label: "无", description: "保持系统提示为文本。" },
			{
				value: "agents-md",
				label: "AGENTS.md",
				description: "仅在节省 tokens 时,将已加载的上下文文件指令移动到图片。",
			},
			{
				value: "all",
				label: "全部",
				description: "仅在节省 tokens 时,将完整系统提示移动到图片。",
			},
		],
	},
});

export const cfgSnapcompactToolResults = register({
	id: "snapcompact.toolResults",
	type: "boolean",
	default: false,
	ui: {
		tab: "context",
		group: "实验性",
		label: "Snapcompact 工具结果",
		description:
			"实验性:将大量历史工具结果渲染为密集 PNG 图片而不是文本(仅限视觉模型)。在累积的 read/search 输出上节省 tokens。",
	},
});

export const cfgToolsFormat = register({
	id: "tools.format",
	type: "enum",
	values: [
		"auto",
		"native",
		"glm",
		"hermes",
		"kimi",
		"xml",
		"anthropic",
		"deepseek",
		"harmony",
		"qwen3",
		"gemini",
		"gemma",
		"minimax",
	] as const,
	default: "auto",
	ui: {
		tab: "context",
		group: "实验性",
		label: "工具调用模式",
		description:
			"Controls how tools are exposed to the model. Auto uses provider-native tool calls unless the selected model is marked as not supporting them, then falls back to the GLM owned dialect. Native forces provider-native tools; the other values force the named owned dialect.",
		options: [
			{
				value: "auto",
				label: "自动",
				description: "除非已知模型不支持,否则使用原生工具调用。",
			},
			{ value: "native", label: "原生", description: "使用提供商原生工具调用。" },
			{ value: "glm", label: "GLM", description: "使用 GLM 风格带内工具调用。" },
			{ value: "hermes", label: "Hermes", description: "使用 Hermes 风格带内工具调用。" },
			{ value: "kimi", label: "Kimi", description: "使用 Kimi 风格带内工具调用。" },
			{ value: "xml", label: "XML", description: "使用通用 XML 带内工具调用。" },
			{ value: "anthropic", label: "Anthropic", description: "使用 Anthropic 风格带内工具调用。" },
			{ value: "deepseek", label: "DeepSeek", description: "使用 DeepSeek 风格带内工具调用。" },
			{ value: "harmony", label: "Harmony", description: "使用 Harmony 风格带内工具调用。" },
			{ value: "qwen3", label: "Qwen3", description: "使用 Qwen3 自有方言。" },
			{ value: "gemini", label: "Gemini", description: "使用 Gemini 自有方言。" },
			{ value: "gemma", label: "Gemma", description: "使用 Gemma 自有方言。" },
			{ value: "minimax", label: "MiniMax", description: "使用 MiniMax 自有方言。" },
		],
	},
});

export const cfgSnapcompactShape = register({
	id: "snapcompact.shape",
	type: "enum",
	values: ["auto", ...SHAPE_VARIANT_NAMES] as const,
	default: "auto",
	ui: {
		tab: "context",
		group: "实验性",
		label: "Snapcompact 形状",
		description:
			"snapcompact 打印文本所用的帧形状(压缩归档和内联成像)。Auto 会挑选针对当前模型调优的形状。",
		options: [
			{
				value: "auto",
				label: "自动",
				description: "挑选针对当前模型调优的形状,否则回退到其提供商家族。",
			},
			{
				value: "8x8r-bw",
				label: "8x8 重复,黑色",
				description:
					"unscii 方形单元,黑色墨迹,每行打印两次,副本位于浅色高亮带上。",
			},
			{
				value: "8x8r-sent",
				label: "8x8 重复,句子色",
				description: "重复网格,墨迹在句子边界循环六种色调。",
			},
			{
				value: "8x8u-bw",
				label: "8x8,黑色",
				description: "普通 unscii 方形单元,单次打印行,黑色墨迹。",
			},
			{
				value: "8x8u-sent",
				label: "8x8,句子色",
				description: "普通 unscii 方形单元,句子色调墨迹。",
			},
			{
				value: "6x6u-bw",
				label: "6x6 密集,黑色",
				description: "unscii 压缩到 6x6——最密集的可读单元,帧数最少——黑色墨迹。",
			},
			{
				value: "6x6u-sent",
				label: "6x6 密集,句子色",
				description: "最密集的单元,句子色调墨迹。",
			},
			{
				value: "5x8-bw",
				label: "5x8 传统,黑色",
				description: "2576px 帧上的原始 X.org 5x8 字形,黑色墨迹。",
			},
			{
				value: "5x8-sent",
				label: "5x8 传统,句子色",
				description: "原始 snapcompact 形状(shape 表之前的会话以此渲染)。",
			},
			{
				value: "6x12-dim",
				label: "6x12,弱化虚词",
				description: "X.org 6x12 字形,黑色墨迹,功能词弱化为灰色。",
			},
			{
				value: "8x13-bw",
				label: "8x13,黑色",
				description: "X.org 8x13 字形,黑色墨迹。",
			},
			{
				value: "8on16-bw",
				label: "8x13 / 16px 间距,黑色",
				description: "8x16 单元上的 8x13 字形(额外行距),黑色墨迹。",
			},
			{
				value: "8on22-bw",
				label: "8x13 / 22px 行距,黑色",
				description:
					"8x22 单元上的 8x13 字形——额外的行间距,避免行拥挤。OpenAI/Google 的默认值。",
			},
			{
				value: "11on16-bw",
				label: "8x13 / 11px 字距,黑色",
				description:
					"11x16 单元上的 8x13 字形——额外的字间距,避免字符粘连。Anthropic 的默认值。",
			},
			{
				value: "silver16-bw",
				label: "Silver 16,CJK",
				description: "16px 网格上的内嵌 Silver TrueType 字体,用于 CJK 和其他非拉丁文本。",
			},
			{
				value: "doc-8on16-bw",
				label: "文档 8on16,黑色",
				description: "16px 间距上的两栏自动换行报纸式 8x13 字形,黑色墨迹。",
			},
			{
				value: "doc-8on16-sent",
				label: "文档 8on16,句子色",
				description: "双栏文档布局,句子色调墨迹。",
			},
			{
				value: "doc-8on16-sent-dim",
				label: "文档 8on16,句子色 + 弱化虚词",
				description: "双栏文档布局,句子色调墨迹,功能词弱化为灰色。",
			},
		],
	},
});

// Branch summaries
export const cfgBranchSummaryEnabled = register({
	id: "branchSummary.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "context",
		group: "通用",
		label: "分支摘要",
		description: "离开分支时提示生成摘要",
	},
});

export const cfgBranchSummaryReserveTokens = register({
	id: "branchSummary.reserveTokens",
	type: "number",
	default: 16384,
});
