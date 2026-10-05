import type { Language, Level } from "./types";

/**
 * Canonical list of grammar rule ids and titles. Grammar rules (data/grammar/*)
 * must cover exactly these ids; writing tasks reference them by id.
 */
export interface GrammarTopic {
  id: string;
  language: Language;
  level: Level;
  title: string;
}

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  // ---------------- Russian ----------------
  { id: "ru-g01", language: "ru", level: "beginner", title: "Gender of nouns: он, она, оно" },
  { id: "ru-g02", language: "ru", level: "beginner", title: "Present tense: first conjugation (читать, знать)" },
  { id: "ru-g03", language: "ru", level: "beginner", title: "Present tense: second conjugation (говорить, любить)" },
  { id: "ru-g04", language: "ru", level: "beginner", title: "No 'to be' in the present: Я студент" },
  { id: "ru-g05", language: "ru", level: "beginner", title: "Plural of nouns: -ы, -и, -а, -я" },
  { id: "ru-g06", language: "ru", level: "beginner", title: "Accusative case for direct objects" },
  { id: "ru-g07", language: "ru", level: "beginner", title: "Prepositional case for location: в / на + -е" },
  { id: "ru-g08", language: "ru", level: "beginner", title: "Possessives: мой, моя, моё, мои" },
  { id: "ru-g09", language: "ru", level: "beginner", title: "Adjective agreement: новый, новая, новое, новые" },
  { id: "ru-g10", language: "ru", level: "beginner", title: "Past tense: -л, -ла, -ло, -ли" },
  { id: "ru-g11", language: "ru", level: "intermediate", title: "Genitive case: possession and нет + genitive" },
  { id: "ru-g12", language: "ru", level: "intermediate", title: "Genitive after numbers: 2–4 vs 5+" },
  { id: "ru-g13", language: "ru", level: "intermediate", title: "Dative case: indirect objects and age" },
  { id: "ru-g14", language: "ru", level: "intermediate", title: "Instrumental case: с + instrumental and professions" },
  { id: "ru-g15", language: "ru", level: "intermediate", title: "Verbal aspect: imperfective vs perfective" },
  { id: "ru-g16", language: "ru", level: "intermediate", title: "Future tense: буду + imperfective, perfective future" },
  { id: "ru-g17", language: "ru", level: "intermediate", title: "Verbs of motion: идти / ходить, ехать / ездить" },
  { id: "ru-g18", language: "ru", level: "intermediate", title: "Reflexive verbs with -ся: учиться, нравиться" },
  { id: "ru-g19", language: "ru", level: "intermediate", title: "Imperative: скажи / скажите" },
  { id: "ru-g20", language: "ru", level: "intermediate", title: "Time expressions: в + accusative, на + prepositional" },
  { id: "ru-g21", language: "ru", level: "advanced", title: "Conditional mood with бы" },
  { id: "ru-g22", language: "ru", level: "advanced", title: "Prefixed verbs of motion: при-, у-, вы-, по-" },
  { id: "ru-g23", language: "ru", level: "advanced", title: "Comparatives and superlatives: быстрее, самый" },
  { id: "ru-g24", language: "ru", level: "advanced", title: "Short-form adjectives: рад, занят, должен" },
  { id: "ru-g25", language: "ru", level: "advanced", title: "Active participles: читающий, прочитавший" },
  { id: "ru-g26", language: "ru", level: "advanced", title: "Verbal adverbs: читая, прочитав" },
  { id: "ru-g27", language: "ru", level: "advanced", title: "Reported speech and чтобы clauses" },
  { id: "ru-g28", language: "ru", level: "advanced", title: "Impersonal constructions: мне холодно, надо, можно, нельзя" },
  { id: "ru-g29", language: "ru", level: "advanced", title: "Relative clauses with который" },
  { id: "ru-g30", language: "ru", level: "advanced", title: "Passive constructions and -ся passives" },
  // ---------------- Spanish ----------------
  { id: "es-g01", language: "es", level: "beginner", title: "Gender and articles: el / la, un / una" },
  { id: "es-g02", language: "es", level: "beginner", title: "Present tense: regular -ar verbs" },
  { id: "es-g03", language: "es", level: "beginner", title: "Present tense: regular -er and -ir verbs" },
  { id: "es-g04", language: "es", level: "beginner", title: "Ser vs estar: the basics" },
  { id: "es-g05", language: "es", level: "beginner", title: "Plural of nouns and adjectives" },
  { id: "es-g06", language: "es", level: "beginner", title: "Adjective agreement and position" },
  { id: "es-g07", language: "es", level: "beginner", title: "Tener and tener que" },
  { id: "es-g08", language: "es", level: "beginner", title: "Ir a + infinitive: the near future" },
  { id: "es-g09", language: "es", level: "beginner", title: "Gustar and verbs like it" },
  { id: "es-g10", language: "es", level: "beginner", title: "Question words: qué, dónde, cuándo, cómo, por qué" },
  { id: "es-g11", language: "es", level: "intermediate", title: "Preterite: regular verbs" },
  { id: "es-g12", language: "es", level: "intermediate", title: "Preterite: irregular verbs (fui, tuve, hice)" },
  { id: "es-g13", language: "es", level: "intermediate", title: "Imperfect tense and its uses" },
  { id: "es-g14", language: "es", level: "intermediate", title: "Preterite vs imperfect" },
  { id: "es-g15", language: "es", level: "intermediate", title: "Direct and indirect object pronouns: lo, la, le" },
  { id: "es-g16", language: "es", level: "intermediate", title: "Reflexive verbs and daily routine" },
  { id: "es-g17", language: "es", level: "intermediate", title: "Stem-changing verbs: e→ie, o→ue, e→i" },
  { id: "es-g18", language: "es", level: "intermediate", title: "Por vs para" },
  { id: "es-g19", language: "es", level: "intermediate", title: "Comparatives and superlatives" },
  { id: "es-g20", language: "es", level: "intermediate", title: "Informal commands: tú imperative, affirmative and negative" },
  { id: "es-g21", language: "es", level: "advanced", title: "Present subjunctive: forms and triggers (querer que)" },
  { id: "es-g22", language: "es", level: "advanced", title: "Subjunctive with doubt, emotion and impersonal expressions" },
  { id: "es-g23", language: "es", level: "advanced", title: "Subjunctive in adverbial clauses: cuando, para que, aunque" },
  { id: "es-g24", language: "es", level: "advanced", title: "Conditional tense and polite requests" },
  { id: "es-g25", language: "es", level: "advanced", title: "Future tense and probability" },
  { id: "es-g26", language: "es", level: "advanced", title: "Present perfect and past perfect: he hecho, había hecho" },
  { id: "es-g27", language: "es", level: "advanced", title: "Si clauses: imperfect subjunctive + conditional" },
  { id: "es-g28", language: "es", level: "advanced", title: "Impersonal se and passive se" },
  { id: "es-g29", language: "es", level: "advanced", title: "Relative pronouns: que, quien, el que, cuyo" },
  { id: "es-g30", language: "es", level: "advanced", title: "Formal commands: usted / ustedes imperative" },
];

export function grammarTopicsFor(language: Language, level?: Level): GrammarTopic[] {
  return GRAMMAR_TOPICS.filter((t) => t.language === language && (!level || t.level === level));
}
