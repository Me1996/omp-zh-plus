import { clearSubmittedText } from "./helpers/draft";
import { Spacer } from "@oh-my-pi/pi-tui-zh";
import { APP_NAME, formatAge } from "@oh-my-pi/pi-utils";
import { formatKeyHint } from "@oh-my-pi/pi-tui-zh/app-keybindings";
import { CollabGuestLink } from "../collab/guest";
import type { CollabHost } from "../collab/host";
import { type CollabHostSnapshot, listCollabHosts } from "../collab/registry";
import { settings } from "../config/settings";
import { parseExportArgs } from "../export/html/args";
import { shareSession } from "../export/share";
import { theme } from "@oh-my-pi/pi-tui-zh/theme";
import type { InteractiveModeContext } from "../modes/types";
import { sanitizeDisplayLine } from "@oh-my-pi/pi-tui-zh/overlays/extensions/display-text";
import { extractLastCodeBlock, extractLastCommand, extractLastLink } from "@oh-my-pi/pi-tui-zh/overlays/copy-targets";
import { restartBrowserForModeChange } from "../tools/browser";
import { shortenPath, TRUNCATE_LENGTHS, truncateToWidth } from "@oh-my-pi/pi-tui-zh/render/render-utils";
import { openPath } from "../utils/open";
import { copyToClipboard } from "../utils/clipboard";
import { refreshStatusLine } from "./builtin-modes";
import { CollabQrCodeComponent, collabBrowserLink } from "@oh-my-pi/pi-tui-zh/chrome/collab-qrcode";
import { commandConsumed, errorMessage, parseSubcommand, usage } from "./helpers/parse";
import { formatDumpArchiveReport } from "../session/session-dump-format";
import type { SlashCommandSpec } from "./types";

import { cfgBrowserEnabled, cfgBrowserHeadless } from "../tools/browser/settings";
import { cfgShareRedactSecrets, cfgShareServerUrl, cfgShareStore } from "../commands/settings";

/** Join hint printed by /collab: compact terminal link + clickable browser deep link. */
function collabLinkHint(host: CollabHost, heading: string, view = false): string {
	const bullet = theme.fg("accent", theme.format.bullet);
	const link = view ? host.viewLink : host.link;
	const webLink = view ? host.webViewLink : host.webLink;
	return [
		// Keep the URL on the first row: under transcript pressure the status
		// block is clipped to rendered[0], which used to drop the join link.
		`${collabBrowserLink(webLink, "在浏览器中加入")}  ${theme.fg("success", heading)}`,
		` ${bullet} ${theme.fg("muted", view ? "从另一个终端观看:" : "从另一个终端加入:")} ${APP_NAME} join "${link}"`,
		` ${bullet} ${theme.fg("muted", "或任意网页浏览器:")} ${collabBrowserLink(webLink)}`,
		theme.fg(
			"dim",
			view
				? "任何持有此链接的人都可以观看会话,但不能向代理提问。"
				: "任何持有此链接的人都可以阅读会话并向代理提问。只读链接:/collab view",
		),
	].join("\n");
}

function showCollabQrCode(ctx: InteractiveModeContext, webLink: string): void {
	try {
		ctx.present([new Spacer(1), new CollabQrCodeComponent(webLink)]);
	} catch (err) {
		ctx.showError(`渲染协作用二维码失败:${errorMessage(err)}`);
	}
}

function showCollabLink(ctx: InteractiveModeContext, host: CollabHost, heading: string, view = false): void {
	ctx.showStatus(collabLinkHint(host, heading, view), { dim: false });
	showCollabQrCode(ctx, view ? host.webViewLink : host.webLink);
}

export const BUILTIN_COLLABORATION_SLASH_COMMANDS: ReadonlyArray<SlashCommandSpec> = [
	{
		name: "advisor",
		icon: "advisor",
		description: "开关顾问(第二个模型,审查每一轮并注入笔记)",
		acpDescription: "Toggle advisor",
		acpInputHint: "[on|off|status|dump [raw]|configure]",
		subcommands: [
			{ name: "on", description: "启用顾问" },
			{ name: "off", description: "禁用顾问" },
			{ name: "status", description: "显示顾问状态" },
			{ name: "dump", description: "将顾问的转录复制到剪贴板", usage: "[raw]" },
			{ name: "configure", description: "打开顾问配置编辑器(TUI)" },
		],
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => {
			const stats = runtime.ctx.session.getAdvisorStats();
			if (stats.active && stats.advisors.length > 1) return `顾问:开启(${stats.advisors.length} 个顾问)`;
			if (stats.active && stats.model) return `顾问:开启(${stats.model.provider}/${stats.model.id})`;
			if (stats.configured) return "顾问:已配置,无模型";
			return "顾问:关闭";
		},
		handle: async (command, runtime) => {
			const { verb, rest } = parseSubcommand(command.args);
			if (!verb || verb === "toggle") {
				const active = runtime.session.toggleAdvisorEnabled();
				const configured = runtime.session.isAdvisorEnabled();
				if (active) {
					await runtime.output("顾问已启用。");
				} else if (configured) {
					await runtime.output("顾问设置已启用,但没有为 'advisor' 角色分配模型。");
				} else {
					await runtime.output("顾问已禁用。");
				}
				return commandConsumed();
			}
			if (verb === "on") {
				const active = runtime.session.setAdvisorEnabled(true);
				await runtime.output(
					active ? "顾问已启用。" : "顾问设置已启用,但没有为 'advisor' 角色分配模型。",
				);
				return commandConsumed();
			}
			if (verb === "off") {
				runtime.session.setAdvisorEnabled(false);
				await runtime.output("顾问已禁用。");
				return commandConsumed();
			}
			if (verb === "status") {
				await runtime.output(runtime.session.formatAdvisorStatus());
				return commandConsumed();
			}
			if (verb === "dump") {
				const isRaw = rest.toLowerCase() === "raw";
				const text = runtime.session.formatAdvisorHistoryAsText({ compact: !isRaw });
				await runtime.output(text ?? "顾问在本会话中未激活。");
				return commandConsumed();
			}
			if (verb === "configure") {
				await runtime.output(
					"/advisor configure 打开交互式编辑器,仅在交互式 TUI 中可用。",
				);
				return commandConsumed();
			}
			return usage("用法:/advisor [on|off|status|dump [raw]|configure]", runtime);
		},
		handleTui: async (command, runtime) => {
			const { verb, rest } = parseSubcommand(command.args);
			if (!verb || verb === "toggle") {
				const active = runtime.ctx.session.toggleAdvisorEnabled();
				const configured = runtime.ctx.session.isAdvisorEnabled();
				if (active) {
					runtime.ctx.showStatus("顾问已启用。");
				} else if (configured) {
					runtime.ctx.showStatus("顾问设置已启用,但没有为 'advisor' 角色分配模型。");
				} else {
					runtime.ctx.showStatus("顾问已禁用。");
				}
				refreshStatusLine(runtime.ctx);
				clearSubmittedText(runtime);
				return;
			}
			if (verb === "on") {
				const active = runtime.ctx.session.setAdvisorEnabled(true);
				runtime.ctx.showStatus(
					active ? "顾问已启用。" : "顾问设置已启用,但没有为 'advisor' 角色分配模型。",
				);
				refreshStatusLine(runtime.ctx);
				clearSubmittedText(runtime);
				return;
			}
			if (verb === "off") {
				runtime.ctx.session.setAdvisorEnabled(false);
				runtime.ctx.showStatus("顾问已禁用。");
				refreshStatusLine(runtime.ctx);
				clearSubmittedText(runtime);
				return;
			}
			if (verb === "status") {
				await runtime.ctx.handleAdvisorStatusCommand();
				clearSubmittedText(runtime);
				return;
			}
			if (verb === "dump") {
				const isRaw = rest.toLowerCase() === "raw";
				runtime.ctx.handleAdvisorDumpCommand(isRaw);
				clearSubmittedText(runtime);
				return;
			}
			if (verb === "configure") {
				runtime.ctx.showAdvisorConfigure();
				clearSubmittedText(runtime);
				return;
			}
			runtime.ctx.showStatus("用法:/advisor [on|off|status|dump [raw]|configure]");
			clearSubmittedText(runtime);
		},
	},
	{
		name: "export",
		icon: "export",
		description: "将会话导出为 HTML 文件",
		inlineHint: "[--themes] [path]",
		allowArgs: true,
		handle: async (command, runtime) => {
			try {
				const { outputPath, useUserThemes } = parseExportArgs(command.args);
				if (outputPath === "--copy" || outputPath === "clipboard" || outputPath === "copy") {
					return usage("请使用 /dump 将会话复制到剪贴板。", runtime);
				}
				const filePath = await runtime.session.exportToHtml(outputPath, useUserThemes);
				await runtime.output(`会话已导出到:${filePath}`);
				return commandConsumed();
			} catch (err) {
				return usage(`导出会话失败:${errorMessage(err)}`, runtime);
			}
		},
		handleTui: async (command, runtime) => {
			await runtime.ctx.handleExportCommand(command.text);
			clearSubmittedText(runtime);
		},
	},
	{
		name: "trace",
		icon: "stats",
		description: "在统计仪表盘中打开本会话的 trace",
		handle: async (_command, runtime) => {
			const sessionFile = runtime.session.sessionFile;
			if (!sessionFile) {
				await runtime.output("还没有会话文件——请先发送一条消息。");
				return commandConsumed();
			}
			try {
				// Lazy: the stats dashboard (server + sqlite) loads on demand only,
				// matching src/cli/stats-cli.ts, to keep CLI startup fast.
				const { formatStatsDashboardUrl, startServer } = await import("@oh-my-pi/omp-stats");
				const { hostname, port } = await startServer();
				const url = `${formatStatsDashboardUrl(hostname, port)}/#/traces?s=${encodeURIComponent(sessionFile)}`;
				await runtime.output(url);
				return commandConsumed();
			} catch (err) {
				return usage(`打开 trace 失败:${errorMessage(err)}`, runtime);
			}
		},
		handleTui: async (_command, runtime) => {
			await runtime.ctx.handleTraceCommand();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "dump",
		icon: "clipboard",
		description: "将会话转录复制到剪贴板(并将 LLM 请求 JSON 写入 tmp)",
		acpDescription: "Return full transcript as plain text, with LLM request JSON path",
		acpInputHint: "[all]",
		subcommands: [
			{
				name: "all",
				description: "写入 zip,包含主转录、LLM 请求 JSON,以及每个子代理一个文件",
			},
		],
		allowArgs: true,
		handle: async (command, runtime) => {
			const { verb } = parseSubcommand(command.args);
			if (verb === "all") {
				const archive = await runtime.session.dumpSessionArchiveToTmpDir();
				if (!archive) {
					await runtime.output("还没有可导出的消息。");
					return commandConsumed();
				}
				await runtime.output(formatDumpArchiveReport(archive).join("\n"));
				return commandConsumed();
			}
			if (verb) return usage("用法:/dump [all]", runtime);
			const text = runtime.session.formatSessionAsText();
			if (!text) {
				await runtime.output("还没有可导出的消息。");
				return commandConsumed();
			}
			let sidecarPath: string | undefined;
			try {
				sidecarPath = await runtime.session.dumpLlmRequestToTmpDir();
			} catch {
				// Sidecar is best-effort; the transcript is still output below.
			}
			const lines = [text];
			if (sidecarPath)
				lines.push(
					"",
					`LLM 请求 JSON:${sidecarPath}`,
					"此文件保留在磁盘上,可能包含原始上下文/机密——请谨慎处理。",
				);
			await runtime.output(lines.join("\n"));
			return commandConsumed();
		},
		handleTui: async (command, runtime) => {
			const { verb } = parseSubcommand(command.args);
			if (verb === "all") await runtime.ctx.handleDumpAllCommand();
			else if (verb) runtime.ctx.showStatus("用法:/dump [all]");
			else await runtime.ctx.handleDumpCommand();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "share",
		icon: "share",
		description: "通过加密链接分享会话(分享服务器或 secret gist)",
		handle: async (_command, runtime) => {
			try {
				const result = await shareSession(runtime.sessionManager, {
					serverUrl: cfgShareServerUrl.get(runtime.settings),
					store: cfgShareStore.get(runtime.settings),
					state: runtime.session.state,
					obfuscator: cfgShareRedactSecrets.get(runtime.settings) ? runtime.session.obfuscator : undefined,
				});
				const lines = [`分享 URL:${result.url}`];
				if (result.gistUrl) lines.push(`Gist: ${result.gistUrl}`);
				if (result.truncated) lines.push("注意:为适应分享大小限制,大内容已被裁剪。");
				await runtime.output(lines.join("\n"));
				return commandConsumed();
			} catch (err) {
				return usage(`分享会话失败:${errorMessage(err)}`, runtime);
			}
		},
		handleTui: async (_command, runtime) => {
			await runtime.ctx.handleShareCommand();
			clearSubmittedText(runtime);
		},
	},
	{
		name: "collab",
		icon: "broadcast",
		description: "通过 relay 实时分享本会话",
		inlineHint: "[start|view|list|stop|status] [relayUrl]",
		subcommands: [
			{ name: "view", description: "分享只读链接(访客可观看,不能提问)" },
			{ name: "list", description: "列出活跃的本地 Collab 主机(不含链接;使用 `omp collab link`)" },
			{ name: "status", description: "显示链接 + 参与者" },
			{ name: "stop", description: "停止分享" },
		],
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => {
			const host = runtime.ctx.collabController.host;
			if (host) {
				return `协作:主持中(${Math.max(0, host.participants.length - 1)} 位访客)`;
			}
			if (runtime.ctx.collabGuest?.readOnly) return "协作:只读访客";
			if (runtime.ctx.collabGuest) return "协作:访客";
			return "协作:关闭";
		},
		handleTui: async (command, runtime) => {
			const ctx = runtime.ctx;
			clearSubmittedText(runtime);
			const args = command.args.trim();
			const { verb, rest } = parseSubcommand(args);
			if (verb === "stop") {
				await ctx.collabController.stop("host stopped");
				ctx.showStatus("协作已停止");
				return;
			}
			if (verb === "status") {
				const host = ctx.collabController.host;
				if (host) {
					const names = host.participants.map(p =>
						p.role === "host" ? `${p.name} (host)` : p.readOnly ? `${p.name} (view-only)` : p.name,
					);
					const link = host.access === "view" ? host.webViewLink : host.webLink;
					ctx.showStatus(`协作:${names.join(", ")} — ${collabBrowserLink(link)}`);
				} else if (ctx.collabGuest) {
					ctx.showStatus(
						ctx.collabGuest.readOnly
							? "正以只读访客身份处于协作会话中(/leave 退出)"
							: "正以访客身份处于协作会话中(/leave 退出)",
					);
				} else {
					ctx.showStatus("不在协作会话中");
				}
				return;
			}
			if (verb === "list") {
				// Same registry as `omp collab list`: metadata only, never a link. A
				// link is a deliberate per-host act (`omp collab link <id> [--view]`),
				// so a listing can be shown or logged without granting anything.
				if (rest.trim()) {
					ctx.showError(`用法:/collab list —— 获取链接或 JSON 请使用 \`${APP_NAME} collab link|list\``);
					return;
				}
				let hosts: CollabHostSnapshot[];
				try {
					hosts = await listCollabHosts();
				} catch (err) {
					ctx.showError(
						truncateToWidth(
							sanitizeDisplayLine(`列出协作主机失败:${errorMessage(err)}`),
							TRUNCATE_LENGTHS.LINE,
						),
					);
					return;
				}
				if (hosts.length === 0) {
					ctx.showStatus("没有活跃的协作主机");
					return;
				}
				const bullet = theme.fg("accent", theme.format.bullet);
				const lines = [theme.fg("success", `${hosts.length} 台活跃的本地协作主机`)];
				for (const host of hosts) {
					// Registry strings come from other processes: strip controls,
					// collapse newlines, and bound the width before they hit the TUI.
					const name = host.sessionName ? sanitizeDisplayLine(host.sessionName) : "";
					const sessionId = sanitizeDisplayLine(host.sessionId);
					const session = truncateToWidth(name ? `${name} (${sessionId})` : sessionId, TRUNCATE_LENGTHS.LONG);
					const guests = host.participants - 1;
					const room = [
						`gen ${host.generation}`,
						host.model ? sanitizeDisplayLine(`${host.model.provider}/${host.model.id}`) : "无模型",
						`开始于 ${formatAge(Math.round((Date.now() - host.startedAt) / 1000)) || "刚刚"}`,
					].join(", ");
					const detail = [
						`pid ${host.pid}`,
						`${guests} 位访客`,
						host.access,
						host.relayConnected ? "relay 已连接" : "relay 重连中",
						...(host.inputRequired ? ["等待输入"] : []),
						...(host.busy === null ? [] : [host.busy ? "工作中" : "空闲"]),
						truncateToWidth(sanitizeDisplayLine(shortenPath(host.cwd)), TRUNCATE_LENGTHS.TITLE),
					].join(", ");
					lines.push(
						// Fields are bounded above; each composed row is bounded too so the
						// fixed details can never push it past one transcript line.
						truncateToWidth(` ${bullet} ${session} ${theme.fg("muted", `— ${room}`)}`, TRUNCATE_LENGTHS.LINE),
						truncateToWidth(`   ${theme.fg("muted", detail)}`, TRUNCATE_LENGTHS.LINE),
						`   ${theme.fg("dim", `${APP_NAME} collab link ${host.instanceId}${host.access === "view" ? " --view" : ""}`)}`,
					);
				}
				ctx.showStatus(lines.join("\n"), { dim: false });
				return;
			}
			if (ctx.collabGuest) {
				ctx.showError("已以访客身份处于协作会话中(请先 /leave)");
				return;
			}
			const knownStartVerb = verb === "start" || verb === "view";
			const view = verb === "view";
			const access = view ? "view" : "control";
			const existing = ctx.collabController.host;
			let host: CollabHost;
			try {
				host = await ctx.collabController.start({ access, relay: knownStartVerb ? rest : args });
			} catch (err) {
				ctx.showError(`启动协作会话失败:${errorMessage(err)}`);
				return;
			}
			let heading = existing ? "协作会话已以控制权限重启" : "协作会话已启动!";
			if (host === existing) heading = view ? "只读协作会话进行中" : "协作会话进行中";
			showCollabLink(ctx, host, heading, view);
		},
	},
	{
		name: "join",
		icon: "signIn",
		description: "加入一个共享的协作会话",
		inlineHint: "<link>",
		allowArgs: true,
		handleTui: async (command, runtime) => {
			const ctx = runtime.ctx;
			clearSubmittedText(runtime);
			const link = command.args.trim();
			if (!link) {
				ctx.showError("用法:/join <link>");
				return;
			}
			if (ctx.collabGuest) {
				ctx.showError("已处于协作会话中(请先 /leave)");
				return;
			}
			try {
				// Stop stale/ending ownership and cancel pending starts, not a live room.
				if (!ctx.collabController.host) await ctx.collabController.stop("joining another session");
				// Recheck after teardown: a concurrent manual start may have won.
				if (ctx.collabController.host) {
					ctx.showError("请先停止主持(/collab stop)");
					return;
				}
				await new CollabGuestLink(ctx).join(link);
			} catch (err) {
				ctx.showError(`加入协作会话失败:${errorMessage(err)}`);
			}
		},
	},
	{
		name: "leave",
		icon: "signOut",
		description: "离开协作会话",
		getTuiAutocompleteDescription: runtime => {
			if (runtime.ctx.collabController.host) return "离开协作:主持中";
			if (runtime.ctx.collabGuest) return "离开协作:访客";
			return "离开协作:不在协作中";
		},
		handleTui: async (_command, runtime) => {
			const ctx = runtime.ctx;
			clearSubmittedText(runtime);
			if (ctx.collabGuest) {
				await ctx.collabGuest.leave("left");
				return;
			}
			const wasHosting = ctx.collabHost !== undefined;
			await ctx.collabController.stop("host stopped");
			if (wasHosting) {
				ctx.showStatus("协作已停止");
				return;
			}
			ctx.showStatus("不在协作会话中");
		},
	},
	{
		name: "browser",
		icon: "globe",
		description: "切换浏览器 eval-prelude 无头与可见模式",
		acpInputHint: "[headless|visible]",
		subcommands: [
			{ name: "headless", description: "切换到无头模式" },
			{ name: "visible", description: "切换到可见模式" },
		],
		allowArgs: true,
		getTuiAutocompleteDescription: runtime => {
			if (!cfgBrowserEnabled.get(runtime.ctx.settings)) return "浏览器:已禁用";
			return cfgBrowserHeadless.get(runtime.ctx.settings) ? "浏览器:无头" : "浏览器:可见";
		},
		handle: async (command, runtime) => {
			const arg = command.args.toLowerCase();
			const enabled = cfgBrowserEnabled.get(runtime.settings);
			if (!enabled) return usage("浏览器能力已禁用(在设置中启用)。", runtime);
			const current = cfgBrowserHeadless.get(runtime.settings);
			let next = current;
			if (!arg) next = !current;
			else if (arg === "headless" || arg === "hidden") next = true;
			else if (arg === "visible" || arg === "show" || arg === "headful") next = false;
			else return usage("用法:/browser [headless|visible]", runtime);
			cfgBrowserHeadless.set(runtime.settings, next);
			try {
				await restartBrowserForModeChange();
			} catch (err) {
				// Setting was already mutated; surface the restart failure so the
				// user knows the browser is in an inconsistent state.
				await runtime.output(
					`浏览器模式已设为 ${next ? "无头" : "可见"},但重启失败:${errorMessage(err)}`,
				);
				return commandConsumed();
			}
			await runtime.output(`浏览器模式:${next ? "无头" : "可见"}`);
			return commandConsumed();
		},
		handleTui: async (command, runtime) => {
			const arg = command.args.toLowerCase();
			const current = cfgBrowserHeadless.get(settings);
			let next = current;
			if (!cfgBrowserEnabled.get(settings)) {
				runtime.ctx.showWarning("浏览器能力已禁用(在设置中启用)");
				clearSubmittedText(runtime);
				return;
			}
			if (!arg) {
				next = !current;
			} else if (arg === "headless" || arg === "hidden") {
				next = true;
			} else if (arg === "visible" || arg === "show" || arg === "headful") {
				next = false;
			} else {
				runtime.ctx.showStatus("用法:/browser [headless|visible]");
				clearSubmittedText(runtime);
				return;
			}
			cfgBrowserHeadless.set(settings, next);
			try {
				await restartBrowserForModeChange();
			} catch (error) {
				runtime.ctx.showWarning(`重启浏览器失败:${errorMessage(error)}`);
				clearSubmittedText(runtime);
				return;
			}
			runtime.ctx.showStatus(`浏览器模式:${next ? "无头" : "可见"}`);
			clearSubmittedText(runtime);
		},
	},
	{
		name: "copy",
		icon: "copy",
		description: "从对话中挑选文本或代码进行复制",
		allowArgs: true,
		handleTui: async (command, runtime) => {
			const arg = command.args.trim().toLowerCase();
			if (!arg) {
				runtime.ctx.showCopySelector();
				clearSubmittedText(runtime);
				return;
			}
			if (arg === "code") {
				const block = extractLastCodeBlock(runtime.ctx.session.messages);
				if (!block) {
					runtime.ctx.showStatus("没有可复制的代码块。");
					clearSubmittedText(runtime);
					return;
				}
				await copyToClipboard(block.code);
				runtime.ctx.showStatus("代码块已复制到剪贴板");
				clearSubmittedText(runtime);
				return;
			}
			if (arg === "cmd" || arg === "command") {
				const lastCommand = extractLastCommand(runtime.ctx.session.messages);
				if (!lastCommand) {
					runtime.ctx.showStatus("没有可复制的命令。");
					clearSubmittedText(runtime);
					return;
				}
				await copyToClipboard(lastCommand.code);
				runtime.ctx.showStatus(`已复制 ${lastCommand.kind === "bash" ? "bash 命令" : "eval 代码"} 到剪贴板`);
				clearSubmittedText(runtime);
				return;
			}
			if (arg === "link" || arg === "url") {
				const link = extractLastLink(runtime.ctx.session.messages);
				if (!link) {
					runtime.ctx.showStatus("没有可复制的链接。");
					clearSubmittedText(runtime);
					return;
				}
				await copyToClipboard(link.href);
				runtime.ctx.showStatus("链接已复制到剪贴板");
				clearSubmittedText(runtime);
				return;
			}
			runtime.ctx.showStatus("用法:/copy [code|cmd|link]");
			clearSubmittedText(runtime);
		},
	},
	{
		name: "open",
		icon: "globe",
		description: "在浏览器中打开对话里的最后一个链接(或用 /copy 挑选)",
		allowArgs: true,
		handleTui: async (command, runtime) => {
			const arg = command.args.trim().toLowerCase();
			if (arg && arg !== "link" && arg !== "url") {
				runtime.ctx.showStatus(
					`用法:/open [link]  (挑选特定链接:/copy,${formatKeyHint("right")} 块,${formatKeyHint("o")})`,
				);
				clearSubmittedText(runtime);
				return;
			}
			const link = extractLastLink(runtime.ctx.session.messages);
			if (!link) {
				runtime.ctx.showStatus("没有可打开的链接。");
				clearSubmittedText(runtime);
				return;
			}
			openPath(link.href);
			runtime.ctx.showStatus(`正在打开 ${link.href}`);
			clearSubmittedText(runtime);
		},
	},
];
