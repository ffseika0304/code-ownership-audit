# 代码所有权体检 · Code Ownership Audit

**判定 Python 代码是原创还是演绎作品** —— 给出与上游最长相同表达片段、逐条豁免依据和风险清单。

一个 Agent Skill，任何支持 skill 的智能体都能用（Claude Code / Codex / Cursor / DeepSeek Harness / Hermes / WorkBuddy …）。
审计引擎是**纯 `ast` 静态分析，零第三方依赖、不联网、不调模型**——你的代码不出本机。

---

## 它解决什么问题

你引入了一段开源代码，改了改，现在它算谁的？

- **法律上，"改过"不等于"是我的"。** 演绎作品（derivative work）仍受上游许可证约束。
- **AI 大量生成代码后，这个问题变得更普遍。** 你可能根本不知道某段实现和上游有多像。
- 交付给甲方时，把演绎作品当自有资产声明，是实打实的风险。

这个工具做的事：把你的代码和上游逐个 AST 节点比，**告出最长的相同表达片段**，并对每条风险给出**豁免依据**（是通用惯用法？是接口约定必然形状？还是真的抄了表达）。

## 典型场景

- 引入开源代码后，确认法律上还算不算自己的
- 净室重写（clean-room rewrite）后，验证是否真的切断了上游
- 交付前自查，避免把演绎作品当自有资产
- 合并外部贡献（PR）时确认来源干净

## 判定阈值不是拍脑袋定的

阈值基于 **348 个真实净室重写模块**实测校准 —— 既要能抓出真抄袭，又不能把
`for i, item in enumerate(items):` 这种全世界都这么写的句子报成风险。

---

## 安装

### DeepSeek Harness (DSH)

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

### 其他 Agent（Claude Code / Codex / Cursor / Hermes / WorkBuddy …）

本仓库同时是一个标准 Agent Skills 目录，clone 进 skills 目录即可：

```bash
git clone https://github.com/ffseika0304/code-ownership-audit.git \
  ~/.workbuddy/skills/code-ownership-audit
```

DSH 用户也可以走这条零插件路径：`~/.dsh/skills/` 或项目级 `.dsh/skills/`。

之后直接对你的 Agent 说：**「帮我做个代码所有权体检」**。

## 直接命令行用

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

## 付款怎么走（x402）

完整报告走 [x402 协议](https://x402.org)，用支付宝 AI 钱包付款。买家侧若还没有钱包 CLI：

```bash
npx -y @alipay/agent-payment@latest install-experience
alipay-bot check-wallet     # 自检
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
python -m pytest -q     # 31 项
```

## 协议

MIT

---

<sub>本工具给出的是**技术事实**（哪些表达相同、相同到什么程度），不构成法律意见。
最终的许可证判断请咨询专业人士。</sub>

<sub>本项目为社区开源项目，与 DeepSeek AI 无隶属关系，非官方插件。</sub>
