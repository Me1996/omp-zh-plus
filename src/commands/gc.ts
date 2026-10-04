/**
 * Run on-disk storage maintenance.
 */

import { Command, Flags } from "@oh-my-pi/pi-utils/cli";
import { gcHelp as commandHelp } from "../cli/command-help";
import { collectGcErrors, type GcCommandArgs, runGcCommand } from "../cli/gc-cli";

export default class Gc extends Command {
	static description = commandHelp.description;
	static flags = {
		apply: Flags.boolean({ description: "应用更改(默认是 dry-run 预览)" }),
		json: Flags.boolean({ description: "以 JSON 输出" }),
		"agent-dir": Flags.string({ description: "要维护的 agent 目录" }),
		blobs: Flags.boolean({ description: "清理无引用的 blob" }),
		archive: Flags.boolean({ description: "归档冷 session" }),
		wal: Flags.boolean({ description: "对历史/模型数据库 WAL 文件做 checkpoint" }),
		stale: Flags.boolean({
			description: "清理悬空的会话标记/面包屑以及旧的调试报告和 collab 副本",
		}),
		"cold-archive-after-days": Flags.integer({ description: "归档前 session 的最小存在天数" }),
		"retain-newest-global": Flags.integer({ description: "始终保留这么多最新的活跃 session" }),
		"retain-newest-per-cwd": Flags.integer({ description: "每个 cwd 始终保留这么多最新的活跃 session" }),
		"stale-retain-newest": Flags.integer({
			description: "始终保留这么多最新的调试报告和 collab 副本",
		}),
		"stale-retain-days": Flags.integer({ description: "清理前调试报告/collab 副本的最短保留时长" }),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(Gc);
		const cmd: GcCommandArgs = {
			flags: {
				apply: flags.apply,
				json: flags.json,
				agentDir: flags["agent-dir"],
				blobs: flags.blobs,
				archive: flags.archive,
				wal: flags.wal,
				stale: flags.stale,
				coldArchiveAfterDays: flags["cold-archive-after-days"],
				retainNewestGlobal: flags["retain-newest-global"],
				retainNewestPerCwd: flags["retain-newest-per-cwd"],
				staleRetainNewest: flags["stale-retain-newest"],
				staleRetainDays: flags["stale-retain-days"],
			},
		};
		const result = await runGcCommand(cmd);
		const errors = collectGcErrors(result);
		if (errors.length > 0) {
			process.stderr.write(
				`GC completed with ${errors.length} error${errors.length === 1 ? "" : "s"}:\n${errors.map(error => `- ${error}`).join("\n")}\n`,
			);
			process.exitCode = 1;
		}
	}
}
