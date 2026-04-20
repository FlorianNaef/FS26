// .github/scripts/translate-llm-hunk.js
//
// LLM-based LaTeX translation via Azure OpenAI — patch-based approach.
//
// Strategy:
//   1. Parse `git diff HEAD~1 HEAD` into structured hunks per .tex file
//   2. For each hunk, send added lines to the LLM with surrounding context
//      so it understands the LaTeX environment, but only translate added lines
//   3. Reconstruct a context-free patch (no -C lines) using the translated text
//   4. Fetch the target branch file, write it to a temp file, apply the patch
//   5. Push the patched file back to the target branch via GitHub API
//
// Why context-free patches?
//   The target branch file has previously translated content. If we include
//   context lines in the patch they must match the target file exactly —
//   they won't, because the context lines are German while the target is Italian
//   (or vice versa). Stripping context (-U0) and using --unidiff-zero in
//   git apply sidesteps this entirely. Insertions/deletions are addressed
//   purely by line number, which is stable as long as no concurrent edits
//   desync the branches. (A future safeguard could detect this and fall back
//   to a full-file rewrite.)

import { execFileSync, execSync } from "child_process";
import fs from "fs";
import fetch from "node-fetch";
import os from "os";
import path from "path";

// ─── Config ───────────────────────────────────────────────────────────────────

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;
const AZURE_OPENAI_API_VERSION = "2024-02-01";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.REPO;
const SOURCE_BRANCH = process.env.SOURCE_BRANCH;
const TARGET_BRANCH = SOURCE_BRANCH === "main" ? "ital" : "main";
const FROM_LANG = SOURCE_BRANCH === "main" ? "German" : "Italian";
const TO_LANG = SOURCE_BRANCH === "main" ? "Italian" : "German";

// ─── Diff parsing ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} DiffLine
 * @property {'context'|'added'|'removed'} type
 * @property {string} text  - raw line content (without the leading +/-/ )
 */

/**
 * @typedef {Object} Hunk
 * @property {number} srcStart   - 1-based start line in old file
 * @property {number} srcCount   - line count in old file
 * @property {number} dstStart   - 1-based start line in new file
 * @property {number} dstCount   - line count in new file
 * @property {DiffLine[]} lines
 */

/**
 * @typedef {Object} FileDiff
 * @property {string}  filePath
 * @property {Hunk[]}  hunks
 */

/**
 * Runs `git diff -U3 HEAD~1 HEAD -- *.tex` and parses the output into
 * structured FileDiff objects.
 *
 * We keep 3 lines of context (U3) purely for the LLM prompt — we strip
 * them back out when building the patch.
 */
function getStructuredDiff() {
  let raw;
  try {
    raw = execSync("git diff -U3 HEAD~1 HEAD -- '*.tex'", { encoding: "utf8" });
  } catch (e) {
    raw = e.stdout ?? "";
  }

  if (!raw.trim()) return [];

  const fileDiffs = [];
  let currentFile = null;
  let currentHunk = null;

  for (const line of raw.split("\n")) {
    if (line.startsWith("diff --git ")) {
      if (currentFile) fileDiffs.push(currentFile);
      currentFile = null;
      currentHunk = null;
      continue;
    }

    if (line.startsWith("+++ b/")) {
      const filePath = line.slice(6);
      if (filePath.endsWith(".tex")) {
        currentFile = { filePath, hunks: [] };
      }
      continue;
    }

    if (
      line.startsWith("--- ") ||
      line.startsWith("index ") ||
      line.startsWith("new file") ||
      line.startsWith("deleted file") ||
      line.startsWith("Binary")
    )
      continue;

    if (!currentFile) continue;

    // Hunk header: @@ -srcStart,srcCount +dstStart,dstCount @@
    const hunkMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    if (hunkMatch) {
      currentHunk = {
        srcStart: parseInt(hunkMatch[1]),
        srcCount: hunkMatch[2] !== undefined ? parseInt(hunkMatch[2]) : 1,
        dstStart: parseInt(hunkMatch[3]),
        dstCount: hunkMatch[4] !== undefined ? parseInt(hunkMatch[4]) : 1,
        lines: [],
      };
      currentFile.hunks.push(currentHunk);
      continue;
    }

    if (!currentHunk) continue;

    if (line.startsWith("+"))
      currentHunk.lines.push({ type: "added", text: line.slice(1) });
    else if (line.startsWith("-"))
      currentHunk.lines.push({ type: "removed", text: line.slice(1) });
    else if (line.startsWith(" "))
      currentHunk.lines.push({ type: "context", text: line.slice(1) });
    // Lines starting with '\' are git messages ("\ No newline at end of file") — ignore
  }

  if (currentFile) fileDiffs.push(currentFile);

  return fileDiffs.filter((f) => fs.existsSync(f.filePath));
}

// ─── LaTeX line classification ────────────────────────────────────────────────

/**
 * Returns true for lines that are pure LaTeX structure with no prose to
 * translate. These are sent to the LLM with translate:false so it returns
 * them unchanged.
 */
function isStructuralLine(line) {
  const t = line.trim();
  if (t === "") return true;
  if (t.startsWith("%")) return true;
  if (/^\\begin\{/.test(t)) return true;
  if (/^\\end\{/.test(t)) return true;
  if (
    /^\\(documentclass|usepackage|newcommand|renewcommand|setlength|geometry|pagestyle|bibliographystyle|bibliography)\b/.test(
      t,
    )
  )
    return true;
  if (/^\\[a-zA-Z]+(\[[^\]]*\])?(\{[^}]*\})*\s*$/.test(t)) return true;
  return false;
}

// ─── LLM translation ──────────────────────────────────────────────────────────

/**
 * Translates the added lines of a single hunk.
 *
 * @param {Object}   params
 * @param {string[]} params.contextBefore  - context lines before the hunk (for the prompt only)
 * @param {string[]} params.addedLines     - lines to translate
 * @param {string[]} params.contextAfter   - context lines after the hunk (for the prompt only)
 * @returns {Promise<string[]>} translated lines, same length and order as addedLines
 */
async function llmTranslateHunk({ contextBefore, addedLines, contextAfter }) {
  if (addedLines.length === 0) return [];

  const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;

  const inputEntries = addedLines.map((line, idx) => ({
    index: idx,
    text: line,
    translate: !isStructuralLine(line),
  }));

  const inputJson = JSON.stringify(inputEntries, null, 2);

  const contextBeforeStr = contextBefore.length
    ? contextBefore.map((l) => `  ${l}`).join("\n")
    : "(start of file or hunk)";
  const contextAfterStr = contextAfter.length
    ? contextAfter.map((l) => `  ${l}`).join("\n")
    : "(end of file or hunk)";

  const systemPrompt = `\
You are a precise academic translator specialising in LaTeX documents.
You will receive a JSON array of lines from a LaTeX university summary document \
that were just added or modified in a git commit. Each entry has an "index", "text", and "translate" field.

Your task:
- For entries where "translate" is true: translate the prose from ${FROM_LANG} to ${TO_LANG}.
- For entries where "translate" is false: return the "text" field exactly unchanged.

Rules you must follow without exception:
1. Return ONLY a valid JSON array. No explanation, no markdown fences, no preamble.
2. The output array must have exactly the same number of elements as the input, \
   in the same order, each with "index" and "text" fields only.
3. Preserve every LaTeX command, macro, environment name, and argument character-for-character.
4. Preserve all inline and display math expressions ($...$, $$...$$, \\[...\\]) exactly.
5. Preserve all whitespace and indentation within each line.
6. Translate academic/technical terms accurately; do not paraphrase or simplify.
7. Do not merge, split, or reorder lines under any circumstance.`;

  const userPrompt = `\
The following lines appear in this LaTeX context (shown for reference only — do NOT translate these):

[Lines before for context]:
${contextBeforeStr}

[Lines to process]:
${inputJson}

[Lines after for context]:
${contextAfterStr}

Return the translated JSON array now.`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": AZURE_OPENAI_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 4096,
      response_format: { type: "text" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Azure OpenAI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();

  // Strip accidental markdown fences defensively
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed;
  try {
    const maybeWrapped = JSON.parse(cleaned);
    // json_object mode may wrap the array — unwrap it
    parsed = Array.isArray(maybeWrapped)
      ? maybeWrapped
      : (maybeWrapped.lines ??
        maybeWrapped.result ??
        Object.values(maybeWrapped)[0]);
  } catch (e) {
    throw new Error(
      `LLM returned invalid JSON:\n${raw}\n\nParse error: ${e.message}`,
    );
  }

  if (!Array.isArray(parsed) || parsed.length !== addedLines.length) {
    throw new Error(
      `LLM returned wrong number of lines. Expected ${addedLines.length}, got ${parsed?.length}.\nRaw: ${raw}`,
    );
  }

  parsed.sort((a, b) => a.index - b.index);
  return parsed.map((entry) => entry.text);
}

// ─── Patch construction ───────────────────────────────────────────────────────

/**
 * Builds a context-free (-U0 style) unified diff patch from translated hunks.
 *
 * Context lines are stripped so that git apply --unidiff-zero can apply the
 * patch to the target branch file even though its content is in a different
 * language (so context lines wouldn't match anyway).
 *
 * @param {string} filePath
 * @param {Hunk[]} hunks  - with added lines already replaced by translations
 * @returns {string}
 */
function buildPatch(filePath, hunks) {
  const lines = [];
  lines.push(`--- a/${filePath}`);
  lines.push(`+++ b/${filePath}`);

  for (const hunk of hunks) {
    const removedLines = hunk.lines.filter((l) => l.type === "removed");
    const addedLines = hunk.lines.filter((l) => l.type === "added");

    if (removedLines.length === 0 && addedLines.length === 0) continue;

    // Count context lines that appear before the first non-context line.
    // We need to offset the hunk start position accordingly.
    let contextBeforeCount = 0;
    for (const line of hunk.lines) {
      if (line.type === "context") contextBeforeCount++;
      else break;
    }

    // For pure insertions (no removed lines), git uses the line number
    // *after which* the insertion happens: @@ -N,0 +N+1,M @@
    // For mixed/removal hunks, we address the first affected source line.
    const srcStart =
      removedLines.length > 0
        ? hunk.srcStart + contextBeforeCount
        : Math.max(0, hunk.srcStart + contextBeforeCount - 1);

    const dstStart = hunk.dstStart + contextBeforeCount;

    const srcCount = removedLines.length;
    const dstCount = addedLines.length;

    // Unified diff convention for 0-count sides: @@ -N,0 +N,0 @@
    const srcPart = `${srcStart},${srcCount}`;
    const dstPart = `${dstStart},${dstCount}`;

    lines.push(`@@ -${srcPart} +${dstPart} @@`);

    for (const l of hunk.lines) {
      if (l.type === "removed") lines.push(`-${l.text}`);
      if (l.type === "added") lines.push(`+${l.text}`);
      // context lines deliberately omitted
    }
  }

  return lines.join("\n") + "\n";
}

// ─── New file handling ────────────────────────────────────────────────────────

/**
 * When a .tex file is new (doesn't exist on the target branch yet),
 * translate its entire content in one shot and push it as a new file.
 */
async function handleNewFile(filePath) {
  console.log(`New file — translating entire content.`);
  const sourceLines = fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .filter((line, i, arr) => !(i === arr.length - 1 && line === ""));

  const translated = await llmTranslateHunk({
    contextBefore: [],
    addedLines: sourceLines,
    contextAfter: [],
  });

  return translated.join("\n");
}

// ─── GitHub API helpers ───────────────────────────────────────────────────────

async function getFileFromTargetBranch(filePath) {
  const url = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(filePath)}?ref=${TARGET_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(
      `GitHub API error fetching ${filePath} from ${TARGET_BRANCH}: ${res.status}`,
    );

  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf8");
  return { content, sha: data.sha };
}

async function pushFileToTargetBranch(filePath, newContent, existingSha) {
  const url = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(filePath)}`;
  const body = {
    message: `[skip ci] Auto-translate ${filePath} (${FROM_LANG} → ${TO_LANG})`,
    content: Buffer.from(newContent, "utf8").toString("base64"),
    branch: TARGET_BRANCH,
    ...(existingSha ? { sha: existingSha } : {}),
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `GitHub API error pushing ${filePath}: ${res.status} ${err}`,
    );
  }
}

// ─── Core per-file logic ──────────────────────────────────────────────────────

async function processFile(fileDiff) {
  const { filePath, hunks } = fileDiff;
  console.log(`\nProcessing: ${filePath} (${hunks.length} hunk(s))`);

  // Fetch the target branch version first — we need to know if it exists
  const targetFile = await getFileFromTargetBranch(filePath);

  // If the file is brand new, handle separately (no patch to apply)
  if (!targetFile) {
    const newContent = await handleNewFile(filePath);
    await pushFileToTargetBranch(filePath, newContent, null);
    console.log(`  ✓ Created on ${TARGET_BRANCH}`);
    return;
  }

  // Translate each hunk's added lines
  const translatedHunks = [];

  for (let h = 0; h < hunks.length; h++) {
    const hunk = hunks[h];

    // Separate context before/after from the actual change block
    const firstNonContext = hunk.lines.findIndex((l) => l.type !== "context");
    const lastNonContextRev = [...hunk.lines]
      .reverse()
      .findIndex((l) => l.type !== "context");

    // If there are no non-context lines, skip this hunk entirely
    if (firstNonContext === -1) {
      console.log(`  Hunk ${h + 1}: no added/removed lines, skipping.`);
      translatedHunks.push(hunk);
      continue;
    }

    const lastNonContext = hunk.lines.length - 1 - lastNonContextRev;

    const contextBefore = hunk.lines
      .slice(0, firstNonContext)
      .map((l) => l.text);
    const contextAfter = hunk.lines
      .slice(lastNonContext + 1)
      .map((l) => l.text);
    const addedLines = hunk.lines
      .filter((l) => l.type === "added")
      .map((l) => l.text);

    const removedCount = hunk.lines.filter((l) => l.type === "removed").length;
    console.log(
      `  Hunk ${h + 1}: +${addedLines.length} added, -${removedCount} removed`,
    );

    let translatedAdded;
    if (addedLines.length > 0) {
      translatedAdded = await llmTranslateHunk({
        contextBefore,
        addedLines,
        contextAfter,
      });
    } else {
      translatedAdded = [];
    }

    // Rebuild hunk lines with translations spliced in
    let addedIdx = 0;
    const newHunkLines = hunk.lines.map((l) => {
      if (l.type === "added")
        return { type: "added", text: translatedAdded[addedIdx++] };
      return l;
    });

    translatedHunks.push({ ...hunk, lines: newHunkLines });
  }

  // Build context-free patch
  const patch = buildPatch(filePath, translatedHunks);
  console.log(
    `  Patch:\n${patch
      .split("\n")
      .map((l) => "    " + l)
      .join("\n")}`,
  );

  // Write target file to temp dir and apply patch
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "latex-translate-"));
  const tmpFile = path.join(tmpDir, path.basename(filePath));
  const patchFile = path.join(tmpDir, "changes.patch");

  fs.writeFileSync(tmpFile, targetFile.content, "utf8");
  fs.writeFileSync(patchFile, patch, "utf8");

  try {
    execFileSync(
      "git",
      [
        "apply",
        "--unidiff-zero", // allow context-free (@@ -N,0 @@) patches
        "--inaccurate-eof", // tolerate missing trailing newline
        "--whitespace=nowarn", // suppress whitespace warnings
        patchFile,
      ],
      {
        cwd: tmpDir,
        encoding: "utf8",
      },
    );
  } catch (e) {
    console.error("  git apply failed. Patch:\n", patch);
    console.error("  stderr:", e.stderr);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    throw new Error(`git apply failed for ${filePath}: ${e.message}`);
  }

  const finalContent = fs.readFileSync(tmpFile, "utf8");
  fs.rmSync(tmpDir, { recursive: true, force: true });

  await pushFileToTargetBranch(filePath, finalContent, targetFile.sha);
  console.log(`  ✓ Pushed to ${TARGET_BRANCH}`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  if (!AZURE_OPENAI_ENDPOINT)
    throw new Error("AZURE_OPENAI_ENDPOINT secret is not set.");
  if (!AZURE_OPENAI_KEY) throw new Error("AZURE_OPENAI_KEY secret is not set.");
  if (!AZURE_OPENAI_DEPLOYMENT)
    throw new Error("AZURE_OPENAI_DEPLOYMENT secret is not set.");
  if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is not available.");

  const fileDiffs = getStructuredDiff();

  if (fileDiffs.length === 0) {
    console.log("No .tex file changes detected, nothing to do.");
    return;
  }

  console.log(
    `Source: ${SOURCE_BRANCH} (${FROM_LANG}) → Target: ${TARGET_BRANCH} (${TO_LANG})`,
  );
  console.log(`Model: ${AZURE_OPENAI_DEPLOYMENT}`);
  console.log(
    `Files with changes: ${fileDiffs.map((f) => f.filePath).join(", ")}`,
  );

  for (const fileDiff of fileDiffs) {
    await processFile(fileDiff);
  }

  console.log("\nAll done.");
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
