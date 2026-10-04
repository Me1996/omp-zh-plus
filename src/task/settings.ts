/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import {
	type AgentCompactionThresholdOverride,
	validateAgentCompactionThresholdOverrides,
} from "../config/compaction-threshold";
import { effect, register } from "../config/registry";
import { type ServiceTierInheritSettingValue, validateAgentServiceTierOverrides } from "../config/service-tier";
import { THINKING_EFFORTS } from "@oh-my-pi/pi-catalog/effort";
import { logger, setWorktreesDir } from "@oh-my-pi/pi-utils";
import { setFeedModelBadgeEnabled } from "@oh-my-pi/pi-tui-zh/render/render-utils";
import { getThinkingLevelMetadata } from "@oh-my-pi/pi-tui-zh/thinking";

const EMPTY_AGENT_SERVICE_TIER_OVERRIDES: Record<string, ServiceTierInheritSettingValue> = {};
const EMPTY_AGENT_COMPACTION_THRESHOLD_OVERRIDES: Record<string, AgentCompactionThresholdOverride> = {};

const DEFAULT_AGENT_MODEL_OVERRIDES: Record<string, string | string[]> = {};

// Delegation. Task and isolation settings declare `protocolDefault`: protocol hosts get neutral
// defaults instead of the local user's interactive preferences.
export const cfgTaskIsolationEnabled = register({
	id: "task.isolation.enabled",
	protocolDefault: ["rpc", "acp"],
	type: "boolean",
	default: false,
	ui: {
		tab: "tasks",
		group: "隔离",
		label: "隔离子代理",
		description: "在检出副本中运行子代理，事后整合其更改",
	},
});

export const cfgIsolationBackend = register({
	id: "isolation.backend",
	protocolDefault: ["rpc", "acp"],
	type: "enum",
	values: ["auto", "apfs", "btrfs", "zfs", "reflink", "overlayfs", "projfs", "block-clone", "rcopy"] as const,
	default: "auto",
	ui: {
		tab: "tasks",
		group: "隔离",
		label: "隔离后端",
		description: "用于子代理隔离与 worktree 克隆的后端",
		options: [
			{ value: "auto", label: "自动", description: "让 PAL 选择最佳可用后端" },
			{ value: "apfs", label: "APFS", description: "macOS clonefile reflink（APFS）" },
			{ value: "btrfs", label: "btrfs", description: "btrfs 子卷快照" },
			{ value: "zfs", label: "ZFS", description: "ZFS 快照 + 克隆" },
			{ value: "reflink", label: "Reflink", description: "Linux FICLONE 按文件 reflink" },
			{
				value: "overlayfs",
				label: "Overlayfs",
				description: "Linux 内核 overlay(或 fuse-overlayfs 回退)",
			},
			{ value: "projfs", label: "ProjFS", description: "Windows 投影文件系统（ProjFS）" },
			{
				value: "block-clone",
				label: "块克隆",
				description: "Windows FSCTL_DUPLICATE_EXTENTS_TO_FILE (NTFS/ReFS)",
			},
			{
				value: "rcopy",
				label: "递归复制",
				description: "可用时用 git worktree,否则递归复制",
			},
		],
	},
});

export const cfgWorktreeClone = register({
	id: "worktree.clone",
	protocolDefault: ["rpc", "acp"],
	type: "boolean",
	default: true,
	ui: {
		tab: "tasks",
		group: "隔离",
		label: "把检出克隆进 worktree",
		description:
			"New worktrees from `github pr_checkout` and `git worktree add` in bash start as a copy-on-write clone of the current checkout so ignored build artifacts (node_modules, target) carry over; falls back to a plain checkout when the filesystem cannot clone",
	},
});

export const cfgWorktreeCleanSource = register({
	id: "worktree.cleanSource",
	protocolDefault: ["rpc", "acp"],
	type: "boolean",
	default: false,
	ui: {
		tab: "tasks",
		group: "隔离",
		label: "/wt 时清理源检出",
		description:
			"When creating a worktree with `/wt`, reset tracked changes and remove untracked files from the original checkout after carrying them over",
	},
});

export const cfgTaskIsolationApply = register({
	id: "task.isolation.apply",
	protocolDefault: ["rpc", "acp"],
	type: "boolean",
	default: true,
	ui: {
		tab: "tasks",
		group: "隔离",
		label: "应用隔离更改",
		description:
			"自动将成功的隔离任务更改应用到父 checkout;禁用则保留 patch 或 branch 产物",
	},
});

export const cfgTaskIsolationMerge = register({
	id: "task.isolation.merge",
	protocolDefault: ["rpc", "acp"],
	type: "enum",
	values: ["patch", "branch"] as const,
	default: "patch",
	ui: {
		tab: "tasks",
		group: "隔离",
		label: "隔离合并策略",
		description: "隔离任务更改如何整合(patch 应用或 branch 合并)",
		options: [
			{ value: "patch", label: "补丁", description: "合并 diffs 并 git apply" },
			{ value: "branch", label: "分支", description: "每个任务一个提交,以 --no-ff 合并" },
		],
	},
});

export const cfgTaskIsolationCommits = register({
	id: "task.isolation.commits",
	protocolDefault: ["rpc", "acp"],
	type: "enum",
	values: ["generic", "ai"] as const,
	default: "generic",
	ui: {
		tab: "tasks",
		group: "隔离",
		label: "隔离提交风格",
		description: "嵌套仓库更改的提交消息风格(generic 或 AI 生成)",
		options: [
			{ value: "generic", label: "通用", description: "静态提交消息" },
			{ value: "ai", label: "AI", description: "根据 diff 由 AI 生成的提交消息" },
		],
	},
});

export const cfgWorktreeBase = register({
	id: "worktree.base",
	type: "string",
	default: undefined,
	ui: {
		tab: "tasks",
		group: "隔离",
		label: "Worktree 基础目录",
		description:
			"代理管理工作树的基目录——task 隔离副本、`github` PR checkout 和 `omp worktree` 清理都在这里。未设置时使用 ~/.omp/wt。必须是绝对路径或以 ~ 开头的路径;相对路径被忽略。OMP_WORKTREE_DIR 环境变量可覆盖此项。",
	},
});
effect(cfgWorktreeBase, value => {
	const dir = value?.trim() ? value : undefined;
	// Always applied, so an unset/empty value clears a previous override. setWorktreesDir expands `~`,
	// rejects relative paths, and returns the applied absolute path (undefined when cleared/rejected).
	if (!setWorktreesDir(dir) && dir) {
		logger.warn("Settings: worktree.base must be an absolute or ~-relative path; ignoring", { value: dir });
	}
});

export const cfgTaskEager = register({
	id: "task.eager",
	protocolDefault: ["rpc", "acp"],
	type: "enum",
	values: ["default", "preferred", "总是"] as const,
	default: "default",
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "偏好任务委派",
		description: "推动将工作委派给子代理的力度",
		options: [
			{
				value: "default",
				label: "默认",
				description: "使用所选模型的策略；部分模型需要显式委派请求",
			},
			{ value: "preferred", label: "偏好", description: "向系统提示添加委派指导" },
			{ value: "总是", label: "总是", description: "提示指导外加第一轮委派提醒" },
		],
	},
});

export const cfgTaskBatch = register({
	id: "task.batch",
	protocolDefault: ["rpc", "acp"],
	type: "boolean",
	default: true,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "批量任务调用",
		description:
			"将 task 工具切换为批量形态:一次调用携带 { context, tasks[] }——每个条目一个子代理,可选的逐条目 agent(默认为会话派生策略 agent)、逐条目隔离,以及预置到每个任务前的必需共享 context。当 async.enabled=true 时,每次派生作为独立的后台代理运行,遵循常规的 idle/parked 生命周期;否则调用会阻塞以等待合并结果。禁用则恢复扁平的单个派生 schema。",
	},
});

export const cfgTaskSpeculativeLaunch = register({
	id: "task.speculativeLaunch",
	type: "boolean",
	default: true,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "推测性任务启动",
		description:
			"Start each batch subagent as soon as its tasks[] item finishes streaming instead of waiting for the whole task call. Launched agents are aborted if the finished call fails validation, is blocked, or its arguments change. Requires auto-allowed task approval and no extension tool lifecycle handlers.",
	},
});

export const cfgTaskEnableEffort = register({
	id: "task.enableEffort",
	type: "boolean",
	default: false,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "按任务思考力度",
		description:
			"在 task 派生时暴露可选的 effort 参数,允许调用方覆盖每个子代理的思考级别",
	},
});

export const cfgTaskMaxConcurrency = register({
	id: "task.maxConcurrency",
	protocolDefault: ["rpc", "acp"],
	type: "number",
	default: 32,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "最大并发任务数",
		description: "并发运行的子代理最大数量",
		options: [
			{ value: "0", label: "无限制" },
			{ value: "1", label: "1 个任务" },
			{ value: "2", label: "2 个任务" },
			{ value: "4", label: "4 个任务" },
			{ value: "8", label: "8 个任务" },
			{ value: "16", label: "16 个任务" },
			{ value: "32", label: "32 个任务" },
			{ value: "64", label: "64 个任务" },
		],
	},
});

export const cfgTaskEnableLsp = register({
	id: "task.enableLsp",
	type: "boolean",
	default: false,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "子代理中的 LSP",
		description:
			"允许通过 task 工具派生的子代理使用 lsp 工具。默认关闭以保持子代理成本低廉;当 LSP 感知的委派值得额外 tokens 时启用。",
	},
});

export const cfgTaskMaxRecursionDepth = register({
	id: "task.maxRecursionDepth",
	protocolDefault: ["rpc", "acp"],
	type: "number",
	default: 2,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "最大任务递归深度",
		description: "子代理可以派生自己的子代理的嵌套深度",
		options: [
			{ value: "-1", label: "无限制" },
			{ value: "0", label: "无" },
			{ value: "1", label: "一层" },
			{ value: "2", label: "两层" },
			{ value: "3", label: "三层" },
		],
	},
});

export const cfgTaskMaxRuntimeMs = register({
	id: "task.maxRuntimeMs",
	type: "number",
	default: 0,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "最大子代理运行时间",
		description:
			"每个子代理的硬墙钟限制(毫秒)。0 禁用。针对逃脱推理层看门狗的提供商侧流挂起提供纵深防御;触发带有 'timed out' 原因的正常子代理中止。",
		options: [
			{ value: "0", label: "无限制", description: "默认" },
			{ value: "300000", label: "5 分钟" },
			{ value: "900000", label: "15 分钟" },
			{ value: "1800000", label: "30 分钟" },
			{ value: "3600000", label: "1 小时" },
		],
	},
});

export const cfgTaskCompletionProbe = register({
	id: "task.completionProbe",
	type: "boolean",
	default: true,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "Subagent 完成探测",
		description:
			"Ask a working subagent, through a cached side request like /btw, to estimate how complete its task is: after 2, 5, 10 and 30 more minutes, then hourly. The estimate shows next to the subagent in wait and task views. Only subagents spawned by the main agent of an interactive session are asked; print, RPC, ACP and SDK runs never probe.",
	},
});

export const cfgTaskAgentIdleTtlMs = register({
	id: "task.agentIdleTtlMs",
	type: "number",
	default: 420_000,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "代理空闲 TTL",
		description:
			"空闲子代理在被停驻到磁盘前保持内存存活的时间(毫秒)。停驻的代理在收到消息或恢复时自动唤醒。0 让空闲代理保持存活直到退出。",
	},
});

export const cfgTaskSoftRequestBudget = register({
	id: "task.softRequestBudget",
	type: "number",
	default: 200,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "子代理软请求预算",
		description:
			"每个子代理的软请求预算(每次运行的 assistant 请求数)。超过后注入收尾引导通知(见 task.softRequestBudgetNotice);达到预算的 1.5 倍时强制停止运行,代理必须交出部分发现。0 禁用该防护。内置的 scout/sonic 代理以较低的内置预算为上限,因此低于该上限的值仍然适用于它们。",
		options: [
			{ value: "0", label: "已禁用" },
			{ value: "90", label: "90 次请求" },
			{ value: "150", label: "150 次请求" },
			{ value: "200", label: "200 次请求", description: "默认" },
		],
	},
});

export const cfgTaskSoftRequestBudgetNotice = register({
	id: "task.softRequestBudgetNotice",
	type: "boolean",
	default: true,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "软请求预算通知",
		description:
			"当子代理超过其软请求预算时注入一条引导通知,要求它在 1.5 倍强制让出停止之前收尾。",
	},
});

export const cfgTaskMaxEffort = register({
	id: "task.maxEffort",
	type: "enum",
	values: THINKING_EFFORTS,
	default: "max",
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "每次派生的最大思考力度",
		description:
			"task 工具每次派生 effort 提示所允许的最大推理力度。较低的值可防止调用方将子代理提升到该上限之上;默认保留模型的全部范围。",
		options: THINKING_EFFORTS.map(getThinkingLevelMetadata),
	},
});

export const cfgTaskDisabledAgents = register({
	id: "task.disabledAgents",
	protocolDefault: ["rpc", "acp"],
	type: "array",
	default: [] as string[],
});

export const cfgTaskAgentModelOverrides = register({
	id: "task.agentModelOverrides",
	protocolDefault: ["rpc", "acp"],
	type: "record",
	default: DEFAULT_AGENT_MODEL_OVERRIDES,
});

export const cfgTaskAgentServiceTierOverrides = register({
	id: "task.agentServiceTierOverrides",
	protocolDefault: ["rpc", "acp"],
	type: "record",
	default: EMPTY_AGENT_SERVICE_TIER_OVERRIDES,
	validate: validateAgentServiceTierOverrides,
});

export const cfgTaskAgentCompactionThresholdOverrides = register({
	id: "task.agentCompactionThresholdOverrides",
	protocolDefault: ["rpc", "acp"],
	type: "record",
	default: EMPTY_AGENT_COMPACTION_THRESHOLD_OVERRIDES,
	validate: validateAgentCompactionThresholdOverrides,
});

export const cfgTaskAgentPrewalk = register({
	id: "task.agentPrewalk",
	protocolDefault: ["rpc", "acp"],
	type: "record",
	default: {} as Record<string, string>,
});

export const cfgTaskAgentAdvisor = register({
	id: "task.agentAdvisor",
	protocolDefault: ["rpc", "acp"],
	type: "record",
	default: {} as Record<string, string>,
});

export const cfgTaskPrewalk = register({
	id: "task.prewalk",
	type: "boolean",
	default: false,
	ui: {
		tab: "tasks",
		group: "子代理",
		label: "通用任务 Prewalk",
		description:
			"Arm prewalk for the bundled generic `task` subagent: it starts on its resolved model, plans and begins the implementation, then hands off to the 'smol' role at its first edit/write. Per-agent overrides (task.agentPrewalk, configured from the /agents hub) and user agent `prewalk` frontmatter apply regardless of this toggle.",
	},
});

export const cfgTaskShowResolvedModelBadge = register({
	id: "task.showResolvedModelBadge",
	type: "boolean",
	default: false,
	ui: {
		tab: "appearance",
		group: "显示",
		label: "显示解析后的模型徽章",
		description: "在 task 组件状态栏中显示每个子代理实际使用的模型 ID",
	},
});
effect(cfgTaskShowResolvedModelBadge, setFeedModelBadgeEnabled);
