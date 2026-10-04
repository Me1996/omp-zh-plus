# omp-zh

[oh-my-pi](https://github.com/can1357/oh-my-pi)（CLI 名 `omp`）的**简体中文汉化版**，对应上游 **18.6.0**。

> **非官方包。** 由社区汉化项目 [oh-my-pi-zh](https://github.com/tt1bt/oh-my-pi-zh) 生成，与上游作者无关。
> 翻译采用内容级替换，未覆盖的文案会保持英文（不影响功能）。

## 安装

```bash
bun install -g omp-zh
```

安装后直接运行 `omp` 即为中文界面（需要 [bun](https://bun.sh) ≥ 1.3.14）。

```bash
omp --help
```

升级：`bun install -g omp-zh@latest`　卸载：`bun remove -g omp-zh`

## 说明

- 本包用 bun 直接运行汉化后的 TypeScript 源码，启动约 4-5 秒。
- 包内的 `dist/cli.js` 为上游原版（未汉化），仅为兼容保留，不是本包入口。
- 上游更新后，汉化项目会跟进翻译并重新发版。

## 许可

[MIT](LICENSE)。翻译内容与脚本基于 MIT 许可的 oh-my-pi 派生，感谢原作者。
