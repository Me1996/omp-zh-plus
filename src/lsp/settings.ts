/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import { register } from "../config/registry";

// LSP
export const cfgLspEnabled = register({
	id: "lsp.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "files",
		group: "LSP",
		label: "LSP",
		description: "启用 lsp 工具以获得代码智能(定义、引用、诊断、重命名)",
	},
});

export const cfgLspLazy = register({
	id: "lsp.lazy",
	type: "boolean",
	default: true,
	ui: {
		tab: "files",
		group: "LSP",
		label: "LSP 懒启动",
		description:
			"在首次使用时启动语言服务器(lsp 工具或编辑匹配的文件类型),而不是在会话启动时",
	},
});

export const cfgLspShared = register({
	id: "lsp.shared",
	type: "boolean",
	default: true,
	ui: {
		tab: "files",
		group: "LSP",
		label: "共享语言服务器",
		description:
			"通过守护进程 broker 在多个 omp 实例之间共享每个项目一个语言服务器(不可用时回退到私有服务器)",
	},
});

export const cfgLspFormatOnWrite = register({
	id: "lsp.formatOnWrite",
	type: "boolean",
	default: false,
	ui: {
		tab: "files",
		group: "LSP",
		label: "写入时格式化",
		description: "写入后使用 LSP 自动格式化代码文件",
	},
});

export const cfgLspDiagnosticsOnWrite = register({
	id: "lsp.diagnosticsOnWrite",
	type: "boolean",
	default: true,
	ui: {
		tab: "files",
		group: "LSP",
		label: "写入时诊断",
		description: "写入代码文件后返回 LSP 诊断",
	},
});

export const cfgLspDiagnosticsOnEdit = register({
	id: "lsp.diagnosticsOnEdit",
	type: "boolean",
	default: false,
	ui: {
		tab: "files",
		group: "LSP",
		label: "编辑时诊断",
		description: "编辑代码文件后返回 LSP 诊断",
	},
});

export const cfgLspDiagnosticsDeduplicate = register({
	id: "lsp.diagnosticsDeduplicate",
	type: "boolean",
	default: true,
	ui: {
		tab: "files",
		group: "LSP",
		label: "诊断去重",
		description: "抑制文件中已显示过的编辑后 LSP 诊断;只显示新增或变化的诊断",
	},
});
