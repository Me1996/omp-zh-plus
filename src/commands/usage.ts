/**
 * Show provider usage limits for every authenticated account.
 */

import { Args, Command, Flags } from "@oh-my-pi/pi-utils/cli";
import { usageHelp as commandHelp } from "../cli/command-help";
import { runUsageCommand } from "../cli/usage-cli";

export default class Usage extends Command {
	static description = commandHelp.description;
	static args = {
		action: Args.string({
			description: "要执行的可选子命令",
			required: false,
			options: ["invalidate", "clients"],
		}),
	};

	static flags = {
		json: Flags.boolean({ char: "j", description: "以 JSON 输出用量报告", default: false }),
		provider: Flags.string({ char: "p", description: "仅显示该提供商 id 的用量(如 anthropic)" }),
		redact: Flags.boolean({
			char: "r",
			description: "对账户邮箱/id 做脱敏(最短唯一前缀),便于分享截图",
			default: false,
		}),
		history: Flags.boolean({
			description: "显示记录的用量限额历史(每小时快照),而不是实时快照",
			default: false,
		}),
		days: Flags.integer({ char: "d", description: "History window in days (with --history or clients)", default: 7 }),
		extension: Flags.string({
			char: "e",
			description: "在获取 usage 前加载扩展文件（可重复）",
			multiple: true,
		}),
		"no-extensions": Flags.boolean({
			description: "禁用扩展发现（显式的 -e 路径仍有效）",
		}),
	};

	static examples = [
		"# 所有提供商的逐账户详细用量明细\n  omp usage",
		"# 仅显示 Anthropic 账户\n  omp usage --provider anthropic",
		"# 对账户标识符做脱敏以便截图\n  omp usage --redact",
		"# 机器可读输出\n  omp usage --json",
		"# 最近 30 天的用量限额趋势\n  omp usage --history --days 30",
		"# Per-client token burn (which machine/app spent what) over the last 30 days\n  omp usage clients --days 30",
		"# 使所有提供商的用量缓存报告失效\n  omp usage invalidate",
		"# 使指定提供商的用量缓存报告失效\n  omp usage invalidate --provider anthropic",
	];

	async run(): Promise<void> {
		const { args, flags } = await this.parse(Usage);
		await runUsageCommand({
			action: args.action,
			json: flags.json,
			provider: flags.provider,
			redact: flags.redact,
			history: flags.history,
			days: flags.days,
			extensions: flags.extension,
			noExtensions: flags["no-extensions"],
		});
	}
}
