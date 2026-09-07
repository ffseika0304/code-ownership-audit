<h1 align="center">Code Ownership Audit</h1>

<p align="center"><b>Tell whether your Python code is original or a derivative work</b> — with the longest identical expression against upstream, per-finding exemption grounds, and a risk list.</p>

<p align="center">🥇 <b>Pure AST static analysis. Zero third-party deps. Your code never leaves your machine.</b> 🥇</p>

<p align="center">
  <a href="README.md">简体中文</a> ·
  <b>English</b>
</p>

<p align="center">
  <a href="https://github.com/ffseika0304/code-ownership-audit">GitHub (main)</a> ·
  <a href="https://gitee.com/seikabook/code-ownership-audit">Gitee (China mirror)</a>
</p>

<p align="center">
  <a href="#two-ways-to-install">Install</a> ·
  <a href="#quick-start">Usage</a> ·
  <a href="#two-report-tiers">Pricing</a> ·
  <a href="https://github.com/ffseika0304/code-ownership-audit/issues">Report an issue</a>
</p>

<p align="center">
  <a href="https://github.com/ffseika0304/code-ownership-audit"><img src="https://img.shields.io/github/stars/ffseika0304/code-ownership-audit?style=flat-square&logo=github" alt="GitHub Stars"></a>
  <a href="https://github.com/ffseika0304/code-ownership-audit/fork"><img src="https://img.shields.io/github/forks/ffseika0304/code-ownership-audit?style=flat-square&logo=github" alt="GitHub Forks"></a>
  <a href="https://github.com/ffseika0304/code-ownership-audit/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
  <a href="https://www.python.org"><img src="https://img.shields.io/badge/python-%E2%89%A53.9-blue?style=flat-square&logo=python" alt="Python ≥3.9"></a>
  <a href="https://gitee.com/seikabook/code-ownership-audit"><img src="https://img.shields.io/badge/Gitee-China%20Mirror-C71D23?style=flat-square&logo=gitee" alt="Gitee China Mirror"></a>
</p>

You pulled in some open-source code, changed it a bit — so who owns it now?

- **Legally, "I modified it" does not mean "it is mine."** A derivative work is still bound by the upstream license.
- **AI-generated code makes this far more common.** You may have no idea how closely a given implementation resembles upstream.
- Declaring a derivative work as your own asset when delivering to a client is a real, concrete risk.

What this tool does: it compares your code against upstream node by node at the AST level, **reports the longest identical expression**, and gives **exemption grounds** for each finding (is it a universal idiom? a shape forced by an interface contract? or did you actually copy the expression?).

---

## Highlights

**🥇 Pure AST static analysis — no network, no model calls.** The audit engine uses only the Python standard library. Your code never leaves your machine, so there is no privacy exposure.

**🥇 Two install paths, one engine.** The Agent Skill and the DSH Plugin share the same `audit.py`. Pick whichever your agent supports.

**🥇 Two report tiers, preview is free and unlimited.** The free tier gives you the total risk count, type distribution, and a one-line summary per finding. The full report is ¥0.2 per run and adds line numbers, fix suggestions, and a server-signed audit certificate.

**🥇 Payment over x402.** The server is a pure payment oracle: it verifies payment and signs a receipt. It **never receives or stores any of your code**. Receipts are verified offline against an embedded public key.

**🥇 31 tests.** Run `python -m pytest -q` and everything passes before a release ships.

---

## China mirror

The canonical source lives on GitHub. Users in mainland China can use the Gitee mirror for faster access:

| Purpose | Link |
|---|---|
| Repository mirror | `https://gitee.com/seikabook/code-ownership-audit` |
| Raw file access | `https://gitee.com/seikabook/code-ownership-audit/raw/main/` |
| Install as skill | `git clone https://gitee.com/seikabook/code-ownership-audit.git` |

---

## Two ways to install

One audit engine (`audit.py`), two loading shapes. Pick based on what your agent supports:

| | Agent Skill | DSH Plugin |
|---|---|---|
| Shape | A `SKILL.md` skill directory | A Cordis module exporting `apply(ctx)` |
| Loading | Drop into your agent's skills directory | `dsh plugin --profile web add` |
| Entry point | `SKILL.md` | `index.js` + `cordis.patch.yml` |
| Works with | Claude Code / Codex / Cursor / opencode / Hermes / WorkBuddy, etc. | DeepSeek Harness |
| Needs Node.js | No | Yes (≥ 22) |

The two do not interfere with each other — DSH users are free to take the skill path instead.

### Agent Skill (Claude Code / Codex / Cursor / opencode / Hermes / WorkBuddy, etc.)

Just tell your agent:

> Install https://github.com/ffseika0304/code-ownership-audit as a skill

It will clone into the right skills directory on its own. After that, just say: **"Run a code ownership audit for me."**

<details>
<summary>Manual install / skills directory per agent</summary>

⚠️ **The directory name must be `code-ownership-audit`** — opencode, Cursor and others require the directory name to match the `name` in frontmatter. Renaming it breaks loading.

```bash
git clone https://github.com/ffseika0304/code-ownership-audit.git \
  ~/.agents/skills/code-ownership-audit
```

`~/.agents/skills/` is recognized by both opencode and Cursor. Other locations:

| Agent | Global | Project-level |
|---|---|---|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| opencode | `~/.config/opencode/skills/` | `.opencode/skills/` |
| Cursor | `~/.cursor/skills/` | `.cursor/skills/` |
| Codex | `~/.codex/skills/` | `.codex/skills/` |
| Hermes | `~/.hermes/skills/` | — |
| WorkBuddy | `~/.workbuddy/skills/` | `.workbuddy/skills/` |
| DSH (zero-plugin path) | `~/.dsh/skills/` | `.dsh/skills/` |

opencode and Cursor both accept `.claude/skills/` and `.agents/skills/`, so a single install can be shared across agents.

</details>

### DSH Plugin (DeepSeek Harness)

```bash
dsh plugin --profile web add github:ffseika0304/code-ownership-audit
```

Restart the profile so the bundle layer takes effect:

```bash
dsh --profile web
```

The skill then appears in the model-visible skill catalog and loads automatically when a "is this code copied?" situation comes up. You can also call it by name:
**"Use code-ownership-audit to check ./my-code against ./upstream."**

<details>
<summary>Pinning a version / local development / uninstalling</summary>

```bash
# Pin to a commit (recommended — DSH is still a developer preview)
dsh plugin --profile web add "github:ffseika0304/code-ownership-audit#<sha>"

# Local directory (for development)
dsh plugin --profile web add link:/absolute/path/to/code-ownership-audit

# Uninstall / update
dsh plugin --profile web remove code-ownership-audit
dsh plugin --profile web update code-ownership-audit
```

The plugin layer is **pure ESM JavaScript with no build step and no runtime dependencies**, so it will not trigger pnpm's `allowBuilds` authorization prompt.

</details>

---

## Quick start

```bash
# Free preview: risk count + type distribution + one-line summaries
python audit.py <your-code> --reference <upstream-code> --tier preview

# Full report: code location + line numbers + fix suggestions
python audit.py <your-code> --reference <upstream-code> --tier full
```

Both the target and the reference can be a single `.py` file or an entire directory.

---

## Two report tiers

| | Free preview | Full report |
|---|---|---|
| **Price** | **Free, unlimited** | **¥0.2 per run** |
| Total risk count and severity breakdown | ✅ | ✅ |
| Risk type distribution | ✅ | ✅ |
| One-line summary per finding | ✅ | ✅ |
| Code location + exact line numbers | — | ✅ |
| Per-finding fix suggestions | — | ✅ |
| Export to md / json | — | ✅ |
| **Server-signed audit certificate** | — | ✅ |
| Network required | **Fully offline** | Only for the payment step |

The preview tier **does not construct** line-number and suggestion fields at the code level — this is not front-end hiding. We mean it.

### What exactly does paying unlock?

Honestly: the full report is **computed on your own machine**. What you pay for is not the computation, but a **certified deliverable signed with the server's RSA2 key** — `certified.json` / `certified.md` — proof that this audit was actually run as a paid execution. Archive it, hand it to a client, verify the signature offline.

Anyone technical can obviously just run `--tier full` and get everything. That is an inherent consequence of local-execution architecture, and we have added no packer and no obfuscation — **the code stays clean and readable**. The pricing rests on the value of the certificate, and at ¥0.2 working around it simply is not worth the effort.

### How payment works (x402)

The full report uses the [x402 protocol](https://x402.org) with an Alipay AI wallet. If you do not have the wallet CLI yet:

```bash
npx -y @alipay/agent-payment@latest install-experience
alipay-bot check-wallet     # self-check
```

Then run **both** of these commands (the first alone will not give you the certificate):

```bash
# Step 1: pay by scanning the QR code
alipay-bot 402-buyer-pay --file <payment_needed.json>

# Step 2: query payment status to retrieve the proof and signed receipt
alipay-bot 402-query-payment-status --trade-no <trade-no>
```

The server is a **pure payment oracle**: it verifies payment and issues a receipt, and **never receives or stores any of your code**. Receipts are verified **offline** against the embedded public key (`paygate.SERVER_PUBKEY_PEM`) — tampering with any field makes verification fail.

---

## Dependencies

| Purpose | Dependency |
|---|---|
| Audit engine (free tier) | **None** — Python standard library `ast` only |
| DSH plugin loader | **None** — pure ESM JavaScript, no build, no deps |
| Offline receipt verification (paid tier) | `pycryptodome` |
| Payment (paid tier) | Alipay AI wallet CLI |

## Runtime and permissions

| Item | Detail |
|---|---|
| Python | ≥ 3.9 (the audit engine itself) |
| Node.js | ≥ 22 (only for the DSH plugin loader) |
| Network access | **Zero network access on the free tier**; only the paid tier's payment step reaches the payment oracle |
| Data uploaded | **none** — your code never leaves the machine |
| Model calls | **none** — no LLM is invoked |
| File writes | Only into the `--out-dir` you specify; the source directory is never modified |

## Tests

```bash
python -m pytest -q     # 31 tests (14 functional + 17 structural)
```

## Repository layout

```
code-ownership-audit/
├── audit.py            # Audit engine (741 lines of pure Python AST analysis)
├── paygate.py          # Payment gateway (x402 protocol + pycryptodome verification)
├── SKILL.md            # Agent Skill entry point
├── index.js            # DSH Plugin entry point (pure ESM, zero deps)
├── cordis.patch.yml    # DSH plugin declaration
├── dsh-plugin.json     # DSH plugin metadata
├── package.json        # npm metadata (used only for DSH plugin discovery)
├── icon.png            # Plugin icon (PNG)
├── icon.svg            # Plugin icon (SVG)
├── test_audit.py       # 14 functional tests
├── test_structural.py  # 17 structural tests
├── LICENSE             # MIT
└── .gitignore
```

## Common scenarios

- **After pulling in open-source code**, confirm whether it still legally counts as yours
- **After a clean-room rewrite**, verify you really did cut ties with upstream
- **Before delivery**, self-check so you do not declare a derivative work as your own asset
- **When merging outside contributions (PRs)**, confirm the provenance is clean

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

This tool reports **technical facts** (which expressions are identical, and how identical they are). It does not constitute legal advice. For final license determinations, consult a professional.

This is a community open-source project. It is not affiliated with DeepSeek AI and is not an official plugin.

## License

MIT
