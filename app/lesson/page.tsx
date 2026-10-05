import type { Metadata } from "next";
import { LessonFlow } from "@/components/lesson/LessonFlow";

export const metadata: Metadata = { title: "Lesson" };

export default function LessonPage() {
  return <LessonFlow />;
}
