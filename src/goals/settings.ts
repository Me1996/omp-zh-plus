import { register } from "../config/registry";

export const cfgGoalEnabled = register({
	id: "goal.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tasks",
		group: "模式",
		label: "目标模式",
		description: "启用按会话的目标模式和隐藏的 goal 工具",
	},
});

export const cfgGoalStatusInFooter = register({
	id: "goal.statusInFooter",
	type: "boolean",
	default: true,
	ui: {
		tab: "tasks",
		group: "模式",
		label: "页脚显示目标状态",
		description: "在状态栏的目标指示器旁显示 token 预算",
	},
});

const GOAL_CONTINUATION_MODES_DEFAULT: string[] = ["interactive"];

export const cfgGoalContinuationModes = register({
	id: "goal.continuationModes",
	type: "array",
	default: GOAL_CONTINUATION_MODES_DEFAULT,
	ui: {
		tab: "tasks",
		group: "模式",
		label: "目标延续模式",
		description: 'Run modes where active goals may auto-continue between turns ("interactive", "rpc")',
	},
});

export const cfgTitleRefreshOnReplan = register({
	id: "title.refreshOnReplan",
	type: "boolean",
	default: true,
	ui: {
		tab: "tasks",
		group: "模式",
		label: "重新规划时刷新标题",
		description: "在 todo init 重新规划后刷新生成的会话标题,除非标题由用户设置",
	},
});
