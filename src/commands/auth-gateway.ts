/**
 * `omp auth-gateway` — run a forward proxy that injects auth from the broker.
 */

import { Args, Command, Flags, renderCommandHelp } from "@oh-my-pi/pi-utils/cli";
import {
	AUTH_GATEWAY_ACTIONS,
	type AuthGatewayAction,
	type AuthGatewayCommandArgs,
	runAuthGatewayCommand,
} from "../cli/auth-gateway-cli";
import { authGatewayHelp as commandHelp } from "../cli/command-help";
import { initTheme } from "@oh-my-pi/pi-tui-zh/theme";

export default class AuthGateway extends Command {
	static description = commandHelp.description;
	static args = {
		action: Args.string({
			description: "子命令",
			required: false,
			options: [...AUTH_GATEWAY_ACTIONS],
		}),
	};

	static flags = {
		json: Flags.boolean({ description: "以 JSON 输出(token/status/check)" }),
		bind: Flags.string({ description: "`serve` 的绑定地址(host:port)", char: "b" }),
		regenerate: Flags.boolean({ description: "重新生成 gateway bearer token(token)" }),
		"no-auth": Flags.boolean({
			description:
				"禁用入站 bearer-token 认证(serve)。绑定到 loopback 时很有用——允许任何调用方。",
		}),
		"trust-proxy-headers": Flags.boolean({
			description: "信任来自反向代理的转发对端 IP 头（serve）；默认关闭",
		}),
		strict: Flags.boolean({
			description:
				"用于 `check`:额外用各凭据探测其提供商的 chat-completion 端点。较慢;每条凭据会消耗少量配额。",
		}),
	};

	static examples = [
		"# 针对已配置的 broker 启动 gateway\n  omp auth-gateway serve",
		'# Serve the same routes as JSON lines on stdin/stdout with your own credentials\n  echo \'{"id":1,"path":"/v1/chat/completions","body":{"model":"@smol","messages":[{"role":"user","content":"hi"}]}}\' | omp auth-gateway stdio',
		"# 在非默认端口上启动\n  omp auth-gateway serve --bind=127.0.0.1:4000",
		"# Trust client IP headers from a trusted reverse proxy\n  omp auth-gateway serve --trust-proxy-headers",
		"# 打印 gateway bearer token(首次运行时会创建)\n  omp auth-gateway token",
		"# 轮换 gateway bearer token\n  omp auth-gateway token --regenerate",
		"# 在 loopback 上不带任何 bearer 运行(本机任何人都可调用)\n  omp auth-gateway serve --no-auth",
		"# 显示本地 gateway + broker 配置状态\n  omp auth-gateway status",
		"# 探测各 broker 凭据,找出哪个正在产生 401\n  omp auth-gateway check",
		"# 同上,输出机器可读格式供脚本使用\n  omp auth-gateway check --json",
		"# 严格检查——还会用真实 chat-completion ping 测试每条凭据\n  omp auth-gateway check --strict",
	];

	async run(): Promise<void> {
		const { args, flags } = await this.parse(AuthGateway);
		if (!args.action) {
			renderCommandHelp("omp", "auth-gateway", AuthGateway);
			return;
		}
		const cmd: AuthGatewayCommandArgs = {
			action: args.action as AuthGatewayAction,
			flags: {
				json: flags.json,
				bind: flags.bind,
				regenerate: flags.regenerate,
				noAuth: flags["no-auth"],
				trustProxyHeaders: flags["trust-proxy-headers"],
				strict: flags.strict,
			},
		};
		await initTheme();
		await runAuthGatewayCommand(cmd);
	}
}
