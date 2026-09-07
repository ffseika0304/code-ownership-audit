<h1 align="center">代码所有权体检 · Code Ownership Audit</h1>

<p align="center"><b>判定 Python 代码是原创还是演绎作品</b> —— 给出与上游最长相同表达片段、逐条豁免依据和风险清单。</p>

<p align="center">🥇 <b>纯 AST 静态分析，零第三方依赖，代码不出本机</b> 🥇</p>

<p align="center">
  <a href="#两种安装方式">安装</a> ·
  <a href="#快速使用">使用</a> ·
  <a href="#两档报告">定价</a> ·
  <a href="#国内加速">国内加速</a> ·
  <a href="https://github.com/ffseika0304/code-ownership-audit/issues">反馈问题</a>
</p>

<p align="center">
  <a href="https://github.com/ffseika0304/code-ownership-audit"><img src="https://img.shields.io/github/stars/ffseika0304/code-ownership-audit?style=flat-square&logo=github" alt="GitHub Stars"></a>
  <a href="https://github.com/ffseika0304/code-ownership-audit/fork"><img src="https://img.shields.io/github/forks/ffseika0304/code-ownership-audit?style=flat-square&logo=github" alt="GitHub Forks"></a>
  <a href="https://github.com/ffseika0304/code-ownership-audit/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
  <a href="https://www.python.org"><img src="https://img.shields.io/badge/python-%E2%89%A53.9-blue?style=flat-square&logo=python" alt="Python ≥3.9"></a>
  <a href="https://gitee.com/seikabook/code-ownership-audit"><img src="https://img.shields.io/badge/Gitee-%E5%9B%BD%E5%86%85%E5%8A%A0%E9%80%9F-C71D23?style=flat-square&logo=gitee" alt="Gitee 国内加速"></a>
</p>

你引入了一段开源代码，改了改，现在它算谁的？

- **法律上，"改过"不等于"是我的"。** 演绎作品（derivative work）仍受上游许可证约束。
- **AI 大量生成代码后，这个问题变得更普遍。** 你可能根本不知道某段实现和上游有多像。
- 交付给甲方时，把演绎作品当自有资产声明，是实打实的风险。

这个工具做的事：把你的代码和上游逐个 AST 节点比，**告出最长的相同表达片段**，并对每条风险给出**豁免依据**（是通用惯用法？是接口约定必然形状？还是真的抄了表达）。

---

## Highlights

**🥇 纯 AST 静态分析，不联网、不调模型。** 审计引擎只用 Python 标准库 —— 你的代码不出本机，不存在隐私泄露。

**🥇 两种安装方式，同一套引擎。** Agent Skill 和 DSH Plugin 共享 `audit.py`，按你的 Agent 支持情况选。

**🥇 两档报告，预览免费不限次。** 免费档给出风险总数、类型分布、一句话摘要；完整档 ¥0.2/次，含行号、修复建议、服务器签名审计凭证。

**🥇 x402 协议付款。** 服务端是纯支付预言机：只验钱、签发回执，**不接收也不存储你的任何代码**。回执用内嵌公钥离线验签。

**🥇 31 项测试覆盖。** `python -m pytest -q` 一键跑完，全部通过再发版。

---

## 国内加速

本仓库主源在 GitHub，国内用户可通过 Gitee 镜像加速访问：

| 用途 | 链接 |
|---|---|
| 仓库镜像 | `https://gitee.com/seikabook/code-ownership-audit` |
| raw 直链 | `https://gitee.com/seikabook/code-ownership-audit/raw/main/` |
| 安装 Skill | `git clone https://gitee.com/seikabook/code-ownership-audit.git` |

---

## 两种安装方式

同一套审计引擎（`audit.py`），两种装载形态，按你的 Agent 支持情况选：

| | Agent Skill | DSH Plugin |
|---|---|---|
| 形态 | `SKILL.md` 技能目录 | Cordis 模块，导出 `apply(ctx)` |
| 装载 | 放进 Agent 的 skills 目录 | `dsh plugin --profile web add` |
| 入口文件 | `SKILL.md` | `index.js` + `cordis.patch.yml` |
| 适用 | Claude Code / Codex / Cursor / opencode / Hermes / WorkBuddy 等 | DeepSeek Harness |
| 需要 Node.js | 否 | 是（≥ 22） |

两者互不干扰，DSH 用户想走 skill 路径也可以。

### Agent Skill（Claude Code / Codex / Cursor / opencode / Hermes / WorkBuddy 等）

对你的 Agent 说一句话就行：

> 请把 https://github.com/ffseika0304/code-ownership-audit 安装为 skill

它会自己 clone 到对应的 skills 目录。之后直接说：**「帮我做个代码所有权体检」**。

国内加速安装：

```bash
git clone https://gitee.com/seikabook/code-ownership-audit.git \
  ~/.agents/skills/code-ownership-audit
```

<details>
<summary>各 Agent 的 skills 目录</summary>

⚠️ **目录名必须是 `code-ownership-audit`** —— opencode、Cursor 等要求目录名与 frontmatter 的 `name` 一致，改名会导致加载失败。

`~/.agents/skills/` 是 opencode 与 Cursor 都识别的通用路径。其他位置：

| Agent | 全局 | 项目级 |
|---|---|---|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| opencode | `~/.config/opencode/skills/` | `.opencode/skills/` |
| Cursor | `~/.cursor/skills/` | `.cursor/skills/` |
| Codex | `~/.codex/skills/` | `.codex/skills/` |
| Hermes | `~/.hermes/skills/` | — |
| WorkBuddy | `~/.workbuddy/skills/` | `.workbuddy/skills/` |
| DSH（零插件路径） | `~/.dsh/skills/` | `.dsh/skills/` |

opencode 与 Cursor 同时兼容 `.claude/skills/` 和 `.agents/skills/`，装一份即可被多个 Agent 共用。

</details>

### DSH Plugin（DeepSeek Harness）

```bash
dsh plugin --profile web add github:ffseika0304/code-ownership-audit
```

安装后重启 profile 让 bundle 层生效：

```bash
dsh --profile web
```

技能随即出现在模型可见的技能目录里，遇到「这段代码算不算抄的」这类场景会自动加载，也可以直接点名：
**「用 code-ownership-audit 检查 ./my-code 相对 ./upstream 的所有权情况」**

<details>
<summary>锁版本 / 本地调试 / 卸载</summary>

```bash
# 锁定 commit（推荐，DSH 仍是 developer preview）
dsh plugin --profile web add "github:ffseika0304/code-ownership-audit#<sha>"

# 本地目录（开发调试）
dsh plugin --profile web add link:/absolute/path/to/code-ownership-audit

# 卸载 / 更新
dsh plugin --profile web remove code-ownership-audit
dsh plugin --profile web update code-ownership-audit
```

插件层是**纯 ESM JavaScript、零构建、零运行时依赖**，因此不会触发 pnpm 的 `allowBuilds` 授权中断。

</details>

---

## 快速使用

```bash
# 免费预览：风险数量 + 类型分布 + 一句话摘要
python audit.py <你的代码> --reference <上游代码> --tier preview

# 完整报告：代码位置 + 行号 + 修复建议
python audit.py <你的代码> --reference <上游代码> --tier full
```

目标和参照都可以是单个 `.py` 文件或整个目录。

---

## 两档报告

| | 免费预览 | 完整报告 |
|---|---|---|
| **价格** | **免费、不限次** | **¥0.2 / 次** |
| 风险总数与分级统计 | ✅ | ✅ |
| 风险类型分布 | ✅ | ✅ |
| 每条一句话摘要 | ✅ | ✅ |
| 代码位置 + 具体行号 | — | ✅ |
| 逐条修复建议 | — | ✅ |
| 可导出 md / json | — | ✅ |
| **服务器签名审计凭证** | — | ✅ |
| 是否需要联网 | **完全离线** | 仅付款那一步 |

预览档在**代码层就不构造**行号与建议字段，不是前端隐藏 —— 说到做到。

### 关于"付费解锁的到底是什么"

说实话：完整报告是**在你本机算出来的**。付费解锁的不是"计算结果"，
而是**带服务器 RSA2 签名的认证交付物** `certified.json` / `certified.md`
—— 用来证明这次审计确实付费执行过，可存档、可交给甲方、可离线复验签名。

技术上懂行的人当然可以直接跑 `--tier full` 拿全量。这是"本地执行"架构的必然，
我们没有加壳也没有混淆 —— **代码保持干净可读**。定价逻辑落在凭证价值上，
而 ¥0.2 这个价格本身就让绕过这件事不值得。

### 付款流程（x402）

完整报告走 [x402 协议](https://x402.org)，用支付宝 AI 钱包付款。买家侧若还没有钱包 CLI：

```bash
npx -y @alipay/agent-payment@latest install-experience
alipay-bot check-wallet     # 自检
```

付款时依次执行两条命令（**两条都要跑**，只跑第一条拿不到凭证）：

```bash
# 第 1 步：扫码付款
alipay-bot 402-buyer-pay --file <payment_needed.json>

# 第 2 步：查询支付状态，取回 proof + 签名回执
alipay-bot 402-query-payment-status --trade-no <交易号>
```

服务端是**纯支付预言机**：只验钱、签发回执，**不接收也不存储你的任何代码**。
回执用内嵌公钥（`paygate.SERVER_PUBKEY_PEM`）**离线**验签，任何字段被篡改都会失败。

---

## 依赖

| 用途 | 依赖 |
|---|---|
| 审计引擎（免费档） | **无** —— 只用 Python 标准库 `ast` |
| DSH 插件装载层 | **无** —— 纯 ESM JavaScript，零构建零依赖 |
| 付费档离线验签 | `pycryptodome` |
| 付费档付款 | 支付宝 AI 钱包 CLI |

## 运行环境与权限

| 项目 | 说明 |
|---|---|
| Python | ≥ 3.9（审计引擎本体） |
| Node.js | ≥ 22（仅 DSH 插件装载层需要） |
| 网络访问 | **免费档零网络访问**；仅付费档的付款那一步联网访问支付预言机 |
| 上传数据 | **none** —— 代码不出本机 |
| 模型调用 | **none** —— 不调用任何 LLM |
| 文件写入 | 只写 `--out-dir` 指定的产物目录，不改动源码目录 |

## 测试

```bash
python -m pytest -q     # 31 项（14 项功能测试 + 17 项结构测试）
```

## 仓库结构

```
code-ownership-audit/
├── audit.py            # 审计引擎（741 行纯 Python AST 分析）
├── paygate.py          # 付费网关（x402 协议 + pycryptodome 验签）
├── SKILL.md            # Agent Skill 入口
├── index.js            # DSH Plugin 入口（纯 ESM，零依赖）
├── cordis.patch.yml    # DSH 插件声明
├── dsh-plugin.json     # DSH 插件元数据
├── package.json        # npm 元数据（仅用于 DSH 插件发现）
├── icon.png            # 插件图标（PNG）
├── icon.svg            # 插件图标（SVG）
├── test_audit.py       # 14 项功能测试
├── test_structural.py  # 17 项结构测试
├── LICENSE             # MIT
└── .gitignore
```

## 常见场景

- **引入开源代码后**，确认法律上还算不算自己的
- **净室重写（clean-room rewrite）后**，验证是否真的切断了上游
- **交付前自查**，避免把演绎作品当自有资产
- **合并外部贡献（PR）时**，确认来源干净

---

## Star History

<a href="https://www.star-history.com/#ffseika0304/code-ownership-audit&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=ffseika0304/code-ownership-audit&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=ffseika0304/code-ownership-audit&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=ffseika0304/code-ownership-audit&type=Date" />
 </picture>
</a>

---

## Disclaimer

本工具给出的是**技术事实**（哪些表达相同、相同到什么程度），不构成法律意见。
最终的许可证判断请咨询专业人士。

本项目为社区开源项目，与 DeepSeek AI 无隶属关系，非官方插件。

## License

MIT