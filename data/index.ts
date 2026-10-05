import type { ConversationScenario, GrammarRule, Language, Level, VocabContent, WritingTask } from "./types";

/** All content for one language, loaded lazily so only the active language ships to the client. */
export interface LanguageContent {
  language: Language;
  vocab: VocabContent[];
  vocabById: Map<string, VocabContent>;
  scenarios: Record<Level, ConversationScenario[]>;
  scenarioById: Map<string, ConversationScenario>;
  writing: Record<Level, WritingTask[]>;
  taskById: Map<string, WritingTask>;
  grammar: GrammarRule[];
  ruleById: Map<string, GrammarRule>;
}

function build(
  language: Language,
  vocab: VocabContent[][],
  scenarios: [ConversationScenario[], ConversationScenario[], ConversationScenario[]],
  writing: [WritingTask[], WritingTask[], WritingTask[]],
  grammar: GrammarRule[],
): LanguageContent {
  const allVocab = vocab.flat();
  const sc = { beginner: scenarios[0], intermediate: scenarios[1], advanced: scenarios[2] };
  const wr = { beginner: writing[0], intermediate: writing[1], advanced: writing[2] };
  return {
    language,
    vocab: allVocab,
    vocabById: new Map(allVocab.map((v) => [v.id, v])),
    scenarios: sc,
    scenarioById: new Map(Object.values(sc).flat().map((s) => [s.id, s])),
    writing: wr,
    taskById: new Map(Object.values(wr).flat().map((w) => [w.id, w])),
    grammar,
    ruleById: new Map(grammar.map((g) => [g.id, g])),
  };
}

const cache: Partial<Record<Language, Promise<LanguageContent>>> = {};

export function loadContent(language: Language): Promise<LanguageContent> {
  if (!cache[language]) {
    cache[language] = language === "ru" ? loadRu() : loadEs();
  }
  return cache[language]!;
}

async function loadRu(): Promise<LanguageContent> {
  const [vb, vi, va, sb, si, sa, wb, wi, wa, g] = await Promise.all([
    import("./vocab/ru-beginner"),
    import("./vocab/ru-intermediate"),
    import("./vocab/ru-advanced"),
    import("./scenarios/ru-beginner"),
    import("./scenarios/ru-intermediate"),
    import("./scenarios/ru-advanced"),
    import("./writing/ru-beginner"),
    import("./writing/ru-intermediate"),
    import("./writing/ru-advanced"),
    import("./grammar/ru"),
  ]);
  return build("ru", [vb.default, vi.default, va.default], [sb.default, si.default, sa.default], [wb.default, wi.default, wa.default], g.default);
}

async function loadEs(): Promise<LanguageContent> {
  const [vb, vi, va, sb, si, sa, wb, wi, wa, g] = await Promise.all([
    import("./vocab/es-beginner"),
    import("./vocab/es-intermediate"),
    import("./vocab/es-advanced"),
    import("./scenarios/es-beginner"),
    import("./scenarios/es-intermediate"),
    import("./scenarios/es-advanced"),
    import("./writing/es-beginner"),
    import("./writing/es-intermediate"),
    import("./writing/es-advanced"),
    import("./grammar/es"),
  ]);
  return build("es", [vb.default, vi.default, va.default], [sb.default, si.default, sa.default], [wb.default, wi.default, wa.default], g.default);
}

export const LANGUAGE_META: Record<Language, { name: string; native: string; flag: string; locale: string; sample: Record<Level, string> }> = {
  ru: {
    name: "Russian",
    native: "Русский",
    flag: "🇷🇺",
    locale: "ru-RU",
    sample: {
      beginner: "Привет! Меня зовут Сэм.",
      intermediate: "Вчера я встретился с друзьями в кафе.",
      advanced: "Если бы у меня было больше времени, я бы читал больше.",
    },
  },
  es: {
    name: "Spanish",
    native: "Español",
    flag: "🇪🇸",
    locale: "es-ES",
    sample: {
      beginner: "¡Hola! Me llamo Sam.",
      intermediate: "Ayer quedé con mis amigos en un café.",
      advanced: "Si tuviera más tiempo, leería mucho más.",
    },
  },
};

export const LEVEL_META: Record<Level, { name: string; cefr: string; blurb: string }> = {
  beginner: { name: "Beginner", cefr: "A1", blurb: "You know a few words and want to say your first real sentences." },
  intermediate: { name: "Intermediate", cefr: "A2–B1", blurb: "You can get by, but you freeze when the conversation goes off-script." },
  advanced: { name: "Advanced", cefr: "B1+", blurb: "You can talk, but you want to sound natural and argue a point." },
};
