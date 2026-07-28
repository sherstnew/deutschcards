export type Word = {
  id: string
  german: string
  russian: string
  notes?: string
  article?: "der" | "die" | "das"
  normalizedGerman: string
  createdAt: string
  repetitions: number
  correctCount: number
  incorrectCount: number
  consecutiveCorrect: number
  intervalDays: number
  dueAt: string
  lastReviewedAt?: string
}

export type ReviewMode = "reveal" | "type" | "choice" | "article"
export type ReviewDirection = "de-ru" | "ru-de"

export type ReviewEvent = {
  wordId: string
  outcome: "correct" | "incorrect"
  mode: ReviewMode
  direction: ReviewDirection
}

export type ImportResult = { added: number; skipped: number; invalid: number }

export type Statistics = {
  total: number
  newWords: number
  due: number
  reviewedToday: number
  accuracy: number
  streak: number
  difficult: Array<Pick<Word, "id" | "german" | "russian" | "incorrectCount" | "correctCount">>
  activity: Array<{ date: string; count: number }>
  stages: Array<{ label: string; count: number }>
}
