/**
 * code-ownership-audit — DSH (DeepSeek Harness) plugin entry.
 *
 * Registers the bundled `code-ownership-audit` Agent Skill on `ctx.skills`,
 * which the stock `dsh-tool-skill` consumer turns into the model-facing skill
 * catalog and loader.
 *
 * Design notes:
 * - Pure ESM JavaScript, no build step: avoids the pnpm `allowBuilds` approval
 *   prompt that GitHub-sourced plugins with a `prepare` script trigger.
 * - Zero runtime dependencies: the tiny frontmatter parser below replaces the
 *   `yaml` package, so installing this plugin pulls nothing extra.
 * - The skill body itself is plain Python (audit.py / paygate.py) executed by
 *   the model through its normal shell tool; this plugin only publishes the
 *   SKILL.md instructions, it does not spawn processes or touch the network.
 */

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Cordis plugin identifier of this bundle row. */
export const name = 'code-ownership-audit';

/** Services that must be mounted before `apply` runs. */
export const inject = ['skills'];

/** Package root (this file sits at the package root). */
export const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));

/** Absolute path of the bundled skill document. */
const SKILL_FILE = resolve(PACKAGE_ROOT, 'SKILL.md');

/** Rank used by platform-bundled skill sources. */
const BUNDLED_SKILL_RANK = 600;

/** Hard cap on the description field, matching the shared skill format rules. */
const MAX_DESCRIPTION_LENGTH = 1024;

/** Default provider name registered on `ctx.skills`. */
const DEFAULT_PROVIDER_NAME = 'code-ownership-audit-bundled';

/**
 * Split `---`-delimited YAML frontmatter off the head of a markdown document.
 *
 * Deliberately minimal: skill frontmatter is a flat `key: value` map, so a full
 * YAML engine is unnecessary. Supports optional single/double quoting and
 * ignores comment lines. Returns `undefined` when no frontmatter block exists.
 */
export function splitFrontmatter(raw) {
  const firstBreak = raw.indexOf('\n');
  if (firstBreak < 0) return undefined;
  if (raw.slice(0, firstBreak).replace(/\r$/, '') !== '---') return undefined;

  const start = firstBreak + 1;
  let lineStart = start;
  let closingLineStart;
  let bodyStart;
  while (lineStart <= raw.length) {
    const nextBreak = raw.indexOf('\n', lineStart);
    const lineEnd = nextBreak < 0 ? raw.length : nextBreak;
    if (raw.slice(lineStart, lineEnd).replace(/\r$/, '') === '---') {
      closingLineStart = lineStart;
      bodyStart = nextBreak < 0 ? raw.length : nextBreak + 1;
      break;
    }
    if (nextBreak < 0) return undefined;
    lineStart = nextBreak + 1;
  }
  if (closingLineStart === undefined) return undefined;

  const data = {};
  for (const line of raw.slice(start, closingLineStart).split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) continue;
    const sep = trimmed.indexOf(':');
    if (sep <= 0) continue;
    const key = trimmed.slice(0, sep).trim();
    let value = trimmed.slice(sep + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    if (key.length > 0) data[key] = value;
  }
  return { data, body: raw.slice(bodyStart) };
}

/** Raised when the bundled skill document violates the field contract. */
export class SkillDocumentError extends Error {
  name = 'SkillDocumentError';
}

/** Skill names are kebab-case, matching the shared skill format rules. */
function isSkillName(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/**
 * Parse and validate the bundled skill document.
 *
 * @throws {SkillDocumentError} when a required field is missing or invalid.
 */
export function parseSkillDocument(raw) {
  const parsed = splitFrontmatter(raw);
  if (parsed === undefined) throw new SkillDocumentError('missing YAML frontmatter');

  const skillName = parsed.data.name;
  if (typeof skillName !== 'string' || skillName.length === 0) {
    throw new SkillDocumentError('frontmatter requires "name"');
  }
  if (!isSkillName(skillName)) {
    throw new SkillDocumentError(`invalid skill name "${skillName}"`);
  }

  const description = parsed.data.description;
  if (typeof description !== 'string' || description.length === 0) {
    throw new SkillDocumentError('frontmatter requires "description"');
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new SkillDocumentError(`description exceeds ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  const metadata = {};
  for (const key of ['displayName', 'version', 'license', 'summary']) {
    if (typeof parsed.data[key] === 'string' && parsed.data[key].length > 0) {
      metadata[key] = parsed.data[key];
    }
  }

  return {
    name: skillName,
    description,
    metadata,
    invocation: { modelInvocable: true, userInvocable: true },
    content: parsed.body.trim(),
  };
}

/**
 * Provider that publishes the single bundled skill.
 *
 * The document is read fresh on every `get()` so edits to the shipped markdown
 * are picked up without cache invalidation machinery.
 */
export class CodeOwnershipAuditSkillProvider {
  constructor(providerName, deps) {
    this.name = providerName;
    this.#deps = deps;
  }

  #deps;

  async list(options) {
    options?.signal?.throwIfAborted();
    let raw;
    try {
      raw = await readFile(SKILL_FILE, { encoding: 'utf8', signal: options?.signal });
    } catch (error) {
      this.#deps.warn(`cannot read ${SKILL_FILE}: ${error.message}`);
      return [];
    }

    let document;
    try {
      document = parseSkillDocument(raw);
    } catch (error) {
      this.#deps.warn(`skill file ${SKILL_FILE} ignored: ${error.message}`);
      return [];
    }

    return [
      {
        name: document.name,
        description: document.description,
        invocation: document.invocation,
        provider: this.name,
        source: 'bundled',
        rank: BUNDLED_SKILL_RANK,
        resourceBase: { kind: 'directory', path: PACKAGE_ROOT },
        path: SKILL_FILE,
        metadata: document.metadata,
      },
    ];
  }

  async get(candidate, options) {
    options?.signal?.throwIfAborted();

    let raw;
    try {
      raw = await readFile(SKILL_FILE, { encoding: 'utf8', signal: options?.signal });
    } catch (error) {
      this.#deps.warn(`cannot read ${SKILL_FILE}: ${error.message}`);
      return undefined;
    }

    let document;
    try {
      document = parseSkillDocument(raw);
    } catch (error) {
      this.#deps.warn(`skill file ${SKILL_FILE} ignored: ${error.message}`);
      return undefined;
    }

    if (document.name !== candidate?.name) {
      this.#deps.warn(
        `skill file ${SKILL_FILE}: frontmatter name is "${document.name}", requested "${candidate?.name}"; selection dropped`,
      );
      return undefined;
    }

    return {
      name: document.name,
      description: document.description,
      invocation: document.invocation,
      provider: this.name,
      source: candidate.source ?? 'bundled',
      resourceBase: { kind: 'directory', path: PACKAGE_ROOT },
      path: SKILL_FILE,
      metadata: document.metadata,
      content: document.content,
    };
  }
}

/**
 * Cordis plugin body: register the bundled skill on `ctx.skills`.
 *
 * @returns a disposer that unregisters the provider when this plugin unloads.
 */
export function apply(ctx, config = {}) {
  if (typeof config.providerName !== 'undefined' && typeof config.providerName !== 'string') {
    throw new TypeError('code-ownership-audit: "providerName" must be a string');
  }
  const providerName = (config.providerName ?? DEFAULT_PROVIDER_NAME).trim();
  if (providerName.length === 0) {
    throw new TypeError('code-ownership-audit: "providerName" must be a non-empty string');
  }

  const deps = {
    warn: (message) => {
      ctx.logger?.warn?.(`code-ownership-audit: ${message}`);
    },
  };

  return ctx.skills.registerProvider(() => new CodeOwnershipAuditSkillProvider(providerName, deps));
}
