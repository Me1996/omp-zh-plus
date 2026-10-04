/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import { ADVISOR_REVIEW_MODES, ADVISOR_SYNC_BACKLOG_MODES } from "@oh-my-pi/pi-tui-zh/overlays/advisor-config";
import { register } from "../config/registry";
import { ADVISOR_DEFAULT_BUDGET_PER_UPDATE } from "./emission-guard";

// Advisor is interactive-session assistance: protocol hosts opt in explicitly instead of inheriting the
// user's local preference, and get the default tuning rather than the user's local tuning.
export const cfgAdvisorEnabled = register({
	id: "advisor.enabled",
	protocolDefault: ["rpc", "acp"],
	type: "boolean",
	default: false,
	ui: {
		tab: "model",
		group: "顾问",
		label: "启用顾问",
		description:
			"配对第二个模型(分配给 'advisor' 角色),被动审查每一轮并在其中注入笔记。",
	},
});

export const cfgAdvisorSyncBacklog = register({
	id: "advisor.syncBacklog",
	protocolDefault: ["rpc", "acp"],
	type: "enum",
	values: ADVISOR_SYNC_BACKLOG_MODES,
	default: "off",
	ui: {
		tab: "model",
		group: "顾问",
		label: "顾问同步积压",
		description:
			"Pause main agent until advisor backlog falls below threshold. Numeric values cap wait at 30 seconds; strict waits for all scheduled reviews without a wall-clock cap. Off disables catch-up delays. Abort, failure, and disposal release waits.",
		condition: "advisorEnabled",
	},
});

export const cfgAdvisorImmuneTurns = register({
	id: "advisor.immuneTurns",
	protocolDefault: ["rpc", "acp"],
	type: "number",
	default: 3,
	ui: {
		tab: "model",
		group: "顾问",
		label: "顾问免打扰轮数",
		description:
			"在顾问的关切或阻塞中断之后,接下来的这么多主轮次内,后续关切/阻塞将以非中断方式传递。",
		options: [
			{ value: "0", label: "0 steps", description: "允许每个关切/阻塞中断。" },
			{ value: "1", label: "1 step" },
			{ value: "2", label: "2 steps" },
			{ value: "3", label: "3 steps", description: "默认。" },
			{ value: "4", label: "4 steps" },
			{ value: "5", label: "5 steps" },
		],
		condition: "advisorEnabled",
	},
});

export const cfgAdvisorReviewMode = register({
	id: "advisor.reviewMode",
	protocolDefault: ["rpc", "acp"],
	type: "enum",
	values: ADVISOR_REVIEW_MODES,
	default: "turn",
	ui: {
		tab: "model",
		group: "顾问",
		label: "顾问评审模式",
		description:
			"无 WATCHDOG.yml 名单时的默认顾问节奏。turn 评审每个主轮次;agent-end 只评审最终让出。",
		options: [
			{ value: "turn", label: "每一轮", description: "评审每次主更新(工具调用轮)。" },
			{ value: "agent-end", label: "代理结束时", description: "只在最终让出时评审(每次运行一次)。" },
		],
		condition: "advisorEnabled",
	},
});

export const cfgAdvisorReviewInterval = register({
	id: "advisor.reviewInterval",
	protocolDefault: ["rpc", "acp"],
	type: "number",
	default: 1,
	ui: {
		tab: "model",
		group: "顾问",
		label: "顾问评审间隔",
		description:
			"无 WATCHDOG.yml 名单时的默认顾问节奏:每 N 次合格主更新评审一次。1 = 每次更新。跳过的更新随下一次计划评审一起发送。",
		options: [
			{ value: "1", label: "每次合格更新", description: "默认。" },
			{ value: "2", label: "每 2 次" },
			{ value: "3", label: "每 3 次" },
			{ value: "5", label: "每 5 次" },
			{ value: "10", label: "每 10 次" },
		],
		condition: "advisorEnabled",
	},
});

export const cfgAdvisorMaxNotesPerUpdate = register({
	id: "advisor.maxNotesPerUpdate",
	protocolDefault: ["rpc", "acp"],
	type: "number",
	default: ADVISOR_DEFAULT_BUDGET_PER_UPDATE,
	ui: {
		tab: "model",
		group: "顾问",
		label: "顾问每次更新最多提示条数",
		description:
			"每次顾问提示更新可接受的非阻塞性建议条数上限（1–32；界面提供 1–5 快捷选项）。阻塞性问题不受此限制。",
		options: [
			{ value: "1", label: "1 条", description: "防刷屏（严格）。" },
			{ value: "2", label: "2 条" },
			{ value: "3", label: "3 条" },
			{ value: "4", label: "4 条", description: "前沿推理模型。默认。" },
			{ value: "5", label: "5 条" },
		],
		condition: "advisorEnabled",
	},
});

export const cfgAdvisorEvictStaleResults = register({
	id: "advisor.evictStaleResults",
	protocolDefault: ["rpc", "acp"],
	type: "boolean",
	default: true,
	ui: {
		tab: "model",
		group: "顾问",
		label: "Advisor Evict Stale Results",
		description:
			"Before each review, replace the advisor's read/grep/glob output from older reviews with a short placeholder. The latest review is kept.",
		condition: "advisorEnabled",
	},
});
