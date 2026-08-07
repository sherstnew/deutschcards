import type { Word } from "@/lib/types"

export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60]

export function normalizeGerman(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("de-DE")
}

export function normalizeAnswer(value: string) {
  return normalizeGerman(value)
}

export function isCorrectAnswer(answer: string, expected: string) {
  const normalizedAnswer = normalizeAnswer(answer)
  return expected.split(";").some((variant) => normalizeAnswer(variant) === normalizedAnswer)
}

export function getArticle(german: string, article?: Word["article"]) {
  if (article) return article
  const match = german.trim().match(/^(der|die|das)\s+/i)
  return match?.[1].toLocaleLowerCase("de-DE") as Word["article"] | undefined
}

export function withoutArticle(german: string) {
  return german.trim().replace(/^(der|die|das)\s+/i, "")
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }
  return shuffled
}

export function reviewPriority(word: Word, now = new Date()) {
  const due = new Date(word.dueAt).getTime()
  const overdueDays = Math.max(0, (now.getTime() - due) / 86_400_000)
  const errorRate = word.incorrectCount / Math.max(1, word.correctCount + word.incorrectCount)
  const isNew = word.repetitions === 0 ? 4 : 0
  return isNew + overdueDays * 2 + errorRate * 3 - word.intervalDays * 0.04 + Math.random() * 0.2
}

export function nextIntervalDays(consecutiveCorrect: number) {
  return REVIEW_INTERVALS[Math.min(consecutiveCorrect - 1, REVIEW_INTERVALS.length - 1)]
}
