/**
 * Writing service: grades a photo of handwritten sentences.
 * Calls /api/grade-notebook (Claude vision when ANTHROPIC_API_KEY is set, otherwise a mock).
 */
import type { Language, Level, NotebookGrade, WritingTask } from "@/data/types";
import { mockNotebookGrade } from "./mock/grade";

export interface GradeRequest {
  imageDataUrl: string;
  task: WritingTask;
  language: Language;
  level: Level;
}

export async function gradeNotebook(req: GradeRequest): Promise<NotebookGrade & { mock: boolean }> {
  try {
    const res = await fetch("/api/grade-notebook", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image: req.imageDataUrl, taskId: req.task.id, language: req.language, level: req.level }),
    });
    if (!res.ok) throw new Error(`grade ${res.status}`);
    const data = (await res.json()) as NotebookGrade & { mock?: boolean };
    return { ...data, mock: !!data.mock };
  } catch {
    return { ...mockNotebookGrade(req.task, req.language, req.imageDataUrl.length.toString()), mock: true };
  }
}
