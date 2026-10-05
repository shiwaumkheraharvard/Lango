import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const TUTOR_MODEL = process.env.LANGO_TUTOR_MODEL || "claude-opus-5-5";

export function forceMock(): boolean {
  return process.env.LANGO_FORCE_MOCK === "1";
}

export function hasAnthropic(): boolean {
  return !forceMock() && !!process.env.ANTHROPIC_API_KEY;
}

export function hasOpenAI(): boolean {
  return !forceMock() && !!process.env.OPENAI_API_KEY;
}

let anthropic: Anthropic | null = null;
export function anthropicClient(): Anthropic {
  if (!anthropic) anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic;
}

let openai: OpenAI | null = null;
export function openaiClient(): OpenAI {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

export const LANGUAGE_NAME = { ru: "Russian", es: "Spanish" } as const;
export const LEVEL_DESCRIPTION = {
  beginner: "CEFR A1: very short sentences, high-frequency words, present tense, no subordinate clauses",
  intermediate: "CEFR A2–B1: everyday topics, past and future tenses, simple connectors, one clause per sentence",
  advanced: "CEFR B1+/B2: natural native register, opinions, hypotheticals, idiomatic phrasing",
} as const;
