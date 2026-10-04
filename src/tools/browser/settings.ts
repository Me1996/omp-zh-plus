/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import { register } from "../../config/registry";

export const cfgBrowserEnabled = register({
	id: "browser.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "可用工具",
		label: "Browser",
		description: "启用浏览器 eval 前奏，以脚本化 Chromium 自动化（Puppeteer）",
	},
});

export const cfgBrowserCdpUrl = register({
	id: "browser.cdpUrl",
	type: "string",
	default: undefined,
	ui: {
		tab: "tools",
		group: "Grep 与浏览器",
		label: "浏览器 CDP URL",
		description:
			"默认的 HTTP CDP 发现端点(例如 http://127.0.0.1:9222),用于附加到现有浏览器而不是启动新浏览器。工具调用上的显式 app.cdp_url 或 app.path 优先。",
	},
});

export const cfgBrowserRelay = register({
	id: "browser.relay",
	type: "boolean",
	default: false,
	ui: {
		tab: "tools",
		group: "Grep 与浏览器",
		label: "浏览器中继",
		description:
			"Drive your own Chrome tabs through the omp browser relay. Install the extension once (`omp browser-relay install`); the relay server auto-starts when the browser prelude needs it. Takes precedence over Browser CDP URL; set PI_BROWSER_RELAY=0 or PI_BROWSER_RELAY=1 to override.",
	},
});

export const cfgBrowserRelayUrl = register({
	id: "browser.relayUrl",
	type: "string",
	default: undefined,
	ui: {
		tab: "tools",
		group: "Grep 与浏览器",
		label: "浏览器中继 URL",
		description: "omp browser relay 端点(默认 http://127.0.0.1:9224)。",
	},
});

export const cfgBrowserHeadless = register({
	id: "browser.headless",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "Grep 与浏览器",
		label: "无头浏览器",
		description: "以无头模式启动浏览器(禁用则显示浏览器 UI)",
	},
});

export const cfgBrowserCmux = register({
	id: "browser.cmux",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "Grep 与浏览器",
		label: "cmux 浏览器",
		description:
			"当 cmux socket 可用时,使用 cmux WKWebView 表面进行浏览器自动化。设置 PI_BROWSER_CMUX=0 或 PI_BROWSER_CMUX=1 可覆盖。",
	},
});

export const cfgBrowserTern = register({
	id: "browser.tern",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "Grep 与浏览器",
		label: "Tern 浏览器",
		description:
			"Inside a Tern pane, open browser tabs as picture-in-pictures over omp's pane (native web view) instead of headless Chromium; falls back to Chromium when no Tern window can host them. Explicit app options, the relay and Browser CDP URL take precedence; headed:false or app.tern:false opts one open out. Set PI_BROWSER_TERN=0 or PI_BROWSER_TERN=1 to override.",
	},
});

export const cfgBrowserFreezeOnTurnEnd = register({
	id: "browser.freezeOnTurnEnd",
	type: "boolean",
	default: true,
	ui: {
		tab: "tools",
		group: "Grep 与浏览器",
		label: "回合结束时冻结浏览器标签页",
		description:
			"回合结束后冻结 OMP 自管的无头浏览器标签页，避免带动画的页面在空闲时持续占用 CPU/GPU。下次使用时会自动解冻；打开时传入 persist:true 可让该标签页不参与冻结。",
	},
});

export const cfgBrowserIdleCloseSec = register({
	id: "browser.idleCloseSec",
	type: "number",
	default: 1800,
	ui: {
		tab: "tools",
		group: "Grep 与浏览器",
		label: "浏览器标签页空闲关闭超时",
		description:
			"Close OMP-owned headless browser tabs and Tern browser picture-in-pictures idle longer than this many seconds (0 = never; session dispose still reaps). Never touches relay/CDP/spawned browsers or other sessions' tabs.",
		options: [
			{ value: "0", label: "从不" },
			{ value: "900", label: "15 分钟" },
			{ value: "1800", label: "30 分钟" },
			{ value: "3600", label: "1 小时" },
		],
	},
});

export const cfgBrowserScreenshotDir = register({
	id: "browser.screenshotDir",
	type: "string",
	default: undefined,
	ui: {
		tab: "tools",
		group: "Grep 与浏览器",
		label: "截图目录",
		description:
			"保存截图的目录。未设置时,截图保存到临时文件。支持 ~。例如:~/Downloads、~/Desktop、/sdcard/Download (Android)",
	},
});
