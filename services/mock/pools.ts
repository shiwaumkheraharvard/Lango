import type { Language, Level } from "@/data/types";

/** Canned corrections used by the mock tutor summary and the fake history. */
export interface CorrectionPool {
  said: string;
  better: string;
  why: string;
}

export const CORRECTIONS: Record<Language, Record<Level, CorrectionPool[]>> = {
  ru: {
    beginner: [
      { said: "Я живу в Москва.", better: "Я живу в Москве.", why: "After «в» for location, use the prepositional case: Москва → Москве." },
      { said: "Это моя брат.", better: "Это мой брат.", why: "«Брат» is masculine, so the possessive is «мой»." },
      { said: "Я читаю книга.", better: "Я читаю книгу.", why: "Direct objects take the accusative: книга → книгу." },
      { said: "Я есть студент.", better: "Я студент.", why: "Russian drops «to be» in the present tense." },
    ],
    intermediate: [
      { said: "Раньше я купил хлеб каждый день.", better: "Раньше я покупал хлеб каждый день.", why: "Repeated actions need the imperfective «покупал», not perfective «купил»." },
      { said: "Я иду на работу на автобусе каждый день.", better: "Я езжу на работу на автобусе каждый день.", why: "Going somewhere regularly by vehicle uses «ездить», not «идти»." },
      { said: "У меня нет время.", better: "У меня нет времени.", why: "«Нет» takes the genitive: время → времени." },
      { said: "Я встретил с другом.", better: "Я встретился с другом.", why: "«Встречаться с кем-то» is reflexive: встретился." },
    ],
    advanced: [
      { said: "Я хочу, что ты пришёл.", better: "Я хочу, чтобы ты пришёл.", why: "Wishes about someone else use «чтобы» + past tense." },
      { said: "Если я буду иметь время, я бы позвонил.", better: "Если бы у меня было время, я бы позвонил.", why: "Hypotheticals use «бы» in both clauses; «иметь» is rarely used for possession." },
      { said: "Я приехал в Москву на поезде и пришёл в гостиницу на такси.", better: "Я приехал в Москву на поезде и приехал в гостиницу на такси.", why: "Arriving by vehicle (на такси) uses «приехал», not «пришёл»." },
      { said: "Мне холодный.", better: "Мне холодно.", why: "Feelings use the impersonal adverb form: «холодно»." },
    ],
  },
  es: {
    beginner: [
      { said: "Yo soy cansado.", better: "Estoy cansado.", why: "Temporary states use «estar», not «ser»." },
      { said: "La problema es grande.", better: "El problema es grande.", why: "«Problema» is masculine despite ending in -a." },
      { said: "Me gusta los perros.", better: "Me gustan los perros.", why: "«Gustar» agrees with the thing liked: plural → «gustan»." },
      { said: "Tengo veinte años y soy hambre.", better: "Tengo veinte años y tengo hambre.", why: "Hunger is expressed with «tener»: tengo hambre." },
    ],
    intermediate: [
      { said: "Ayer fui al cine y era muy divertido.", better: "Ayer fui al cine y fue muy divertido.", why: "Evaluating a finished event takes the preterite: «fue»." },
      { said: "Lo di el libro a María.", better: "Le di el libro a María.", why: "María is the indirect object, so use «le»." },
      { said: "Estudio español por hablar con mi familia.", better: "Estudio español para hablar con mi familia.", why: "Purpose (in order to) is «para», not «por»." },
      { said: "Cuando era niño, jugué fútbol todos los días.", better: "Cuando era niño, jugaba fútbol todos los días.", why: "Habitual past actions use the imperfect: «jugaba»." },
    ],
    advanced: [
      { said: "Quiero que vienes a la fiesta.", better: "Quiero que vengas a la fiesta.", why: "«Querer que» triggers the subjunctive: «vengas»." },
      { said: "Si tendría más tiempo, viajaría más.", better: "Si tuviera más tiempo, viajaría más.", why: "Hypothetical «si» clauses take the imperfect subjunctive, not the conditional." },
      { said: "Es importante que la gente sabe esto.", better: "Es importante que la gente sepa esto.", why: "Impersonal expressions of importance take the subjunctive: «sepa»." },
      { said: "Te llamaré cuando llego a casa.", better: "Te llamaré cuando llegue a casa.", why: "Future time clauses with «cuando» use the subjunctive: «llegue»." },
    ],
  },
};

export const SAY_THIS_BETTER: Record<Language, Record<Level, { original: string; better: string }[]>> = {
  ru: {
    beginner: [
      { original: "Я хочу кофе.", better: "Мне, пожалуйста, кофе." },
      { original: "Где туалет?", better: "Скажите, пожалуйста, где туалет?" },
    ],
    intermediate: [
      { original: "Я думаю, что это хорошо.", better: "По-моему, это отличная идея." },
      { original: "Я не понимаю.", better: "Извините, я не совсем понял. Можно ещё раз?" },
    ],
    advanced: [
      { original: "Это очень важно.", better: "Это имеет принципиальное значение." },
      { original: "Я не согласен.", better: "Я бы посмотрел на это иначе." },
    ],
  },
  es: {
    beginner: [
      { original: "Quiero un café.", better: "¿Me da un café, por favor?" },
      { original: "¿Dónde está el baño?", better: "Perdón, ¿me puede decir dónde está el baño?" },
    ],
    intermediate: [
      { original: "Pienso que es bueno.", better: "Me parece una muy buena idea." },
      { original: "No entiendo.", better: "Perdona, no te he entendido bien. ¿Lo repites?" },
    ],
    advanced: [
      { original: "Es muy importante.", better: "Es de vital importancia." },
      { original: "No estoy de acuerdo.", better: "Yo lo vería de otra manera." },
    ],
  },
};

export const PRAISE: string[] = [
  "Great rhythm — you answered without stopping to translate.",
  "Nice! That sounded like something a real person would say.",
  "You used a target word without being nudged. Polo is impressed.",
  "Lovely word order. Keep going.",
  "Clear and confident. One more like that.",
  "That's exactly the phrase a native speaker would reach for.",
];

export const TUTOR_FOLLOWUPS: Record<Language, string[]> = {
  ru: [
    "Интересно! Расскажи подробнее.",
    "А почему ты так думаешь?",
    "Понятно. А что было потом?",
    "Здорово! А ты часто так делаешь?",
    "Хорошо. А как бы ты сказал это по-другому?",
    "Отлично. Что ещё ты можешь добавить?",
    "А как это было в прошлый раз?",
  ],
  es: [
    "¡Qué interesante! Cuéntame más.",
    "¿Y por qué piensas eso?",
    "Entiendo. ¿Y qué pasó después?",
    "¡Genial! ¿Lo haces a menudo?",
    "Bien. ¿Y cómo lo dirías de otra manera?",
    "Perfecto. ¿Qué más puedes añadir?",
    "¿Y cómo fue la última vez?",
  ],
};

export const TUTOR_CLOSING: Record<Language, string> = {
  ru: "Отличная работа сегодня! До завтра.",
  es: "¡Buen trabajo hoy! Hasta mañana.",
};

/** Generic learner lines the mock STT returns once the scripted example turns run out. */
export const MOCK_USER_LINES: Record<Language, string[]> = {
  ru: ["Да, я думаю, это интересно.", "Обычно я делаю это по выходным.", "Не знаю, может быть.", "Да, мне это нравится."],
  es: ["Sí, creo que es interesante.", "Normalmente lo hago los fines de semana.", "No sé, tal vez.", "Sí, me gusta mucho."],
};

export const ENCOURAGEMENT: string[] = [
  "Your handwriting is braver than my spelling. Nice work.",
  "Four sentences by hand — that's four more than most people wrote today.",
  "Polo squinted, Polo approved. One small fix and this is perfect.",
  "Solid page. The grammar rule clearly stuck.",
  "You wrote it, you own it now. Tomorrow we build on this.",
];

/** Introduce one believable slip into a correct sentence (for mock grading and fake history). */
export function introduceSlip(sentence: string, language: Language): { text: string; issue: string; fix: string } | null {
  const words = sentence.split(" ");
  if (language === "es") {
    const map: Record<string, string> = { á: "a", é: "e", í: "i", ó: "o", ú: "u" };
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const idx = w.split("").findIndex((ch) => map[ch]);
      if (idx >= 0) {
        const bare = w.replace(/[áéíóú]/, (m) => map[m]);
        const copy = [...words];
        copy[i] = bare;
        return { text: copy.join(" "), issue: `Missing accent on “${bare.replace(/[.,!?¡¿]/g, "")}”.`, fix: w.replace(/[.,!?¡¿]/g, "") };
      }
    }
    // Fallback: gender slip on an article
    const ai = words.findIndex((w) => w === "la" || w === "el");
    if (ai >= 0) {
      const copy = [...words];
      copy[ai] = words[ai] === "la" ? "el" : "la";
      return { text: copy.join(" "), issue: "Article doesn't match the noun's gender.", fix: `${words[ai]} ${words[ai + 1] ?? ""}`.trim() };
    }
    return null;
  }
  // Russian: change the final vowel of a longer word (case-ending slip)
  const vowels = "аеиоуыэюя";
  for (let i = words.length - 1; i >= 0; i--) {
    const raw = words[i];
    const w = raw.replace(/[.,!?«»—]/g, "");
    if (w.length >= 5 && vowels.includes(w[w.length - 1].toLowerCase())) {
      const last = w[w.length - 1];
      const swapped = last === "е" ? "а" : last === "у" ? "а" : last === "а" ? "у" : last === "и" ? "ы" : "е";
      const slip = w.slice(0, -1) + swapped;
      const copy = [...words];
      copy[i] = raw.replace(w, slip);
      return { text: copy.join(" "), issue: `Case ending: “${slip}” should be “${w}”.`, fix: w };
    }
  }
  return null;
}
