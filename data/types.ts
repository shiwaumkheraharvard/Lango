/**
 * Shared content and state types for Lango.
 * Content types (VocabContent, ConversationScenario, WritingTask, GrammarRule)
 * are static seed data. State types (VocabCard SM-2 fields, DayRecord) live in
 * localStorage behind the services layer.
 */

export type Language = "ru" | "es";
export type Level = "beginner" | "intermediate" | "advanced";
export type LessonLength = 10 | 20 | 30;

export const LANGUAGES: Language[] = ["ru", "es"];
export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

// ---------- Vocabulary ----------

/** Static vocab content, authored in /data/vocab. No scheduling state. */
export interface VocabContent {
  /** e.g. "ru-v-beginner-001" */
  id: string;
  language: Language;
  level: Level;
  /** Target-language headword. Russian: Cyrillic, with stress NOT marked. Spanish: accents and ñ. */
  word: string;
  /** English translation, short. */
  translation: string;
  /** Natural target-language example sentence using the word. */
  example: string;
  /** English translation of the example sentence. */
  exampleTranslation: string;
  /** Text sent to TTS. Usually identical to `word`; may expand abbreviations. */
  audioText: string;
  /** Topic + part-of-speech tags, lowercase kebab-case. e.g. ["food", "noun"] */
  tags: string[];
}

/** SM-2 scheduling state for one card. */
export interface Sm2State {
  easeFactor: number; // starts at 2.5, floor 1.3
  interval: number; // days
  repetitions: number; // consecutive successful reviews
  dueDate: string; // ISO date YYYY-MM-DD (local)
  lastReviewed?: string; // ISO date
}

/** A vocab card = content + SM-2 state. */
export type VocabCard = VocabContent & Sm2State;

/** Quality grade 0-5 per SM-2. The UI exposes Again=1, Hard=3, Good=4, Easy=5. */
export type Sm2Grade = 0 | 1 | 2 | 3 | 4 | 5;

// ---------- Conversation ----------

export interface ExampleTurn {
  /** What a learner might plausibly say at this point, in the target language. */
  user: string;
  /** The tutor's reply, in the target language. One short sentence or question. */
  tutor: string;
  /** Tiny English side-note for the tutor turn: one correction max, or praise. */
  note: string;
}

export interface ConversationScenario {
  /** e.g. "ru-s-beginner-01" */
  id: string;
  language: Language;
  level: Level;
  /** English title, e.g. "Ordering coffee" */
  title: string;
  /** English: what the learner should accomplish by the end. */
  goal: string;
  /** Tutor's opening line in the target language. One or two short sentences ending in a question. */
  opening: string;
  /** English translation of the opening. */
  openingTranslation: string;
  /** 5-8 target words or structures in the target language the learner should try to use. */
  targetWords: string[];
  /** Exactly 3 example turns that continue naturally from the opening. */
  exampleTurns: ExampleTurn[];
}

// ---------- Writing (notebook) ----------

export interface WritingSentence {
  /** English prompt telling the learner what to write, e.g. "Say that you bought bread yesterday." */
  prompt: string;
  /** Model answer in the target language. */
  model: string;
}

export interface WritingTask {
  /** e.g. "ru-w-beginner-01" */
  id: string;
  language: Language;
  level: Level;
  /** Grammar rule this task practices; must be a valid GrammarRule id for the same language and level. */
  grammarRuleId: string;
  /** English instruction shown at the top of the notebook block. */
  instruction: string;
  /** 3-5 sentences the learner must handwrite. */
  sentences: WritingSentence[];
  /** Target-language vocab the learner should try to use. */
  targetVocab: string[];
  /** Short English label of the grammar focus, e.g. "past tense". */
  grammarFocus: string;
}

// ---------- Grammar ----------

export interface GrammarExample {
  target: string;
  translation: string;
}

export interface GrammarRule {
  /** e.g. "ru-g01" */
  id: string;
  language: Language;
  level: Level;
  title: string;
  /** The rule in plain English, 2-4 sentences. No jargon without a gloss. */
  rule: string;
  /** Exactly 3 examples. */
  examples: GrammarExample[];
  /** One line the learner copies into their notebook. Target-language pattern + tiny English gloss is ideal. */
  writeDown: string;
}

// ---------- User & progress ----------

export interface UserProfile {
  name: string;
  language: Language;
  level: Level;
  lessonLength: LessonLength;
  /** "HH:MM" 24h local time */
  reminderTime: string;
  timezone: string;
  muteTutor: boolean;
  onboarded: boolean;
}

export interface ChatMessage {
  id: string;
  role: "tutor" | "user";
  text: string;
  /** English side-note attached to tutor turns. */
  note?: string;
  /** Optional transcription confidence note for user turns coming from STT. */
  viaVoice?: boolean;
  createdAt: string;
}

export interface ConversationSummary {
  turns: number;
  targetWordsUsed: string[];
  targetWordsMissed: string[];
  corrections: { said: string; better: string; why: string }[];
  sayThisBetter: { original: string; better: string };
  praise: string;
}

export interface SentenceScore {
  sentence: string;
  correct: boolean;
  issue?: string;
  fix?: string;
}

export interface NotebookGrade {
  transcription: string[];
  scores: SentenceScore[];
  /** 1-5 */
  overall: number;
  encouragement: string;
}

export interface FlashcardStats {
  reviewed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  newLearned: number;
}

export interface DayRecord {
  /** ISO date YYYY-MM-DD */
  date: string;
  status: "complete" | "missed" | "partial";
  language: Language;
  lessonLength: LessonLength;
  flashcards?: FlashcardStats;
  conversation?: {
    scenarioId: string;
    transcript: ChatMessage[];
    summary: ConversationSummary;
  };
  grammarRuleId?: string;
  notebook?: {
    taskId: string;
    /** Data URL or placeholder descriptor. */
    photo: string;
    grade: NotebookGrade;
  };
  completedAt?: string;
}

// ---------- Lesson engine state ----------

export type BlockKind = "flashcards" | "conversation" | "grammar" | "notebook";

export interface LessonBlock {
  kind: BlockKind;
  /** Planned seconds for this block. */
  budgetSec: number;
  /** Seconds left (budget + carried − elapsed). */
  remainingSec: number;
  /** Seconds rolled over from earlier blocks. */
  carriedSec: number;
  timeUp: boolean;
  startedAt?: string;
  endedAt?: string;
}

export interface DailyPlan {
  scenarioId: string;
  grammarRuleId: string;
  writingTaskId: string;
}

export interface LessonProgress {
  date: string;
  language: Language;
  level: Level;
  lessonLength: LessonLength;
  status: "idle" | "running" | "complete";
  blockIndex: number;
  blocks: LessonBlock[];
  plan: DailyPlan;
  flashcards: { stats: FlashcardStats; reviewedCardIds: string[]; done: boolean };
  conversation: { transcript: ChatMessage[]; summary?: ConversationSummary };
  notebook: { photo?: string; grade?: NotebookGrade };
  startedAt?: string;
  completedAt?: string;
}

/** Everything persisted for the fake user. */
export interface PersistedState {
  version: 1;
  profile: UserProfile;
  /** SM-2 state keyed by card id; content is joined from /data at read time. */
  cards: Record<string, Sm2State>;
  /** Which languages have had their cards seeded. */
  seededLanguages: Language[];
  history: Record<string, DayRecord>;
  todayLesson?: LessonProgress;
  seededOn: string;
}
