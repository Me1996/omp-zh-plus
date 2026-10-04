import { clearSubmittedText } from "./helpers/draft";
import { getOAuthProviders } from "@oh-my-pi/pi-ai/oauth";
import { journalJudgmentUsage, resolveJudge, sharedJudgmentCache } from "../judgment";
import type { AgentSession } from "../session/agent-session";
import type { SessionOAuthAccountList } from "../session/agent-session-types";
import {
	getChangelogPath,
	parseChangelog,
	parseChangelogView,
	renderChangelogEntries,
	selectChangelogEntries,
} from "../utils/changelog";
import { formatTokenCount, refreshStatusLine } from "./builtin-modes";
import { buildContextReportText } from "./helpers/context-report";
import { formatCoarseDuration } from "@oh-my-pi/pi-tui-zh/chrome/format";
import { sanitizeText } from "@oh-my-pi/pi-utils";
import { handleMcpAcp } from "./helpers/mcp";
import { markdownFenceFor } from "../utils/markdown-fence";
import { commandConsumed, errorMessage, parseSubcommand, usage } from "./helpers/parse";
import { describeRedeemOutcome, toResetUsageAccounts } from "./helpers/reset-usage";
import type { ResetUsageAccount } from "@oh-my-pi/pi-tui-zh/overlays/reset-usage-selector";
import { matchSessionPinAccounts, toSessionPinAccounts } from "./helpers/session-pin";
import {
	launchStatsDashboard,
	parseStatsDashboardArgs,
	type StatsDashboardArgs,
	type StatsDashboardLaunchResult,
} from "./helpers/stats-dashboard";
import { StatsNotice } from "@oh-my-pi/pi-tui-zh/overlays/stats-notice";
import { handleTodoAcp } from "./helpers/todo";
import { buildUsageReportText } from "./helpers/usage-report";
import type { SlashCommandRuntime, SlashCommandSpec } from "./types";

function normalizeResetProvider(value: string): string | undefined {
	switch (value.trim().toLowerCase()) {
		case "anthropic":
		case "claude":
			return "anthropic";
		case "openai-codex":
		case "codex":
			return "openai-codex";
		default:
			return undefined;
	}
}

async function handleUsageResetCommand(
	arg: string,
	session: AgentSession,
	output: SlashCommandRuntime["output"],
): Promise<void> {
	const safe = (value: string): string => sanitizeText(value.replace(/[\r\n\t]+/g, " "));
	let accounts: ResetUsageAccount[];
	try {
		accounts = toResetUsageAccounts(await session.listResetCredits());
	} catch (error) {
		await output(`无法加载已保存的重置:${safe(errorMessage(error))}`);
		return;
	}
	if (accounts.length === 0) {
		await output("未找到提供商账户。使用 /login 添加一个。");
		return;
	}
	const targetArg = arg.trim();
	if (!targetArg) {
		const lines = ["已保存的限流重置:"];
		for (const account of accounts) {
			let detail: string;
			if (account.error) {
				detail = `不可用(${safe(account.error)})`;
			} else {
				detail = `${account.availableCount} 已保存,${account.redeemableCount} 当前可用`;
				if (account.expiresAt) detail += `,过期时间 ${safe(account.expiresAt)}`;
				if (account.redeemableCount === 0 && account.unavailableReason) {
					detail += ` (${safe(account.unavailableReason)})`;
				}
			}
			lines.push(
				`- ${safe(account.label)} [${safe(account.providerLabel)} · ${account.provider}/${account.target.credentialId}]: ${detail}${account.active ? " (当前)" : ""}`,
			);
		}
		lines.push("", "使用 `/usage reset <provider>/<credential id>` 或 `/usage reset <provider>/active` 花费一次。");
		await output(lines.join("\n"));
		return;
	}

	const slash = targetArg.indexOf("/");
	if (slash <= 0) {
		await output("使用 `/usage reset <provider>/<credential id>` 选择账户。");
		return;
	}
	const requestedProvider = normalizeResetProvider(targetArg.slice(0, slash));
	const requestedAccount = targetArg
		.slice(slash + 1)
		.trim()
		.toLowerCase();
	if (!requestedProvider) {
		await output(`未知的重置提供商 "${safe(targetArg.slice(0, slash))}"。请使用 anthropic 或 openai-codex。`);
		return;
	}
	const requestedCredentialId = /^\d+$/.test(requestedAccount) ? Number(requestedAccount) : undefined;
	const target = accounts.find(account => {
		if (account.provider !== requestedProvider) return false;
		if (requestedAccount === "active") return account.active;
		return requestedCredentialId !== undefined && account.target.credentialId === requestedCredentialId;
	});
	if (!target) {
		await output(`没有匹配 "${safe(targetArg)}" 的已保存账户。用 \`/usage reset\` 列出可选账户。`);
		return;
	}
	if (target.redeemableCount <= 0) {
		const reason = target.unavailableReason ? ` (${safe(target.unavailableReason)})` : "";
		await output(`${safe(target.label)} [${safe(target.providerLabel)}]:当前没有可用的已保存重置${reason}。`);
		return;
	}
	const outcome = await session.redeemResetCredit(target.target);
	await output(safe(describeRedeemOutcome(outcome, target.label)));
}

async function handleSessionPinCommand(
	arg: string,
	session: AgentSession,
	output: SlashCommandRuntime["output"],
): Promise<void> {
	if (session.isStreaming) {
		await output("会话正在流式输出时无法固定账户。");
		return;
	}
	let accountList: SessionOAuthAccountList | undefined;
	try {
		accountList = await session.listCurrentProviderOAuthAccounts();
	} catch (error) {
		await output(`无法加载提供商账户:${errorMessage(error)}`);
		return;
	}
	if (!accountList) {
		await output("请先选择模型再固定提供商账户。");
		return;
	}
	const provider = getOAuthProviders().find(candidate => candidate.id === accountList.provider);
	const providerName = provider?.name ?? accountList.provider;
	const accounts = toSessionPinAccounts(accountList.accounts);
	if (accounts.length === 0) {
		const source = session.modelRegistry.authStorage.keys.describe(accountList.provider, session.sessionId);
		await output(
			source
				? `没有为 ${providerName} 保存的 OAuth 账户。当前授权来自 ${source}。`
				: `没有为 ${providerName} 保存的 OAuth 账户。使用 /login 添加一个。`,
		);
		return;
	}

	const selector = arg.trim();
	if (!selector) {
		const lines = [`${providerName} 的 OAuth 账户:`];
		for (const account of accounts) {
			lines.push(`${account.position + 1}. ${account.label}${account.active ? " (当前)" : ""}`);
		}
		lines.push("", "使用 `/session pin <编号|邮箱|账户 id>` 固定其中一个。");
		await output(lines.join("\n"));
		return;
	}

	const matches = matchSessionPinAccounts(accounts, selector);
	if (matches.length === 0) {
		await output(`没有 ${providerName} 账户匹配 "${selector}"。`);
		return;
	}
	if (matches.length > 1) {
		await output(
			`"${selector}" 匹配多个 ${providerName} 账户:${matches
				.map(account => `${account.position + 1}. ${account.label}`)
				.join(", ")}。请使用账户编号。`,
		);
		return;
	}
	const account = matches[0];
	if (!account || !session.pinCurrentProviderOAuthAccount(account.credentialId)) {
		await output(`${account?.label ?? selector} 已无法固定。`);
		return;
	}
	await output(`已将 ${account.label} 固定到本会话的 ${providerName}。`);
}

/**
 * Start (or reuse) the stats dashboard for this session. The Frustration page
 * judges through this session's settings and registry; its cost lands on this
 * session's ledger.
 */
function launchSessionStatsDashboard(
	args: StatsDashboardArgs,
	owner: Pick<SlashCommandRuntime, "settings" | "session" | "sessionManager">,
): Promise<StatsDashboardLaunchResult> {
	const judge = resolveJudge({
		settings: owner.settings,
		registry: owner.session.modelRegistry,
		sessionId: owner.session.sessionId,
		purpose: "stats_frustration",
		onUsage: journalJudgmentUsage(owner.sessionManager),
		telemetry: owner.session.agent.telemetry,
		cache: sharedJudgmentCache(),
	});
	return launchStatsDashboard(args, async () => judge);
}

export const BUILTIN_SESSION_SLASH_COMMANDS: ReadonlyArray<SlashCommandSpec> = [
	{
		name: "todo",
		icon: "todo",
		description: "查看或修改代理的待办列表",
		acpDescription: "Manage todos",
		acpInputHint: "<subcommand>",
		subcommands: [
			{ name: "edit", description: "在 $EDITOR 中打开待办(Markdown 往返)" },
			{ name: "copy", description: "将待办以 Markdown 复制到剪贴板" },
			{ name: "expand", description: "在 HUD 中显示所有阶段与任务" },
			{ name: "collapse", description: "恢复有界 HUD 预览" },
			{ name: "export", description: "将待办以 Markdown 写入文件(默认:TODO.md)", usage: "[<path>]" },
			{ name: "import", description: "从 Markdown 文件替换待办(默认:TODO.md)", usage: "[<path>]" },
			{
				name: "append",
				description: "追加任务;阶段模糊匹配或自动创建",
				usage: "[<phase>] <task...>",
			},
			{ name: "start", description: "将任务标记为进行中(模糊匹配)", usage: "<task>" },
			{ name: "done", description: "将任务/阶段/全部标记为完成(模糊匹配)", usage: "[<task|phase>]" },
			{ name: "drop", description: "将任务/阶段/全部标记为放弃(模糊匹配)", usage: "[<task|phase>]" },
			{ name: "rm", description: "删除任务/阶段/全部(模糊匹配)", usage: "[<task|phase>]" },
		],
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => {
			const tasks = runtime.ctx.todoPhases.flatMap(phase => phase.tasks);
			if (tasks.length === 0) return "待办:无";
			const pending = tasks.filter(task => task.status === "pending").length;
			const inProgress = tasks.filter(task => task.status === "in_progress").length;
			const completed = tasks.filter(task => task.status === "completed").length;
			return `待办:${pending + inProgress} 个未完成(${inProgress} 进行中,${completed} 已完成)`;
		},
		handle: handleTodoAcp,
		handleTui: async (command, runtime) => {
			await runtime.ctx.handleTodoCommand(command.args);
			clearSubmittedText(runtime);
		},
	},
	{
		name: "session",
		icon: "session",
		description: "会话管理命令",
		acpDescription: "Show or configure the current session",
		acpInputHint: "[info|delete|pin [account]]",
		subcommands: [
			{ name: "info", description: "显示会话信息与统计" },
			{ name: "delete", description: "删除当前会话并返回选择器" },
			{
				name: "pin",
				description: "将当前提供商固定到已保存的 OAuth 账户",
				usage: "[account]",
			},
		],
		allowArgs: true,
		handle: async (command, runtime) => {
			const { verb, rest } = parseSubcommand(command.args);
			if (!verb || (verb === "info" && !rest)) {
				await runtime.output(
					[
						`Session: ${runtime.session.sessionId}`,
						`Title: ${runtime.session.sessionName}`,
						`CWD: ${runtime.cwd}`,
					].join("\n"),
				);
				return commandConsumed();
			}
			if (verb === "delete" && !rest) {
				if (runtime.session.isStreaming) return usage("流式输出期间无法删除会话。", runtime);
				const sessionFile = runtime.sessionManager.getSessionFile();
				if (!sessionFile) return usage("没有可删除的会话文件(内存会话)。", runtime);
				// Route through the active SessionManager so the persist writer is
				// closed before the file is deleted. Constructing a fresh
				// FileSessionStorage and calling deleteSessionWithArtifacts leaves
				// the active writer attached to the now-deleted path, so the next
				// prompt would silently resurrect or corrupt the "deleted" file.
				try {
					await runtime.sessionManager.dropSession(sessionFile);
				} catch (err) {
					return usage(`删除会话失败:${errorMessage(err)}`, runtime);
				}
				await runtime.output(
					`会话已删除:${sessionFile}。使用 ACP \`session/load\` 切换到其他会话。`,
				);
				return commandConsumed();
			}
			if (verb === "pin") {
				await handleSessionPinCommand(rest, runtime.session, runtime.output);
				return commandConsumed();
			}
			return usage("用法:/session [info|delete|pin [account]]", runtime);
		},
		handleTui: async (command, runtime) => {
			const { verb, rest } = parseSubcommand(command.args);
			if (verb === "delete" && !rest) {
				clearSubmittedText(runtime);
				await runtime.ctx.handleSessionDeleteCommand();
				return;
			}
			if (verb === "pin") {
				if (rest) {
					await handleSessionPinCommand(rest, runtime.ctx.session, text => runtime.ctx.showStatus(text));
					refreshStatusLine(runtime.ctx);
				} else {
					await runtime.ctx.showSessionPinSelector();
				}
				clearSubmittedText(runtime);
				return;
			}
			if (!verb || (verb === "info" && !rest)) {
				await runtime.ctx.handleSessionCommand();
			} else {
				runtime.ctx.showStatus("用法:/session [info|delete|pin [account]]");
			}
			clearSubmittedText(runtime);
		},
	},
	{
		name: "jobs",
		icon: "jobs",
		description: "显示异步后台作业状态",
		acpDescription: "Show background jobs",
		acpInputHint: "[full]",
		subcommands: [{ name: "full", description: "显示完整未截断的命令行" }],
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => {
			const snapshot = runtime.ctx.session.getAsyncJobSnapshot({ recentLimit: 5 });
			if (!snapshot || (snapshot.running.length === 0 && snapshot.recent.length === 0)) return "作业:无";
			return `作业:${snapshot.running.length} 个运行中,${snapshot.recent.length} 个最近`;
		},
		handle: async (command, runtime) => {
			const { verb, rest } = parseSubcommand(command.args);
			if (rest || (verb && verb !== "full")) return usage("用法:/jobs [full]", runtime);
			const full = verb === "full";
			const snapshot = runtime.session.getAsyncJobSnapshot({ recentLimit: 5 });
			if (!snapshot || (snapshot.running.length === 0 && snapshot.recent.length === 0)) {
				await runtime.output(
					"没有运行中的后台作业。(后台作业运行异步工具——例如长时 bash、debug 或 task 子代理,它们原本会占用一整轮。作业存活期间以及结束后短暂可见,直到结果交付,最多约 5 分钟。)",
				);
				return commandConsumed();
			}
			const now = Date.now();
			const describe = (job: { label: string; command?: string }): string => {
				if (!full) return `    ${job.label}`;
				const text = sanitizeText(job.command ?? job.label);
				const fence = markdownFenceFor(text);
				return `${fence}\n${text}\n${fence}`;
			};
			const lines: string[] = ["后台作业", `运行中:${snapshot.running.length}`];
			if (snapshot.running.length > 0) {
				lines.push("", "运行中的作业");
				for (const job of snapshot.running) {
					lines.push(`  [${job.id}] ${job.type} (${job.status}) — ${formatCoarseDuration(now - job.startTime)}`);
					lines.push(describe(job));
				}
			}
			if (snapshot.recent.length > 0) {
				lines.push("", "最近的作业");
				for (const job of snapshot.recent) {
					lines.push(
						`  [${job.id}] ${job.type} (${job.status}) — ${formatCoarseDuration((job.endTime ?? now) - job.startTime)}`,
					);
					lines.push(describe(job));
				}
			}
			await runtime.output(lines.join("\n"));
			return commandConsumed();
		},
		handleTui: async (command, runtime) => {
			const { verb, rest } = parseSubcommand(command.args);
			if (rest || (verb && verb !== "full")) {
				runtime.ctx.showStatus("用法:/jobs [full]");
			} else {
				await runtime.ctx.handleJobsCommand({ full: verb === "full" });
			}
			clearSubmittedText(runtime);
		},
	},
	{
		name: "usage",
		icon: "gauge",
		description: "显示提供商用量与限额",
		acpDescription: "Show token usage",
		acpInputHint: "[show|reset [provider/credential-id|provider/active]]",
		subcommands: [
			{ name: "show", description: "显示提供商用量与限额" },
			{
				name: "reset",
				description: "花费一个已保存的提供商限流重置",
				usage: "[provider/credential-id|provider/active]",
			},
		],
		allowArgs: true,
		handle: async (command, runtime) => {
			const { verb, rest } = parseSubcommand(command.args);
			if (!verb || (verb === "show" && !rest)) {
				await runtime.output(await buildUsageReportText(runtime));
				return commandConsumed();
			}
			if (verb === "reset") {
				await handleUsageResetCommand(rest, runtime.session, runtime.output);
				return commandConsumed();
			}
			return usage("用法:/usage [show|reset [provider/credential-id|provider/active]]", runtime);
		},
		handleTui: async (command, runtime) => {
			const { verb, rest } = parseSubcommand(command.args);
			if (!verb || (verb === "show" && !rest)) {
				await runtime.ctx.handleUsageCommand();
				clearSubmittedText(runtime);
				return;
			}
			if (verb === "reset") {
				if (rest) {
					await handleUsageResetCommand(rest, runtime.ctx.session, text => runtime.ctx.showStatus(text));
				} else {
					await runtime.ctx.showResetUsageSelector();
				}
				clearSubmittedText(runtime);
				return;
			}
			runtime.ctx.showStatus("用法:/usage [show|reset [provider/credential-id|provider/active]]");
			clearSubmittedText(runtime);
		},
	},
	{
		name: "stats",
		icon: "stats",
		description: "启动本地统计仪表盘",
		inlineHint: "[--port <port>] [--host <host>]",
		allowArgs: true,
		handle: async (command, runtime) => {
			const parsed = parseStatsDashboardArgs(command.args);
			if ("error" in parsed) return usage(parsed.error, runtime);

			await runtime.output("正在同步会话文件...");
			try {
				const result = await launchSessionStatsDashboard(parsed, runtime);
				await runtime.output(result.message);
			} catch (error) {
				await runtime.output(`统计仪表盘启动失败:${errorMessage(error)}`);
			}
			return commandConsumed();
		},
		handleTui: async (command, runtime) => {
			const ctx = runtime.ctx;
			ctx.editor.setText("");
			const parsed = parseStatsDashboardArgs(command.args);
			if ("error" in parsed) {
				ctx.showStatus(parsed.error);
				return;
			}
			try {
				const result = await launchSessionStatsDashboard(parsed, ctx);
				ctx.presentCommandOutput(new StatsNotice(result.message, result.url));
			} catch (error) {
				ctx.showError(`统计仪表盘启动失败:${errorMessage(error)}`);
			}
		},
	},
	{
		name: "changelog",
		icon: "news",
		description: "显示更新日志条目",
		acpDescription: "Show changelog",
		acpInputHint: "[full|last [N]]",
		subcommands: [
			{ name: "full", description: "显示完整更新日志" },
			{ name: "last", description: "显示最近 N 个版本(默认 1)", usage: "[N]" },
		],
		allowArgs: true,
		handle: async (command, runtime) => {
			const view = parseChangelogView(command.args);
			if ("error" in view) return usage(view.error, runtime);
			const changelogPath = getChangelogPath();
			const allEntries = await parseChangelog(changelogPath);
			const entriesToShow = selectChangelogEntries(allEntries, view);
			if (entriesToShow.length === 0) {
				await runtime.output("未找到更新日志条目。");
				return commandConsumed();
			}
			await runtime.output(renderChangelogEntries(entriesToShow).markdown);
			return commandConsumed();
		},
		handleTui: async (command, runtime) => {
			await runtime.ctx.handleChangelogCommand(command.args);
			clearSubmittedText(runtime);
		},
	},
	{
		name: "hotkeys",
		icon: "keyboard",
		description: "显示所有键盘快捷键",
		handleTui: (_command, runtime) => {
			runtime.ctx.handleHotkeysCommand();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "tools",
		icon: "tools",
		description: "显示代理当前可见的工具",
		acpDescription: "Show available tools",
		getTuiAutocompleteDescription: runtime => {
			const active = runtime.ctx.session.getActiveToolNames().length;
			const all = runtime.ctx.session.getAllToolNames().length;
			return all === 0 ? "工具:无可用" : `工具:${active} 个启用 / ${all} 个可用`;
		},
		handle: async (_command, runtime) => {
			const active = runtime.session.getActiveToolNames();
			const all = runtime.session.getAllToolNames();
			if (all.length === 0) {
				await runtime.output("没有可用工具。");
				return commandConsumed();
			}
			const lines = all.map(name => `${active.includes(name) ? "*" : "-"} ${name}`);
			for (const mounted of runtime.session.getXdevToolEntries()) {
				lines.push(`~ xd://${mounted.name}`);
			}
			await runtime.output(lines.join("\n"));
			return commandConsumed();
		},
		handleTui: (_command, runtime) => {
			runtime.ctx.handleToolsCommand();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "context",
		icon: "context",
		description: "显示上下文用量估算明细",
		acpDescription: "Show context usage",
		getTuiAutocompleteDescription: runtime => {
			const usage = runtime.ctx.session.getContextUsage();
			if (!usage) return "上下文:不可用";
			return `上下文:${Math.round(usage.percent)}% (${formatTokenCount(usage.tokens)}/${formatTokenCount(usage.contextWindow)})`;
		},
		handle: async (_command, runtime) => {
			await runtime.output(buildContextReportText(runtime));
			return commandConsumed();
		},
		handleTui: (_command, runtime) => {
			runtime.ctx.handleContextCommand();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "extensions",
		aliases: ["status"],
		icon: "extension",
		description: "打开扩展控制中心仪表盘",
		handleTui: (_command, runtime) => {
			runtime.ctx.showExtensionsDashboard();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "agents",
		icon: "agents",
		description: "打开代理中心(各代理模型、prewalk 与顾问)",
		handleTui: (_command, runtime) => {
			runtime.ctx.showAgentsDashboard();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "git",
		icon: "branch",
		description: "打开 git 界面(分栏 diff 查看器、暂存、提交编辑器)",
		inlineHint: "[revision]",
		allowArgs: true,
		handleTui: (command, runtime) => {
			runtime.ctx.showGitUi(command.args.trim() || undefined);
			clearSubmittedText(runtime);
		},
	},
	{
		name: "hub",
		icon: "agents",
		description: "打开实时 Agent Hub",
		handleTui: (_command, runtime) => {
			runtime.ctx.showAgentHub({ initialSection: "activity" });
			clearSubmittedText(runtime);
		},
	},
	{
		name: "branch",
		aliases: ["rewind"],
		icon: "branch",
		description: "回退到之前的消息,旧路径保留为分支",
		handleTui: (_command, runtime) => {
			runtime.ctx.showUserMessageSelector();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "fork",
		icon: "branch",
		description: "从之前的消息创建新分支",
		handleTui: async (_command, runtime) => {
			clearSubmittedText(runtime);
			await runtime.ctx.handleForkCommand();
		},
	},
	{
		name: "tree",
		icon: "tree",
		description: "导航会话树(切换分支)",
		handleTui: (_command, runtime) => {
			runtime.ctx.showTreeSelector();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "login",
		icon: "signIn",
		description: "OAuth 提供商登录",
		inlineHint: "[provider|redirect URL]",
		allowArgs: true,
		getTuiAutocompleteDescription: runtime =>
			runtime.ctx.oauthManualInput.hasPending()
				? `登录:等待 ${runtime.ctx.oauthManualInput.pendingProviderId ?? "OAuth"} 回调`
				: "登录:选择提供商",
		handleTui: (command, runtime) => {
			const manualInput = runtime.ctx.oauthManualInput;
			const args = command.args.trim();
			if (args.length > 0) {
				const matchedProvider = getOAuthProviders().find(provider => provider.id === args);
				if (matchedProvider) {
					if (manualInput.hasPending()) {
						const pendingProvider = manualInput.pendingProviderId;
						const message = pendingProvider
							? `${pendingProvider} 的 OAuth 登录已在进行中。使用 /login <url> 粘贴重定向 URL。`
							: "OAuth 登录已在进行中。使用 /login <url> 粘贴重定向 URL。";
						runtime.ctx.showWarning(message);
						clearSubmittedText(runtime);
						return;
					}
					void runtime.ctx.showOAuthSelector("login", matchedProvider.id);
					clearSubmittedText(runtime);
					return;
				}
				const submitted = manualInput.submit(args);
				if (submitted) {
					runtime.ctx.showStatus("已收到 OAuth 回调;正在完成登录…");
				} else {
					runtime.ctx.showWarning("没有等待手动回调的 OAuth 登录。");
				}
				clearSubmittedText(runtime);
				return;
			}

			if (manualInput.hasPending()) {
				const provider = manualInput.pendingProviderId;
				const message = provider
					? `${provider} 的 OAuth 登录已在进行中。使用 /login <url> 粘贴重定向 URL。`
					: "OAuth 登录已在进行中。使用 /login <url> 粘贴重定向 URL。";
				runtime.ctx.showWarning(message);
				clearSubmittedText(runtime);
				return;
			}

			void runtime.ctx.showOAuthSelector("login");
			clearSubmittedText(runtime);
		},
	},
	{
		name: "logout",
		icon: "signOut",
		description: "OAuth 提供商登出",
		inlineHint: "[provider]",
		allowArgs: true,
		handleTui: (command, runtime) => {
			const providerId = command.args.trim();
			if (providerId) {
				const matchedProvider = getOAuthProviders().find(provider => provider.id === providerId);
				if (!matchedProvider) {
					runtime.ctx.showWarning(`未知的 OAuth 提供商:${providerId}`);
					clearSubmittedText(runtime);
					return;
				}
				void runtime.ctx.showOAuthSelector("logout", matchedProvider.id);
				clearSubmittedText(runtime);
				return;
			}
			void runtime.ctx.showOAuthSelector("logout");
			clearSubmittedText(runtime);
		},
	},
	{
		name: "mcp",
		icon: "mcp",
		description: "管理 MCP 服务器(添加、列出、移除、测试)",
		acpDescription: "Manage MCP servers",
		inlineHint: "<subcommand>",
		subcommands: [
			{
				name: "add",
				description: "添加新的 MCP 服务器",
				usage: "<name> [--scope project|user] [--url <url>] [-- <command...>]",
			},
			{ name: "list", description: "列出所有已配置的 MCP 服务器" },
			{ name: "remove", description: "移除 MCP 服务器", usage: "<name> [--scope project|user]" },
			{ name: "test", description: "测试与服务器的连接", usage: "<name>" },
			{ name: "reauth", description: "重新授权服务器的 OAuth", usage: "<name>" },
			{ name: "unauth", description: "移除服务器的 OAuth 授权", usage: "<name>" },
			{ name: "enable", description: "启用 MCP 服务器", usage: "<name>" },
			{ name: "disable", description: "禁用 MCP 服务器", usage: "<name>" },
			{
				name: "smithery-search",
				description: "搜索 Smithery 注册表并部署 MCP 服务器",
				usage: "<keyword> [--scope project|user] [--limit <1-100>] [--semantic]",
			},
			{ name: "smithery-login", description: "登录 Smithery 并缓存 API key" },
			{ name: "smithery-logout", description: "移除缓存的 Smithery API key" },
			{ name: "reconnect", description: "重新连接指定的 MCP 服务器", usage: "<name>" },
			{ name: "reload", description: "强制重载 MCP 运行时工具" },
			{ name: "resources", description: "列出已连接服务器的可用资源" },
			{ name: "prompts", description: "列出已连接服务器的可用提示" },
			{ name: "notifications", description: "显示通知能力与订阅" },
			{ name: "help", description: "显示帮助信息" },
		],
		allowArgs: true,
		handle: handleMcpAcp,
		handleTui: async (command, runtime) => {
			clearSubmittedText(runtime);
			await runtime.ctx.handleMCPCommand(command.text);
		},
	},
];
