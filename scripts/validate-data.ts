/**
 * Validates a single seed data file (or all of them).
 * Usage: npx tsx scripts/validate-data.ts data/vocab/ru-beginner.ts
 *        npx tsx scripts/validate-data.ts            (validates everything present)
 */
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { GRAMMAR_TOPICS } from "../data/grammar-topics";
import type { ConversationScenario, GrammarRule, Language, Level, VocabContent, WritingTask } from "../data/types";

const CYRILLIC = /[Ѐ-ӿ]/;
const LATIN = /[A-Za-z]/;

type Kind = "vocab" | "scenarios" | "writing" | "grammar";

const problems: string[] = [];
const warnings: string[] = [];
function fail(file: string, msg: string) {
  problems.push(`${file}: ${msg}`);
}
function warn(file: string, msg: string) {
  warnings.push(`${file}: ${msg}`);
}

function checkTargetText(file: string, lang: Language, text: string, where: string) {
  if (!text || !text.trim()) return fail(file, `${where}: empty target-language text`);
  if (lang === "ru") {
    if (!CYRILLIC.test(text)) fail(file, `${where}: Russian text has no Cyrillic: "${text}"`);
    // Allow Latin only inside brand names etc. — flag if more than 2 Latin letters in a row.
    if (/[A-Za-z]{3,}/.test(text)) fail(file, `${where}: Russian text contains Latin word: "${text}"`);
  } else {
    if (CYRILLIC.test(text)) fail(file, `${where}: Spanish text contains Cyrillic: "${text}"`);
    if (!LATIN.test(text)) fail(file, `${where}: Spanish text has no letters: "${text}"`);
  }
}

function parseMeta(file: string): { kind: Kind; lang: Language; level?: Level } | null {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
  const m = rel.match(/^data\/(vocab|scenarios|writing|grammar)\/(ru|es)(?:-(beginner|intermediate|advanced))?\.ts$/);
  if (!m) return null;
  return { kind: m[1] as Kind, lang: m[2] as Language, level: m[3] as Level | undefined };
}

async function validateFile(file: string) {
  const meta = parseMeta(file);
  if (!meta) {
    fail(file, "not a recognised data file name");
    return;
  }
  const mod = await import(pathToFileURL(file).href);
  const arr = mod.default as unknown;
  if (!Array.isArray(arr)) return fail(file, "default export must be an array");
  const { kind, lang, level } = meta;
  const ids = new Set<string>();

  if (kind === "vocab") {
    const words = new Set<string>();
    if (arr.length !== 100) fail(file, `expected 100 vocab items, got ${arr.length}`);
    (arr as VocabContent[]).forEach((c, i) => {
      const where = `item ${i} (${c.id})`;
      if (!/^(ru|es)-v-(beginner|intermediate|advanced)-\d{3}$/.test(c.id)) fail(file, `${where}: bad id format`);
      if (ids.has(c.id)) fail(file, `${where}: duplicate id`);
      ids.add(c.id);
      if (c.language !== lang) fail(file, `${where}: language should be ${lang}`);
      if (c.level !== level) fail(file, `${where}: level should be ${level}`);
      const key = c.word.toLowerCase();
      if (words.has(key)) fail(file, `${where}: duplicate word "${c.word}"`);
      words.add(key);
      checkTargetText(file, lang, c.word, `${where}.word`);
      checkTargetText(file, lang, c.example, `${where}.example`);
      checkTargetText(file, lang, c.audioText, `${where}.audioText`);
      if (!c.translation?.trim()) fail(file, `${where}: missing translation`);
      if (!c.exampleTranslation?.trim()) fail(file, `${where}: missing exampleTranslation`);
      if (!Array.isArray(c.tags) || c.tags.length < 1) fail(file, `${where}: needs at least one tag`);
      const stem = c.word.toLowerCase().replace(/^(el|la|los|las|un|una) /, "").slice(0, 3);
      if (!c.example.toLowerCase().includes(stem))
        warn(file, `${where}: example may not contain the word "${c.word}" (ok if it is an inflected form)`);
    });
  }

  if (kind === "scenarios") {
    if (arr.length !== 40) fail(file, `expected 40 scenarios, got ${arr.length}`);
    (arr as ConversationScenario[]).forEach((s, i) => {
      const where = `item ${i} (${s.id})`;
      if (!/^(ru|es)-s-(beginner|intermediate|advanced)-\d{2}$/.test(s.id)) fail(file, `${where}: bad id format`);
      if (ids.has(s.id)) fail(file, `${where}: duplicate id`);
      ids.add(s.id);
      if (s.language !== lang) fail(file, `${where}: language should be ${lang}`);
      if (s.level !== level) fail(file, `${where}: level should be ${level}`);
      if (!s.title?.trim()) fail(file, `${where}: missing title`);
      if (!s.goal?.trim()) fail(file, `${where}: missing goal`);
      checkTargetText(file, lang, s.opening, `${where}.opening`);
      if (!s.openingTranslation?.trim()) fail(file, `${where}: missing openingTranslation`);
      if (!Array.isArray(s.targetWords) || s.targetWords.length < 5 || s.targetWords.length > 8)
        fail(file, `${where}: targetWords must have 5-8 entries (has ${s.targetWords?.length})`);
      s.targetWords?.forEach((w, j) => checkTargetText(file, lang, w, `${where}.targetWords[${j}]`));
      if (!Array.isArray(s.exampleTurns) || s.exampleTurns.length !== 3)
        fail(file, `${where}: exampleTurns must have exactly 3 entries (has ${s.exampleTurns?.length})`);
      s.exampleTurns?.forEach((t, j) => {
        checkTargetText(file, lang, t.user, `${where}.exampleTurns[${j}].user`);
        checkTargetText(file, lang, t.tutor, `${where}.exampleTurns[${j}].tutor`);
        if (!t.note?.trim()) fail(file, `${where}.exampleTurns[${j}]: missing note`);
      });
    });
  }

  if (kind === "writing") {
    if (arr.length !== 30) fail(file, `expected 30 writing tasks, got ${arr.length}`);
    const validRules = new Set(
      GRAMMAR_TOPICS.filter((t) => t.language === lang && t.level === level).map((t) => t.id),
    );
    const ruleUse = new Map<string, number>();
    (arr as WritingTask[]).forEach((w, i) => {
      const where = `item ${i} (${w.id})`;
      if (!/^(ru|es)-w-(beginner|intermediate|advanced)-\d{2}$/.test(w.id)) fail(file, `${where}: bad id format`);
      if (ids.has(w.id)) fail(file, `${where}: duplicate id`);
      ids.add(w.id);
      if (w.language !== lang) fail(file, `${where}: language should be ${lang}`);
      if (w.level !== level) fail(file, `${where}: level should be ${level}`);
      if (!validRules.has(w.grammarRuleId))
        fail(file, `${where}: grammarRuleId "${w.grammarRuleId}" is not a ${lang}/${level} rule`);
      ruleUse.set(w.grammarRuleId, (ruleUse.get(w.grammarRuleId) ?? 0) + 1);
      if (!w.instruction?.trim()) fail(file, `${where}: missing instruction`);
      if (!w.grammarFocus?.trim()) fail(file, `${where}: missing grammarFocus`);
      if (!Array.isArray(w.sentences) || w.sentences.length < 3 || w.sentences.length > 5)
        fail(file, `${where}: sentences must have 3-5 entries (has ${w.sentences?.length})`);
      w.sentences?.forEach((s, j) => {
        if (!s.prompt?.trim()) fail(file, `${where}.sentences[${j}]: missing prompt`);
        checkTargetText(file, lang, s.model, `${where}.sentences[${j}].model`);
      });
      if (!Array.isArray(w.targetVocab) || w.targetVocab.length < 2) fail(file, `${where}: targetVocab needs 2+ entries`);
      w.targetVocab?.forEach((v, j) => checkTargetText(file, lang, v, `${where}.targetVocab[${j}]`));
    });
    for (const id of validRules) {
      if (!ruleUse.has(id)) fail(file, `grammar rule ${id} is not used by any writing task (aim for 3 each)`);
    }
  }

  if (kind === "grammar") {
    if (arr.length !== 30) fail(file, `expected 30 grammar rules, got ${arr.length}`);
    const expected = GRAMMAR_TOPICS.filter((t) => t.language === lang);
    (arr as GrammarRule[]).forEach((g, i) => {
      const where = `item ${i} (${g.id})`;
      const topic = expected.find((t) => t.id === g.id);
      if (!topic) fail(file, `${where}: id not in GRAMMAR_TOPICS`);
      else {
        if (g.level !== topic.level) fail(file, `${where}: level should be ${topic.level}`);
        if (g.title !== topic.title) fail(file, `${where}: title must exactly equal "${topic.title}"`);
      }
      if (ids.has(g.id)) fail(file, `${where}: duplicate id`);
      ids.add(g.id);
      if (g.language !== lang) fail(file, `${where}: language should be ${lang}`);
      if (!g.rule?.trim() || g.rule.length < 60) fail(file, `${where}: rule text too short`);
      if (!Array.isArray(g.examples) || g.examples.length !== 3) fail(file, `${where}: exactly 3 examples required`);
      g.examples?.forEach((e, j) => {
        checkTargetText(file, lang, e.target, `${where}.examples[${j}].target`);
        if (!e.translation?.trim()) fail(file, `${where}.examples[${j}]: missing translation`);
      });
      if (!g.writeDown?.trim()) fail(file, `${where}: missing writeDown`);
    });
    for (const t of expected) if (!ids.has(t.id)) fail(file, `missing rule ${t.id} (${t.title})`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  let files = args.map((f) => path.resolve(f));
  if (files.length === 0) {
    for (const kind of ["vocab", "scenarios", "writing", "grammar"]) {
      const dir = path.resolve("data", kind);
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir)) {
        if (f.endsWith(".ts") && f !== "index.ts") files.push(path.join(dir, f));
      }
    }
  }
  for (const f of files) {
    try {
      await validateFile(f);
    } catch (e) {
      fail(f, `failed to load: ${(e as Error).message}`);
    }
  }
  if (warnings.length) {
    console.warn(`${warnings.length} warning(s) (not fatal):`);
    for (const w of warnings.slice(0, 20)) console.warn(" ~ " + w);
  }
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const p of problems.slice(0, 80)) console.error(" - " + p);
    if (problems.length > 80) console.error(` ... and ${problems.length - 80} more`);
    process.exit(1);
  }
  console.log(`OK: ${files.length} file(s) valid`);
}

main();
