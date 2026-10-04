import { combine, register } from "../config/registry";
import { cfgAutolearnEnabled } from "../autolearn/settings";
import { cfgBashEnabled } from "../exec/settings";
import { cfgCompactionExperimentalContextManagement } from "../session/context-settings";
import { cfgEvalJs, cfgEvalPy } from "../eval/settings";
import { cfgIdaAvailable } from "../ida/install";
import { cfgLspEnabled } from "../lsp/settings";
import { cfgTaskMaxRecursionDepth } from "../task/settings";

const EMPTY_STRING_ARRAY: string[] = [];

export const cfgToolsArtifactSpillThreshold = register({
	id: "tools.artifactSpillThreshold",
	type: "number",
	default: 50,
	ui: {
		tab: "tools",
		group: "输出限制",
		label: "Artifact 溢出阈值 (KB)",
		description: "超过此大小的工具输出保存为 artifact;尾部保留在内联",
		options: [
			{ value: "1", label: "1 KB", description: "约 250 tokens" },
			{ value: "2.5", label: "2.5 KB", description: "约 625 tokens" },
			{ value: "5", label: "5 KB", description: "约 1.25K tokens" },
			{ value: "10", label: "10 KB", description: "约 2.5K tokens" },
			{ value: "20", label: "20 KB", description: "约 5K tokens" },
			{ value: "30", label: "30 KB", description: "约 7.5K tokens" },
			{ value: "50", label: "50 KB", description: "默认;约 12.5K tokens" },
			{ value: "75", label: "75 KB", description: "约 19K tokens" },
			{ value: "100", label: "100 KB", description: "约 25K tokens" },
			{ value: "200", label: "200 KB", description: "约 50K tokens" },
			{ value: "500", label: "500 KB", description: "约 125K tokens" },
			{ value: "1000", label: "1 MB", description: "约 250K tokens" },
		],
	},
});

export const cfgToolsArtifactTailBytes = register({
	id: "tools.artifactTailBytes",
	type: "number",
	default: 20,
	ui: {
		tab: "tools",
		group: "输出限制",
		label: "Artifact 尾部大小 (KB)",
		description: "输出溢出到 artifact 时保留在内联的尾部内容量",
		options: [
			{ value: "1", label: "1 KB", description: "约 250 tokens" },
			{ value: "2.5", label: "2.5 KB", description: "约 625 tokens" },
			{ value: "5", label: "5 KB", description: "约 1.25K tokens" },
			{ value: "10", label: "10 KB", description: "约 2.5K tokens" },
			{ value: "20", label: "20 KB", description: "默认;约 5K tokens" },
			{ value: "50", label: "50 KB", description: "约 12.5K tokens" },
			{ value: "100", label: "100 KB", description: "约 25K tokens" },
			{ value: "200", label: "200 KB", description: "约 50K tokens" },
		],
	},
});

export const cfgToolsArtifactHeadBytes = register({
	id: "tools.artifactHeadBytes",
	type: "number",
	default: 20,
	ui: {
		tab: "tools",
		group: "输出限制",
		label: "Artifact 头部大小 (KB)",
		description:
			"输出溢出到 artifact 时,与尾部一起保留在内联的头部内容量(中间省略)。0 表示禁用——只保留尾部。",
		options: [
			{ value: "0", label: "0 KB", description: "已禁用;仅截断尾部" },
			{ value: "1", label: "1 KB", description: "约 250 tokens" },
			{ value: "2.5", label: "2.5 KB", description: "约 625 tokens" },
			{ value: "5", label: "5 KB", description: "约 1.25K tokens" },
			{ value: "10", label: "10 KB", description: "约 2.5K tokens" },
			{ value: "20", label: "20 KB", description: "默认;约 5K tokens" },
			{ value: "50", label: "50 KB", description: "约 12.5K tokens" },
			{ value: "100", label: "100 KB", description: "约 25K tokens" },
			{ value: "200", label: "200 KB", description: "约 50K tokens" },
		],
	},
});

export const cfgToolsOutputMaxColumns = register({
	id: "tools.outputMaxColumns",
	type: "number",
	default: 768,
	ui: {
		tab: "tools",
		group: "输出限制",
		label: "输出列数上限",
		description:
			"流式工具输出(bash、python、js eval)和 `read` 的每行字节上限。超过此宽度的行以省略号截断;到下一个换行符为止的剩余字节被丢弃。0 表示禁用。",
		options: [
			{ value: "0", label: "关闭", description: "无每行上限" },
			{ value: "256", label: "256", description: "紧凑" },
			{ value: "512", label: "512" },
			{ value: "768", label: "768", description: "默认" },
			{ value: "1024", label: "1024" },
			{ value: "2048", label: "2048" },
			{ value: "4096", label: "4096", description: "宽松" },
		],
	},
});

export const cfgToolsArtifactTailLines = register({
	id: "tools.artifactTailLines",
	type: "number",
	default: 500,
	ui: {
		tab: "tools",
		group: "输出限制",
		label: "Artifact 尾部行数",
		description: "输出溢出到 artifact 时保留在内联的尾部内容最大行数",
		options: [
			{ value: "50", label: "50 行", description: "约 250 tokens" },
			{ value: "100", label: "100 行", description: "约 500 tokens" },
			{ value: "250", label: "250 行", description: "约 1.25K tokens" },
			{ value: "500", label: "500 行", description: "默认;约 2.5K tokens" },
			{ value: "1000", label: "1000 行", description: "约 5K tokens" },
			{ value: "2000", label: "2000 行", description: "约 10K tokens" },
			{ value: "5000", label: "5000 行", description: "约 25K tokens" },
		],
	},
});

export const cfgToolsArtifactMaxBytes = register({
	id: "tools.artifactMaxBytes",
	type: "number",
	default: 16,
	ui: {
		tab: "tools",
		group: "输出限制",
		label: "产物文件上限（MB）",
		description:
			"Maximum size of the artifact file saved for streaming tool output (bash, python, js eval). Larger output keeps its beginning (up to 3 MB) and its most recent remainder, with a truncation notice between them. 0 = unlimited.",
		options: [
			{ value: "0", label: "无限制", description: "保存完整输出" },
			{ value: "4", label: "4 MB" },
			{ value: "16", label: "16 MB", description: "默认" },
			{ value: "64", label: "64 MB" },
			{ value: "256", label: "256 MB" },
			{ value: "1024", label: "1 GB" },
		],
	},
});

export const cfgReadLineNumbers = register({
	id: "readLineNumbers",
	type: "boolean",
	default: false,
	ui: {
		tab: "files",
		group: "读取",
		label: "行号",
		description: "默认在 read 工具输出前加上行号",
	},
});

export const cfgReadDefaultLimit = register({
	id: "read.defaultLimit",
	type: "number",
	default: 300,
	ui: {
		tab: "files",
		group: "读取",
		label: "默认读取行数上限",
		description: "代理不带限制调用 read 时返回的默认行数",
		options: [
			{ value: "200", label: "200 行" },
			{ value: "300", label: "300 行" },
			{ value: "500", label: "500 行" },
			{ value: "1000", label: "1000 行" },
			{ value: "5000", label: "5000 行" },
		],
	},
});

export const cfgReadRenderMarkdown = register({
	id: "read.renderMarkdown",
	type: "boolean",
	default: false,
	ui: {
		tab: "files",
		group: "读取",
		label: "Markdown 预览",
		description: "将 Markdown 读取结果渲染为格式化终端 Markdown 预览,而不是原始源码",
	},
});

export const cfgReadSummarizeEnabled = register({
	id: "read.summarize.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "files",
		group: "读取摘要",
		label: "读取摘要",
		description: "当 read 未带显式选择器调用时,返回结构化代码摘要",
	},
});

export const cfgReadSummarizeProse = register({
	id: "read.summarize.prose",
	type: "boolean",
	default: false,
	ui: {
		tab: "files",
		group: "读取摘要",
		label: "正文摘要",
		description: "为 Markdown 和纯文本读取返回结构化摘要",
	},
});

export const cfgReadSummarizeMinBodyLines = register({
	id: "read.summarize.minBodyLines",
	type: "number",
	default: 4,
	ui: {
		tab: "files",
		group: "读取摘要",
		label: "读取摘要正文行数",
		description: "read 摘要折叠多行正文或字面量之前的最小长度",
	},
});

export const cfgReadSummarizeMinCommentLines = register({
	id: "read.summarize.minCommentLines",
	type: "number",
	default: 6,
	ui: {
		tab: "files",
		group: "读取摘要",
		label: "读取摘要注释行数",
		description: "read 摘要折叠多行块注释之前的最小长度",
	},
});

export const cfgReadSummarizeMinTotalLines = register({
	id: "read.summarize.minTotalLines",
	type: "number",
	default: 100,
	ui: {
		tab: "files",
		group: "读取摘要",
		label: "读取摘要最小文件长度",
		description: "总行数更少的文件按原样读取,而不是结构化摘要",
	},
});

export const cfgReadSummarizeUnfoldUntil = register({
	id: "read.summarize.unfoldUntil",
	type: "number",
	default: 50,
	ui: {
		tab: "files",
		group: "读取摘要",
		label: "读取摘要展开目标",
		description:
			"BFS 展开可省略片段,直到摘要至少达到这么多可见行。0 仅保留最外层的省略。",
	},
});

export const cfgReadSummarizeUnfoldLimit = register({
	id: "read.summarize.unfoldLimit",
	type: "number",
	default: 100,
	ui: {
		tab: "files",
		group: "读取摘要",
		label: "读取摘要展开上限",
		description:
			"BFS 展开时摘要大小的硬上限。展开后超过此值的片段会被跳过(该片段保持折叠),继续展开其余片段。",
	},
});

export const cfgReadToolResultPreview = register({
	id: "read.toolResultPreview",
	type: "boolean",
	default: false,
	ui: {
		tab: "files",
		group: "读取",
		label: "内联读取预览",
		description: "在记录中内联渲染 read 工具结果,而不是摘要行",
	},
});

// ────────────────────────────────────────────────────────────────────────
// Tools
// ────────────────────────────────────────────────────────────────────────

// Tool approval policies
export const cfgToolsApproval = register({
	id: "tools.approval",
	type: "record",
	default: {},
	ui: {
		tab: "interaction",
		group: "审批",
		label: "工具审批策略",
		description:
			"按工具设置的审批策略。设为 'allow' 自动批准,'prompt' 要求确认,或 'deny' 阻止。覆盖在每种审批模式下都生效。",
	},
});

// Default tool approval mode (interaction tab, but governs the tool wrapper).
//   "always-ask" — auto-approves read-tier tools only; prompts for write/exec.
//   "write"      — auto-approves read and write-tier tools; prompts for exec.
//   "yolo"       — auto-approves every tier.
export const cfgToolsApprovalMode = register({
	id: "tools.approvalMode",
	type: "enum",
	values: ["always-ask", "write", "yolo"] as const,
	default: "yolo",
	ui: {
		tab: "interaction",
		group: "审批",
		label: "工具审批",
		description:
			"工具调用的默认审批行为。'Always ask' 仅自动批准只读工具。'Write' 自动批准读取和工作区写入工具。'Yolo' 自动批准所有层级;用户策略仍可提示或阻止。",
		options: [
			{
				value: "always-ask",
				label: "总是询问",
				description: "自动批准只读工具;写入和执行工具需要确认。",
			},
			{
				value: "write",
				label: "写入",
				description:
					"自动批准只读和写入工具;bash、eval、browser、task 等执行工具需要确认。",
			},
			{
				value: "yolo",
				label: "Yolo",
				description:
					"自动批准读取、写入和执行工具。用户策略仍可要求确认或阻止调用。",
			},
		],
	},
});

// Todo tool
// Todo settings deliberately have no `protocolDefault`: protocol embedders need project-level opt-outs
// for reminder/prelude prompt injection.
export const cfgTodoEnabled = register({
	id: "todo.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "待办",
		description: "启用 todo 工具进行任务跟踪",
	},
});

export const cfgTodoReminders = register({
	id: "todo.reminders",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "待办",
		label: "待办提醒",
		description: "提醒代理在停止前完成待办",
	},
});

export const cfgTodoRemindersMax = register({
	id: "todo.remindersMax",
	type: "number",
	default: 3,
	ui: {
		tab: "tools",
		group: "待办",
		label: "待办提醒上限",
		description: "放弃前的最多待办提醒次数",
		options: [
			{ value: "1", label: "1 次提醒" },
			{ value: "2", label: "2 次提醒" },
			{ value: "3", label: "3 次提醒" },
			{ value: "5", label: "5 次提醒" },
		],
	},
});

export const cfgTodoEager = register({
	id: "todo.eager",
	type: "enum",
	values: ["default", "preferred", "总是"] as const,
	default: "default",
	ui: {
		tab: "tools",
		group: "待办",
		label: "自动创建待办",
		description: "第一条消息后自动创建待办列表的推动力度",
		options: [
			{ value: "default", label: "默认", description: "由模型决定;不自动创建待办列表" },
			{
				value: "preferred",
				label: "偏好",
				description: "在第一条消息时建议待办列表(提醒,而非强制)",
			},
			{ value: "总是", label: "总是", description: "在第一条消息时强制创建完整待办列表" },
		],
	},
});

export const cfgTasksTodoClearDelay = register({
	id: "tasks.todoClearDelay",
	type: "number",
	default: 60,
	ui: {
		tab: "tools",
		group: "待办",
		label: "待办自动清除延迟",
		description: "已完成或放弃的待办从待办组件移除前的延迟",
		options: [
			{ value: "0", label: "立即" },
			{ value: "60", label: "1 分钟", description: "默认" },
			{ value: "300", label: "5 分钟" },
			{ value: "900", label: "15 分钟" },
			{ value: "1800", label: "30 分钟" },
			{ value: "3600", label: "1 小时" },
			{ value: "-1", label: "从不" },
		],
	},
});

// Grep, glob, and AST tools
export const cfgGlobEnabled = register({
	id: "glob.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "Glob",
		description: "启用 glob 工具进行基于 glob 的文件查找",
	},
});

export const cfgGrepEnabled = register({
	id: "grep.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "Grep",
		description: "启用 grep 工具进行正则内容搜索",
	},
});

export const cfgGrepContextBefore = register({
	id: "grep.contextBefore",
	type: "number",
	default: 1,
	ui: {
		tab: "tools",
		group: "Grep 与浏览器",
		label: "Grep 前上下文行数",
		description: "每个 grep 匹配之前的上下文行数",
		options: [
			{ value: "0", label: "0 行" },
			{ value: "1", label: "1 行" },
			{ value: "2", label: "2 行" },
			{ value: "3", label: "3 行" },
			{ value: "5", label: "5 行" },
		],
	},
});

export const cfgGrepContextAfter = register({
	id: "grep.contextAfter",
	type: "number",
	default: 3,
	ui: {
		tab: "tools",
		group: "Grep 与浏览器",
		label: "Grep 后上下文行数",
		description: "每个 grep 匹配之后的上下文行数",
		options: [
			{ value: "0", label: "0 行" },
			{ value: "1", label: "1 行" },
			{ value: "2", label: "2 行" },
			{ value: "3", label: "3 行" },
			{ value: "5", label: "5 行" },
			{ value: "10", label: "10 行" },
		],
	},
});

export const cfgAstGrepEnabled = register({
	id: "astGrep.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "AST Grep",
		description: "启用 ast_grep 工具进行结构化 AST 搜索",
	},
});

export const cfgAstEditEnabled = register({
	id: "astEdit.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "AST Edit",
		description: "启用 ast_edit 工具进行结构化 AST 重写",
	},
});

export const cfgFindEnabled = register({
	id: "find.enabled",
	type: "enum",
	values: ["auto", "on", "off"] as const,
	default: "auto",
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "检索(语义 grep)",
		description:
			"Enable the find tool: natural-language search for files and line ranges, judged by the judge model role. Auto enables it only when the judge role resolves to a native TypeSafe jev model",
		options: [
			{
				value: "auto",
				label: "自动",
				description: "当 judge 角色解析为原生 TypeSafe jev 模型时启用",
			},
			{ value: "on", label: "开启", description: "始终启用，无论 judge 角色解析为何种模型" },
			{ value: "off", label: "关闭", description: "禁用 find 工具" },
		],
	},
});

// Optional tools

export const cfgDebugEnabled = register({
	id: "debug.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "Debug",
		description: "启用 debug 工具进行基于 DAP 的调试",
	},
});

export const cfgLaunchEnabled = register({
	id: "launch.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "服务",
		description: "启用命名 bash 服务与 proc:// 监督，用于共享的长期运行项目进程",
	},
});

export const cfgSpeechgenEnabled = register({
	id: "speechgen.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "语音生成",
		description: "启用 tts 工具进行设备端 (Kokoro) 或 xAI Grok Voice 语音文件合成",
	},
});

export const cfgGenerateImageEnabled = register({
	id: "generate_image.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "生成图片",
		description:
			"启用 generate_image 工具(文生图生成和编辑)。当 tools.xdev 开启时作为 xd:// 设备暴露。",
	},
});

export const cfgComputerEnabled = register({
	id: "computer.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "计算机",
		description: "启用可脚本化的桌面 eval 前奏（截图、输入、无障碍）",
	},
});

export const cfgRatchetEnabled = register({
	id: "ratchet.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "Ratchet",
		description: "启用 ratchet eval/hillclimb 前奏；/ratchet 可为当前会话打开它",
	},
});

export const cfgArchiveEnabled = register({
	id: "archive.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "Archive",
		description:
			"Enable the read-only archive eval prelude: prompt history, recent projects, past sessions and recaps",
	},
});

export const cfgComputerDisplay = register({
	id: "computer.display",
	type: "string",
	default: "all",
	ui: {
		tab: "tools",
		group: "计算机",
		label: "计算机显示器",
		description: "合并所有显示器,或选择原生显示器 id",
	},
});

export const cfgComputerMaxWidth = register({
	id: "computer.maxWidth",
	type: "number",
	default: 3840,
	ui: {
		tab: "tools",
		group: "计算机",
		label: "计算机截图宽度",
		description: "合并截图的最大宽度(像素)",
	},
});

export const cfgComputerMaxHeight = register({
	id: "computer.maxHeight",
	type: "number",
	default: 2400,
	ui: {
		tab: "tools",
		group: "计算机",
		label: "计算机截图高度",
		description: "合并截图的最大高度(像素)",
	},
});

export const cfgImagesQuestionTimeoutMs = register({
	id: "images.questionTimeoutMs",
	type: "number",
	default: 300_000,
	ui: {
		tab: "tools",
		group: "执行",
		label: "图片提问超时",
		description:
			"Per-request timeout for the vision-model call behind read's ?q= image questions, in milliseconds. A stalled provider fails fast with a timeout error instead of blocking until manual abort. Set to 0 to disable the timeout.",
		options: [
			{ value: "0", label: "已禁用" },
			{ value: "60000", label: "1 分钟" },
			{ value: "120000", label: "2 分钟" },
			{ value: "180000", label: "3 分钟" },
			{ value: "300000", label: "5 分钟" },
		],
	},
});

export const cfgCheckpointEnabled = register({
	id: "checkpoint.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "检查点/回退",
		description: "启用 checkpoint 和 rewind 工具进行上下文检查点",
	},
});

// Fetching and browser
export const cfgFetchEnabled = register({
	id: "fetch.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "读取 URL",
		description: "允许 read 工具抓取和处理 URL",
	},
});

export const cfgVaultEnabled = register({
	id: "vault.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "Obsidian Vault",
		description:
			"启用 vault:// 内部 URL,通过 Obsidian CLI 读取和编辑 Obsidian vault 内容。禁用后,vault:// 解析被拒绝,并且系统提示中省略 vault:// 条目。",
	},
});

export const cfgGithubEnabled = register({
	id: "github.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "GitHub CLI",
		description:
			"启用 github 工具(基于 op 的派发,用于仓库、issue、pull request、diff、搜索、checkout、push 和 Actions watch 工作流)",
	},
});

export const cfgGithubCacheEnabled = register({
	id: "github.cache.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "GitHub",
		label: "GitHub 视图缓存",
		description: "将渲染后的 issue/PR 视图输出缓存在 ~/.omp/cache/github-cache.db,使重复读取免费",
	},
});

export const cfgGithubCacheSoftTtlSec = register({
	id: "github.cache.softTtlSec",
	type: "number",
	default: 300,
	ui: {
		tab: "tools",
		group: "GitHub",
		label: "GitHub 缓存软 TTL",
		description: "在此窗口内,直接返回缓存的 issue/PR 视图行(秒;默认 5 分钟)",
	},
});

export const cfgGithubCacheHardTtlSec = register({
	id: "github.cache.hardTtlSec",
	type: "number",
	default: 604800,
	ui: {
		tab: "tools",
		group: "GitHub",
		label: "GitHub 缓存硬 TTL",
		description:
			"超过软 TTL 后,返回缓存行并在后台刷新;超过硬 TTL 后丢弃(秒;默认 7 天)",
	},
});

export const cfgWebSearchEnabled = register({
	id: "web_search.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "Web 搜索",
		description: "启用 web_search 工具获取实时网页结果",
	},
});

export const cfgSecurityEnabled = register({
	id: "security.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "安全",
		description:
			"启用 OMP 原生安全扫描规划、执行,以及只读的 security:// 资源命名空间",
	},
});

export const cfgAskEnabled = register({
	id: "ask.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "询问",
		description: "启用 ask 工具进行交互式用户提问",
	},
});

// Tool execution
export const cfgToolsIntentTracing = register({
	id: "tools.intentTracing",
	type: "boolean",
	default: true,
	env: "PI_INTENT_TRACING",
	ui: {
		tab: "tools",
		group: "执行",
		label: "意图跟踪",
		description: "要求代理在执行每个工具调用前描述其意图",
	},
});

export const cfgToolsAbortOnFabricatedResult = register({
	id: "tools.abortOnFabricatedResult",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "执行",
		label: "伪造工具结果时中止",
		description:
			"使用带内工具调用时,当模型在一轮中途开始幻觉工具结果时立即停止。禁用则让模型完成生成,然后丢弃伪造的延续内容。",
	},
});

export const cfgToolsSpeculativeExecutionEnabled = register({
	id: "tools.speculativeExecution.enabled",
	type: "boolean",
	default: false,
	ui: {
		tab: "tools",
		group: "执行",
		label: "实验性推测执行",
		description:
			"启用可安全丢弃的首批能力：通过直接 read 调用与嵌套 eval 执行经过校验的本地读取。网络请求、提供商补全与实时文件系统写入不在本基线范围内。",
	},
});

export const cfgToolsSpeculativeExecutionMaxInFlight = register({
	id: "tools.speculativeExecution.maxInFlight",
	type: "number",
	default: 2,
	ui: {
		tab: "tools",
		group: "执行",
		label: "推测执行并发数",
		description: "转入正常派发前允许运行的最大已校验本地读取数。",
		options: [
			{ value: "1", label: "1 个操作" },
			{ value: "2", label: "2 个操作" },
			{ value: "3", label: "3 个操作" },
			{ value: "4", label: "4 个操作" },
		],
	},
});

export const cfgToolsMaxTimeout = register({
	id: "tools.maxTimeout",
	type: "number",
	default: 0,
	ui: {
		tab: "tools",
		group: "执行",
		label: "最大工具超时",
		description: "代理可为任何工具设置的最大超时(秒)(0 = 无限制)",
		options: [
			{ value: "0", label: "无限制" },
			{ value: "30", label: "30 秒" },
			{ value: "60", label: "60 秒" },
			{ value: "120", label: "120 秒" },
			{ value: "300", label: "5 分钟" },
			{ value: "600", label: "10 分钟" },
		],
	},
});

// Async jobs. RPC hosts start from the neutral background-job defaults (`protocolDefault`), as do the
// bash/eval auto-background settings.
export const cfgAsyncEnabled = register({
	id: "async.enabled",
	protocolDefault: ["rpc"],
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "执行",
		label: "异步执行",
		description: "启用异步 bash 命令和后台任务执行",
	},
});

export const cfgAsyncMaxJobs = register({
	id: "async.maxJobs",
	protocolDefault: ["rpc"],
	type: "number",
	default: 100,
});

export const cfgToolsXdev = register({
	id: "tools.xdev",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "发现与 MCP",
		label: "xd:// 工具",
		description:
			"Mount rarely-used (discoverable) tools under xd:// device URLs driven via read/write instead of shipping their schemas on every request. Sessions whose explicit tool list grants read but omits write mount devices through a device-only write transport (filesystem writes stay rejected). Disable to expose every enabled tool top-level.",
	},
});

export const cfgToolsXdevDocs = register({
	id: "tools.xdevDocs",
	type: "enum",
	values: ["inline", "builtins", "catalog"] as const,
	default: "catalog",
	ui: {
		tab: "tools",
		group: "发现与 MCP",
		label: "xd:// 提示文档",
		description:
			"选择哪些已挂载设备的文档和 schema 内联到系统提示中。Built-ins 将核心工具保持内联,而 MCP 和扩展工具保持按需加载。",
		options: [
			{ value: "inline", label: "所有设备", description: "为每个已挂载设备内联文档和 schema。" },
			{
				value: "builtins",
				label: "仅内置",
				description: "内联内置文档;按需获取 MCP 和扩展文档。",
			},
			{ value: "catalog", label: "仅目录", description: "列出所有设备;按需获取所有文档。" },
		],
	},
});

export const cfgToolsXdevInlineDevices = register({
	id: "tools.xdevInlineDevices",
	type: "array",
	default: EMPTY_STRING_ARRAY,
	ui: {
		tab: "tools",
		group: "发现与 MCP",
		label: "xd:// 内联设备",
		description:
			"当 xd:// 提示文档为仅内置时,内联名称匹配这些 glob 模式的动态设备(例如 mcp__context_mode_*)。仅目录模式忽略此设置。",
	},
});

export const cfgDevAutoqa = register({
	id: "dev.autoqa",
	type: "boolean",
	default: true,
	env: "PI_AUTO_QA",
	ui: {
		tab: "tools",
		group: "开发者",
		label: "自动 QA",
		description:
			"自动化工具问题上报 (xd://report_issue)。默认开启;首次上报会征求同意,拒绝后会禁用上报,直到显式重新启用",
	},
});

export const cfgDevAutoqaPushEndpoint = register({
	id: "dev.autoqaPush.endpoint",
	type: "string",
	default: "https://qa.omp.sh/v1/grievances" as const,
	ui: {
		tab: "tools",
		group: "开发者",
		label: "自动 QA 推送端点",
		description: "接收自动 QA JSON 上报的完整 URL(默认 https://qa.omp.sh/v1/grievances)",
	},
});

export const cfgDevAutoqaPushToken = register({
	id: "dev.autoqaPush.token",
	type: "string",
	default: undefined,
	credential: true,
});

/**
 * User decision on sharing automatic `report_tool_issue` grievances.
 *
 *   - `"unset"`  — never asked; the first `report_tool_issue` invocation
 *                  pops a consent dialog and persists the answer here.
 *   - `"granted"` — record and (when push is configured) ship grievances.
 *   - `"denied"`  — silently no-op every `report_tool_issue` call.
 *
 * Owned by `packages/coding-agent/src/tools/report-tool-issue.ts` via the
 * process-global consent handler registered by `InteractiveMode`.
 *
 * @default "unset"
 */
export const cfgDevAutoqaConsent = register({
	id: "dev.autoqaConsent",
	type: "enum",
	values: ["unset", "granted", "denied"] as const,
	default: "unset" as const,
});

/** Settings read by `resolveBuiltinToolPlan` (`tools/index.ts`); a live session reconciles its built-ins when any changes. */
export const cfgBuiltinToolGates = combine({
	ask: cfgAskEnabled,
	astEdit: cfgAstEditEnabled,
	astGrep: cfgAstGrepEnabled,
	async: cfgAsyncEnabled,
	autolearn: cfgAutolearnEnabled,
	bash: cfgBashEnabled,
	checkpoint: cfgCheckpointEnabled,
	contextManagement: cfgCompactionExperimentalContextManagement,
	debug: cfgDebugEnabled,
	evalJs: cfgEvalJs,
	evalPy: cfgEvalPy,
	find: cfgFindEnabled,
	github: cfgGithubEnabled,
	glob: cfgGlobEnabled,
	grep: cfgGrepEnabled,
	ida: cfgIdaAvailable,
	launch: cfgLaunchEnabled,
	lsp: cfgLspEnabled,
	security: cfgSecurityEnabled,
	taskMaxRecursionDepth: cfgTaskMaxRecursionDepth,
	todo: cfgTodoEnabled,
	webSearch: cfgWebSearchEnabled,
});

/** Settings that add or remove the built-in tools they gate (`AgentSession.reconcileBuiltinTools`). */
export const cfgSessionToolGates = combine({
	builtins: cfgBuiltinToolGates,
	generateImage: cfgGenerateImageEnabled,
	speechgen: cfgSpeechgenEnabled,
	xdev: cfgToolsXdev,
});
