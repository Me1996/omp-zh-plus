import { Args, type CommandMetadata, Flags } from "@oh-my-pi/pi-utils/cli";
import { APP_NAME } from "@oh-my-pi/pi-utils/dirs";
import { formatKeyHint } from "@oh-my-pi/pi-tui-zh/key-hint-format";
import { CLI_THINKING_LEVELS } from "@oh-my-pi/pi-tui-zh/thinking";
import { SERVICE_TIER_OPENAI_VALUES } from "../config/service-tier";

export const launchHelp = {
	description: "AI 编程助手",
	hidden: true,
	args: {
		messages: Args.string({
			description: "要发送的消息(@ 前缀引用文件)",
			required: false,
			multiple: true,
		}),
	},
	flags: {
		model: Flags.string({
			description: '使用的模型(模糊匹配:"opus"、"gpt-5.2" 或 "openai/gpt-5.2")',
		}),
		smol: Flags.string({ description: "轻量任务的快速小模型(或 PI_SMOL_MODEL 环境变量)" }),
		slow: Flags.string({ description: "深度分析用的慢速推理模型(或 PI_SLOW_MODEL 环境变量)" }),
		plan: Flags.string({ description: "架构规划用的规划模型(或 PI_PLAN_MODEL 环境变量)" }),
		goal: Flags.string({
			description:
				"以目标模式全新启动(仅交互式;绕过 autoResume;无位置提示、启动计划模式或显式恢复)",
		}),
		prewalk: Flags.boolean({
			description:
				"计划待办列表生成后,在首次编辑/写入时从当前模型切换到快速/廉价模型(默认关闭;参见 prewalk.enabled)",
		}),
		"no-prewalk": Flags.boolean({ description: "即使设置了 prewalk.enabled 也禁用 prewalk" }),
		"prewalk-into": Flags.string({ description: 'prewalk 的目标模型(默认 "smol" 角色)' }),
		"plan-yolo": Flags.boolean({
			description:
				"启动时强制只读规划模式,模型首次 resolve 调用时自动批准计划,再切换到 --plan-yolo-into 执行",
		}),
		"plan-yolo-into": Flags.string({ description: 'plan-yolo 执行的目标模型(默认 "smol" 角色)' }),
		provider: Flags.string({ description: "使用的提供商(旧参数;优先用 --model)" }),
		"api-key": Flags.string({ description: "API 密钥(默认取环境变量)" }),
		"system-prompt": Flags.string({ description: "系统提示词(默认:编程助手提示词)" }),
		"system-prompt-template": Flags.string({
			description: "Handlebars 系统提示模板(与 --system-prompt 互斥)",
		}),
		"append-system-prompt": Flags.string({ description: "在系统提示词后追加文本或文件内容" }),
		"allow-home": Flags.boolean({ description: "允许在 ~ 目录启动而不自动切换到临时目录" }),
		profile: Flags.string({ description: "使用独立 profile 隔离认证、会话、设置与缓存" }),
		alias: Flags.string({ description: "为所选 profile 创建 shell 快捷命令后退出" }),
		cwd: Flags.string({ description: "启动目录(覆盖默认工作目录)" }),
		mode: Flags.string({
			description: "输出模式:text(默认)、json、rpc 或 rpc-ui",
			options: ["text", "json", "rpc", "acp", "rpc-ui"],
		}),
		config: Flags.string({
			description: "为本次运行加载额外的 config.yml 风格覆盖配置(可重复)",
			multiple: true,
		}),
		"add-dir": Flags.string({
			description: "额外添加工作区目录(可重复)",
			multiple: true,
		}),
		print: Flags.boolean({ char: "p", description: "非交互模式:处理完提示后退出" }),
		continue: Flags.boolean({ char: "c", description: "继续上一个会话" }),
		resume: Flags.string({ char: "r", description: "恢复会话(按 ID 前缀、路径;省略时弹出选择器)" }),
		"from-claude": Flags.boolean({ description: "将 Claude Code 会话导入 OMP" }),
		"from-codex": Flags.boolean({ description: "将 Codex 会话导入 OMP" }),
		"session-dir": Flags.string({ description: "会话存储与查找目录" }),
		"no-session": Flags.boolean({ description: "不保存会话(临时)" }),
		models: Flags.string({ description: `用于 ${formatKeyHint("ctrl+p")} 循环的逗号分隔模型模式` }),
		"no-tools": Flags.boolean({ description: "禁用所有内置工具" }),
		"no-lsp": Flags.boolean({ description: "禁用 LSP 工具、格式化和诊断" }),
		"no-pty": Flags.boolean({ description: "禁用基于 PTY 的交互式 bash 执行" }),
		tools: Flags.string({ description: "要启用的工具列表(逗号分隔,默认全部)" }),
		thinking: Flags.string({
			description: `设置思考级别: ${CLI_THINKING_LEVELS.join(", ")}`,
			options: [...CLI_THINKING_LEVELS],
		}),
		"service-tier": Flags.string({
			description: "本次会话的 OpenAI 服务层级(none 表示省略 service_tier)",
			options: [...SERVICE_TIER_OPENAI_VALUES],
		}),
		"hide-thinking": Flags.boolean({
			description: "在 TUI 输出中隐藏思考块(仅影响显示,不关闭模型思考)",
		}),
		advisor: Flags.boolean({
			description: "启用顾问运行时(被动审查每一轮并注入建议)",
		}),
		"external-thinking": Flags.boolean({
			description:
				"Use a private scratchpad while disabling supported GPT, Claude, and Gemini reasoning (at your own risk: providers have flagged this request shape as abuse)",
		}),
		hook: Flags.string({ description: "加载 hook/扩展文件(可多次使用)", multiple: true }),
		extension: Flags.string({
			char: "e",
			description: "加载扩展文件(可多次使用)",
			multiple: true,
		}),
		"no-extensions": Flags.boolean({
			description: "禁用扩展自动发现(显式 -e 路径仍生效)",
		}),
		"no-skills": Flags.boolean({ description: "禁用技能发现与加载" }),
		skills: Flags.string({ description: "过滤技能的 glob 模式列表(逗号分隔,如 git-*,docker)" }),
		"no-rules": Flags.boolean({ description: "禁用规则发现与加载" }),
		export: Flags.string({ description: "将会话文件导出为 HTML 后退出" }),
		"no-title": Flags.boolean({ description: "禁用标题自动生成" }),
		"no-ui": Flags.boolean({
			description: "配合 --mode rpc 或 rpc-ui 使用：以 headless 方式运行扩展（rpc-ui 工具 UI 保持启用）",
		}),
		"print-thoughts": Flags.boolean({ description: "在打印模式的文本输出中包含思考块" }),
		"max-time": Flags.string({ description: "在此时长后停止会话(如 600、10m、1h)" }),
		"auto-approve": Flags.boolean({
			aliases: ["yolo"],
			description: "自动批准所有工具调用(跳过审批提示)",
		}),
		"approval-mode": Flags.string({
			options: ["always-ask", "write", "yolo"],
			description: "覆盖本次会话的 tools.approvalMode(always-ask|write|yolo)",
		}),
	},
	examples: [
		`# 交互模式\n  ${APP_NAME}`,
		`# 交互模式 + 初始提示\n  ${APP_NAME} "列出 src/ 下所有 .ts 文件"`,
		`# Start working on a goal immediately\n  ${APP_NAME} --goal "Investigate the importer"`,
		`# 在初始消息中包含文件\n  ${APP_NAME} @prompt.md @image.png "天空是什么颜色?"`,
		`# 非交互模式(处理并退出)\n  ${APP_NAME} -p "列出 src/ 下所有 .ts 文件"`,
		`# 继续上一个会话\n  ${APP_NAME} --continue "我们刚才聊到哪了?"`,
		`# 为工作 profile 创建 shell 快捷命令\n  ${APP_NAME} --profile work --alias omp-work`,
		`# 使用不同模型(模糊匹配)\n  ${APP_NAME} --model opus "帮我重构这段代码"`,
		`# 限制模型切换范围\n  ${APP_NAME} --models claude-sonnet,claude-haiku,gpt-4o`,
		`# 将会话文件导出为 HTML\n  ${APP_NAME} --export ~/.omp/agent/sessions/--path--/session.jsonl`,
	],
} satisfies CommandMetadata;
