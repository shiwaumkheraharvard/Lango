import type { Language, NotebookGrade, WritingTask } from "@/data/types";
import { hashString, pick, seededRandom } from "@/lib/seeded";
import { ENCOURAGEMENT, introduceSlip } from "./pools";

/** Mock vision grading: transcribe the model answers with one believable slip. */
export function mockNotebookGrade(task: WritingTask, language: Language, salt = ""): NotebookGrade {
  const rand = seededRandom(hashString(`${task.id}-${salt}`));
  const models = task.sentences.map((s) => s.model);
  const slipIndex = Math.floor(rand() * models.length);
  const slip = introduceSlip(models[slipIndex], language);
  const transcription = models.map((m, i) => (i === slipIndex && slip ? slip.text : m));
  const scores = models.map((m, i) =>
    i === slipIndex && slip ? { sentence: slip.text, correct: false, issue: slip.issue, fix: slip.fix } : { sentence: m, correct: true },
  );
  const correct = scores.filter((s) => s.correct).length;
  const overall = correct === models.length ? 5 : correct >= models.length - 1 ? 4 : 3;
  return { transcription, scores, overall, encouragement: pick(rand, ENCOURAGEMENT) };
}
