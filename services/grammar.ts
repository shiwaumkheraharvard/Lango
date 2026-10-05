/** Grammar service: read-only accessors over the content bundle. */
import type { LanguageContent } from "@/data/index";
import type { GrammarRule, Level } from "@/data/types";

export function getRule(content: LanguageContent, id: string): GrammarRule | undefined {
  return content.ruleById.get(id);
}

export function rulesFor(content: LanguageContent, level: Level): GrammarRule[] {
  return content.grammar.filter((g) => g.level === level);
}
