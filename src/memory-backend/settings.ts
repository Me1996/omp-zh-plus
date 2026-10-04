/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import { register } from "../config/registry";

// Memory backend selector — picks between local memories pipeline,
// Mnemopi local SQLite, Hindsight remote memory, Sharpshooter project
// decisions, or off. The legacy
// `memories.enabled` flag is migration input only; see config/settings.ts.
// Protocol hosts (RPC/ACP) start with memory off: embedders opt in through their own settings layer.
export const cfgMemoryBackend = register({
	id: "memory.backend",
	protocolDefault: ["rpc", "acp"],
	type: "enum",
	values: ["off", "local", "hindsight", "mnemopi", "sharpshooter"] as const,
	default: "off",
	ui: {
		tab: "memory",
		group: "通用",
		label: "记忆后端",
		description: "关闭、本地摘要管线、Mnemopi SQLite、Hindsight 远程记忆或 Sharpshooter",
		options: [
			{ value: "off", label: "关闭", description: "不运行任何记忆子系统" },
			{ value: "local", label: "本地", description: "本地 rollout 总结流水线 (memory_summary.md)" },
			{ value: "hindsight", label: "Hindsight", description: "Vectorize Hindsight 远程记忆服务" },
			{
				value: "mnemopi",
				label: "Mnemopi",
				description: "本地 SQLite 回忆/保留后端,可选 embeddings",
			},
			{
				value: "sharpshooter",
				label: "Sharpshooter",
				description:
					"Friction-gated project decision files (architecture/product/style), consolidated in the background",
			},
		],
	},
});
