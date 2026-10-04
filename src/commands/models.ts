/**
 * List, search, and refresh available models.
 */

import { MODEL_KINDS, type ModelKind } from "@oh-my-pi/pi-catalog/types";
import { APP_NAME } from "@oh-my-pi/pi-utils";
import { Args, Command, Flags } from "@oh-my-pi/pi-utils/cli";
import { modelsHelp as commandHelp } from "../cli/command-help";
import { resolveModelsArgs, runModelsCommand } from "../cli/models-cli";

const MODEL_KIND_OPTIONS: readonly (ModelKind | "all")[] = [...MODEL_KINDS, "all"];

export default class Models extends Command {
	static description = commandHelp.description;
	static args = {
		action: Args.string({
			description: "ls(默认)| find | refresh | <provider>",
			required: false,
		}),
		pattern: Args.string({
			description: "过滤/搜索子串,或提供商名称(find 必需)",
			required: false,
		}),
	};

	static flags = {
		json: Flags.boolean({ description: "以 JSON 输出" }),
		kind: Flags.string({
			description: "要列出的目录类型",
			options: MODEL_KIND_OPTIONS,
			default: "chat",
		}),
		extension: Flags.string({
			char: "e",
			description: "列出前加载扩展文件(可重复)",
			multiple: true,
		}),
		"no-extensions": Flags.boolean({
			description: "禁用扩展自动发现(显式 -e 路径仍然生效)",
		}),
		config: Flags.string({
			description: "本次运行加载额外的 config.yml 风格覆盖文件(可重复)",
			multiple: true,
		}),
	};

	static examples = [
		`# 列出可用的聊天模型,按提供商分组\n  ${APP_NAME} models`,
		`# List models of every catalog kind\n  ${APP_NAME} models --kind all`,
		`# 列出某个提供商的模型(任意提供商名称均可)\n  ${APP_NAME} models openai-codex`,
		`# 按子串查找模型\n  ${APP_NAME} models find minimax`,
		`# 强制重新拉取目录(相当于 rm -rf ~/.omp/models.db)\n  ${APP_NAME} models refresh`,
		`# 机器可读输出\n  ${APP_NAME} models --json`,
	];

	async run(): Promise<void> {
		const { args, flags } = await this.parse(Models);
		const { action, pattern } = resolveModelsArgs(args.action, args.pattern);
		const kind = MODEL_KIND_OPTIONS.find(option => option === flags.kind) ?? "chat";
		await runModelsCommand({
			action,
			pattern,
			flags: {
				json: flags.json,
				kind,
				extensions: flags.extension,
				noExtensions: flags["no-extensions"],
				config: flags.config,
			},
		});
	}
}
