#!/usr/bin/env bun
// 由 oh-my-pi-zh build-npm-pkg 生成——等价于 src/cli.ts 的入口段：
//   if (isProcessEntry) runCli(process.argv.slice(2)).catch(fatal);
// 这里用动态 import 显式调用，既绕开 import.meta.main（被 import 时为 false），
// 也保证双包引导先于任何 pi-tui-zh 的解析发生。
import { existsSync, mkdirSync, symlinkSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";

const SELF = import.meta.dirname;
const VENDOR = join(SELF, "..", "vendor", "pi-tui-zh");
// 必须物化到「顶层」node_modules：bun 解析嵌套包时不会去子目录的
// node_modules 里找（实测放在 omp-zh/node_modules 下无效）。
const ROOT = join(SELF, "..", "..");
const TARGET = join(ROOT, "@oh-my-pi", "pi-tui-zh");
if (existsSync(VENDOR) && !existsSync(join(TARGET, "package.json"))) {
  mkdirSync(dirname(TARGET), { recursive: true });
  try { symlinkSync(VENDOR, TARGET, "junction"); }
  catch { try { cpSync(VENDOR, TARGET, { recursive: true }); } catch {} }
}

const { runCli } = await import("../src/cli.ts");
const { fatal } = await import("@oh-my-pi/pi-utils/postmortem");
runCli(process.argv.slice(2)).catch(fatal);
