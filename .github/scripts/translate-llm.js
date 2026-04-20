// .github/scripts/translate-llm.js
// LLM-based LaTeX translation via Azure OpenAI.
// Diffs changed lines, sends them to the model with a strict prompt,
// gets back a JSON map of { lineNumber: translatedText }, splices into target branch.

import { execSync } from 'child_process';
import fs from 'fs';
import fetch from 'node-fetch';

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;   // https://<resource>.openai.azure.com
const AZURE_OPENAI_KEY      = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT; // your deployment name, e.g. "gpt-4o"
const AZURE_OPENAI_API_VERSION = '2024-02-01';

const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
const REPO          = process.env.REPO;
const SOURCE_BRANCH = process.env.SOURCE_BRANCH;
const TARGET_BRANCH = SOURCE_BRANCH === 'main' ? 'ital' : 'main';
const FROM_LANG     = SOURCE_BRANCH === 'main' ? 'German' : 'Italian';
const TO_LANG       = SOURCE_BRANCH === 'main' ? 'Italian' : 'German';

/**
 * @returns true if line should never be sent to the LLM — pure LaTeX structure
 */
function isStructuralLine(line) {
  const t = line.trim();
  if (t === '')                    return true;  // blank
  if (t.startsWith('%'))           return true;  // comment
  if (/^\\begin\{/.test(t))        return true;  // \begin{...}
  if (/^\\end\{/.test(t))          return true;  // \end{...}
  if (/^\\(documentclass|usepackage|newcommand|renewcommand|setlength|geometry|pagestyle|bibliographystyle|bibliography)\b/.test(t)) return true;
  // Lines that are *only* a LaTeX command with no surrounding prose
  if (/^\\[a-zA-Z]+(\[[^\]]*\])?(\{[^}]*\})*\s*$/.test(t)) return true;
  return false;
}

/**
 * Sends a map of { lineNumber: lineText } to the LLM.
 * @returns map of { lineNumber: translatedText }.
 */
async function llmTranslate(lineMap) {
  const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;

  const inputJson = JSON.stringify(lineMap, null, undefined);

  const systemPrompt = `You are a precise academic translator specializing in LaTeX documents.
You will receive a JSON object where each key is a line number (as a string) and each value is a line of LaTeX source from a university summary document.
Your task is to translate the prose content of each line from ${FROM_LANG} to ${TO_LANG}.
Rules you must follow without exception:
1. Return ONLY a valid JSON object. No explanation, no markdown fences, no preamble.
2. Preserve every LaTeX command, macro, environment, and argument exactly as-is. Do not translate, reorder, or modify any LaTeX syntax.
3. Preserve inline math expressions (e.g. $f'(x)$, $\\\\alpha$, $$...$$) character-for-character.
4. Preserve all whitespace, indentation, and line structure. Do not merge or split lines.
5. The output JSON must have exactly the same keys as the input JSON.
6. If a line contains no translatable prose (e.g. it is purely a LaTeX command), return it unchanged.
7. Translate academic/technical terms accurately; do not paraphrase or simplify.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': AZURE_OPENAI_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: inputJson   },
      ],
      temperature: 0, // deterministic
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Azure OpenAI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();

  // Strip markdown fences defensively, even though we asked for raw JSON
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`LLM returned invalid JSON:\n${raw}\n\nParse error: ${e.message}`);
  }

  return parsed;
}

function git(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

/**
 * @returns file names of tex files with changes in current commit.
 */
function getChangedTexFiles() {
  const output = git(`git diff --name-only HEAD~1 HEAD -- '*.tex'`);
  if (!output) return [];
  return output.split('\n').filter(f => f.endsWith('.tex') && fs.existsSync(f));
}

async function getFileFromTargetBranch(filePath) {
  const url = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(filePath)}?ref=${TARGET_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API error fetching ${filePath}: ${res.status}`);

  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return { content, sha: data.sha };
}

async function pushFileToTargetBranch(filePath, newContent, existingSha) {
  const url = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(filePath)}`;
  const body = {
    message: `[skip ci] Auto-translate ${filePath} (${FROM_LANG} to ${TO_LANG})`,
    content: Buffer.from(newContent, 'utf8').toString('base64'),
    branch: TARGET_BRANCH,
    ...(existingSha ? { sha: existingSha } : {}),
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error pushing ${filePath}: ${res.status} ${err}`);
  }
}

async function processFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);

  const newSource = fs.readFileSync(filePath, 'utf8');
  const newLines  = newSource.split('\n');

  let oldLines;
  try {
    const oldSource = git(`git show HEAD~1:${filePath}`);
    oldLines = oldSource.split('\n');
  } catch {
    console.log('  New file — treating all lines as changed.');
    oldLines = [];
  }

  const changedIndices = [];
  for (let i = 0; i < Math.max(newLines.length, oldLines.length); i++) {
    if ((newLines[i] ?? '') !== (oldLines[i] ?? '')) {
      changedIndices.push(i);
    }
  }

  if (changedIndices.length === 0) {
    console.log('  No line changes detected, skipping.');
    return;
  }
  console.log(`  Changed lines: ${changedIndices.length}`);

  // Build the map to send to the LLM
  // Keys are stringified line numbers
  const lineMapForLLM = {};
  const skippedIndices = new Set();
  for (const i of changedIndices) {
    if (i >= newLines.length) {  // TODO: check function if works as intended
      // Deleted line — handled separately below, don't send to LLM
      skippedIndices.add(i);
      continue;
    }
    if (isStructuralLine(newLines[i])) {
      skippedIndices.add(i);
      continue;
    }
    lineMapForLLM[String(i)] = newLines[i];
  }

  const translatableCount = Object.keys(lineMapForLLM).length;
  console.log(`  Sending ${translatableCount} lines to LLM (${changedIndices.length - translatableCount} structural lines skipped).`);

  // Call the LLM
  let translatedMap = {};
  if (translatableCount > 0) {
    translatedMap = await llmTranslate(lineMapForLLM);
  }

  // Validate the LLM returned all expected keys
  for (const key of Object.keys(lineMapForLLM)) {
    if (translatedMap[key] === undefined) {
      console.warn(`  Warning: LLM did not return a translation for line ${key}. Using original.`);
      translatedMap[key] = lineMapForLLM[key];
    }
  }

  // Fetch current target branch version
  const targetFile = await getFileFromTargetBranch(filePath);
  let targetLines;
  if (targetFile) {
    targetLines = targetFile.content.split('\n');
  } else {
    console.log(`  File does not exist on ${TARGET_BRANCH} yet — will create it.`);
    targetLines = [...newLines];
  }

  // Ensure target is at least as long as source
  while (targetLines.length < newLines.length) {
    targetLines.push('');
  }

  // Splice changes into target
  for (const i of changedIndices) {
    if (i >= newLines.length) {
      // Line deleted in source — blank it out in target
      if (i < targetLines.length) targetLines[i] = '';
    } else {
      const key = String(i);
      if (translatedMap[key] !== undefined) {
        // LLM-translated line
        targetLines[i] = translatedMap[key];
      } else {
        // Structural line
        targetLines[i] = newLines[i];
      }
    }
  }

  // Trim if source got shorter
  if (targetLines.length > newLines.length) {
    targetLines.length = newLines.length;
  }

  const newTargetContent = targetLines.join('\n');
  await pushFileToTargetBranch(filePath, newTargetContent, targetFile?.sha ?? null);
  console.log(`  ✓ Pushed to ${TARGET_BRANCH}`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  if (!AZURE_OPENAI_ENDPOINT)   throw new Error('AZURE_OPENAI_ENDPOINT secret is not set.');
  if (!AZURE_OPENAI_KEY)        throw new Error('AZURE_OPENAI_KEY secret is not set.');
  if (!AZURE_OPENAI_DEPLOYMENT) throw new Error('AZURE_OPENAI_DEPLOYMENT secret is not set.');
  if (!GITHUB_TOKEN)            throw new Error('GITHUB_TOKEN is not available.');

  const changedFiles = getChangedTexFiles();
  if (changedFiles.length === 0) {
    console.log('No .tex files changed, nothing to do.');
    return;
  }

  console.log(`Source: ${SOURCE_BRANCH} (${FROM_LANG}) → Target: ${TARGET_BRANCH} (${TO_LANG})`);
  console.log(`Model deployment: ${AZURE_OPENAI_DEPLOYMENT}`);
  console.log(`Changed .tex files: ${changedFiles.join(', ')}`);

  for (const file of changedFiles) {
    await processFile(file);
  }

  console.log('\nAll done.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
