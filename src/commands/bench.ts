import { Args, Command, Flags } from "@oh-my-pi/pi-utils/cli";
import { runBenchCommand } from "../cli/bench-cli";
import { benchHelp as commandHelp } from "../cli/command-help";
import { SERVICE_TIER_OPENAI_VALUES } from "../config/service-tier";

export default class Bench extends Command {
	static description = commandHelp.description;
	static args = {
		models: Args.string({
			description: "模型选择器(provider/model 或模糊 id,如 opus)",
			required: true,
			multiple: true,
		}),
	};

	static flags = {
		runs: Flags.integer({
			description:
				"Requests per model (default: 10 chat, 5 prefill/generation, 9 mix); with --detailed, per phase (default: 4)",
		}),
		"max-tokens": Flags.integer({
			description: "Max output tokens per request (default: chat 512, prefill 64, generation 2048, cache 64)",
		}),
		prompt: Flags.string({ description: "自定义提示词文本（仅限 chat 和 generation 配置）" }),
		profile: Flags.string({
			description:
				"Benchmark workload (default chat): chat (balanced, measures TTFT and tok/s), prefill (large cache-busted input, measures input processing), generation (long forced output, measures sustained decode), mix (rotates all three)",
			options: ["chat", "prefill", "generation", "mix"],
		}),
		"prefill-bytes": Flags.integer({
			description: "prefill 挑战的合成输入大小（默认：32768，受上下文窗口上限约束）",
		}),
		detailed: Flags.boolean({
			description:
				"Run single-user (1 concurrent), parallel (--par concurrent, with aggregate tok/s and scaling), and prefill phases per model",
		}),
		"service-tier": Flags.string({
			description: "按模型族应用的服务等级(默认:配置的 `tier.*` 设置;`none` 表示省略)",
			options: SERVICE_TIER_OPENAI_VALUES,
		}),
		json: Flags.boolean({ description: "以 JSON 输出" }),
		par: Flags.integer({
			description: "以 N 个并行查询/请求执行运行（默认：4）；--detailed 的并行阶段宽度",
		}),
		cache: Flags.boolean({
			description: "运行相互独立的冷/热 prompt-cache 配对(openai-codex-responses 不支持)",
		}),
		"cache-prefix-file": Flags.string({ description: "--cache 的稳定 prompt 前缀文件" }),
		"cache-prefix-bytes": Flags.integer({ description: "--cache 的稳定前缀字节预算(默认:8192)" }),
		"cache-pairs": Flags.integer({ description: "--cache 中每个模型的冷/热配对数量(默认:1)" }),
		"cache-concurrency": Flags.integer({
			description: "--cache 的并发 cache 配对数量;每对仍保持顺序执行(默认:1)",
		}),
	};

	static examples = [
		"# Compare TTFT and tok/s of two models\n  omp bench anthropic/claude-opus-4-5 openai/gpt-5.2",
		"# 模糊选择器同样可用\n  omp bench opus sonnet",
		"# 每个模型各取 3 次平均\n  omp bench opus gpt-5.2 --runs 3",
		"# Rotate chat, prefill, and generation challenges in one run\n  omp bench opus sonnet --profile mix",
		"# Isolate prompt-ingestion speed with a 64 KiB cache-busted input\n  omp bench opus sonnet --profile prefill --prefill-bytes 65536",
		"# Isolate sustained decode throughput\n  omp bench opus sonnet --profile generation",
		"# Compare single-user vs 8 concurrent users, plus prefill speed\n  omp bench apple --detailed --par 8",
		"# 强制使用优先服务等级\n  omp bench openai-codex/gpt-5.5:low --runs 10 --service-tier priority",
		"# 测量一对冷/热 prompt-cache\n  omp bench openai/gpt-5.6 --cache --json",
	];

	async run(): Promise<void> {
		const { args, flags } = await this.parse(Bench);
		await runBenchCommand({
			models: args.models ?? [],
			flags: {
				runs: flags.runs,
				maxTokens: flags["max-tokens"],
				prompt: flags.prompt,
				profile: flags.profile,
				prefillBytes: flags["prefill-bytes"],
				detailed: flags.detailed,
				serviceTier: flags["service-tier"],
				json: flags.json,
				par: flags.par,
				cache: flags.cache,
				cachePrefixFile: flags["cache-prefix-file"],
				cachePrefixBytes: flags["cache-prefix-bytes"],
				cachePairs: flags["cache-pairs"],
				cacheConcurrency: flags["cache-concurrency"],
			},
		});
	}
}
