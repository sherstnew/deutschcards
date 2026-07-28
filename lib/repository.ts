import "server-only"

import { ObjectId, type WithId } from "mongodb"
import { getArticle, nextIntervalDays, normalizeGerman, reviewPriority } from "@/lib/learning"
import { getDb } from "@/lib/mongodb"
import { A1_SEED } from "@/lib/seed"
import type { ImportResult, ReviewDirection, ReviewEvent, ReviewMode, Statistics, Word } from "@/lib/types"

type WordDoc = Omit<Word, "id" | "dueAt" | "createdAt" | "lastReviewedAt"> & { dueAt: Date; createdAt: Date; lastReviewedAt?: Date }
type EventDoc = { wordId: ObjectId; outcome: "correct" | "incorrect"; mode: ReviewMode; direction: ReviewDirection; createdAt: Date }

function serialize(doc: WithId<WordDoc>): Word {
  return {
    id: doc._id.toHexString(),
    german: doc.german,
    russian: doc.russian,
    ...(doc.notes ? { notes: doc.notes } : {}),
    ...(doc.article ? { article: doc.article } : {}),
    normalizedGerman: doc.normalizedGerman,
    createdAt: doc.createdAt.toISOString(),
    repetitions: doc.repetitions,
    correctCount: doc.correctCount,
    incorrectCount: doc.incorrectCount,
    consecutiveCorrect: doc.consecutiveCorrect,
    intervalDays: doc.intervalDays,
    dueAt: doc.dueAt.toISOString(),
    ...(doc.lastReviewedAt ? { lastReviewedAt: doc.lastReviewedAt.toISOString() } : {}),
  }
}

async function wordsCollection() {
  const collection = (await getDb()).collection<WordDoc>("words")
  await collection.createIndex({ normalizedGerman: 1 }, { unique: true })
  return collection
}

export async function seedIfEmpty() {
  const words = await wordsCollection()
  if (await words.estimatedDocumentCount()) return
  const now = new Date()
  await words.insertMany(A1_SEED.map(([german, russian]) => ({ german, russian, article: getArticle(german), normalizedGerman: normalizeGerman(german), createdAt: now, repetitions: 0, correctCount: 0, incorrectCount: 0, consecutiveCorrect: 0, intervalDays: 0, dueAt: now })))
}

export async function getWords() {
  await seedIfEmpty()
  return (await (await wordsCollection()).find().sort({ german: 1 }).toArray()).map(serialize)
}

export async function getReviewQueue() {
  const words = await getWords()
  const now = new Date()
  return words.sort((a, b) => reviewPriority(b, now) - reviewPriority(a, now)).slice(0, 24)
}

export async function createWord(input: { german: string; russian: string; notes?: string; article?: Word["article"] }) {
  const german = input.german.trim().replace(/\s+/g, " ")
  const russian = input.russian.trim().replace(/\s+/g, " ")
  if (!german || !russian) throw new Error("Заполните немецкое слово и перевод")
  const now = new Date()
  const notes = input.notes?.trim()
  const article = getArticle(german, input.article)
  const doc = { german, russian, ...(notes ? { notes } : {}), ...(article ? { article } : {}), normalizedGerman: normalizeGerman(german), createdAt: now, repetitions: 0, correctCount: 0, incorrectCount: 0, consecutiveCorrect: 0, intervalDays: 0, dueAt: now }
  try { const result = await (await wordsCollection()).insertOne(doc); return serialize({ ...doc, _id: result.insertedId }) }
  catch (error) { if ((error as { code?: number }).code === 11000) throw new Error("Такое немецкое слово уже есть в словаре"); throw error }
}

export async function updateWord(id: string, input: { german: string; russian: string; notes?: string; article?: Word["article"] }) {
  const german = input.german.trim().replace(/\s+/g, " ")
  const russian = input.russian.trim().replace(/\s+/g, " ")
  if (!ObjectId.isValid(id) || !german || !russian) throw new Error("Некорректные данные слова")
  try {
    const notes = input.notes?.trim()
    const article = getArticle(german, input.article)
    const result = await (await wordsCollection()).findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { german, russian, notes: notes || undefined, article, normalizedGerman: normalizeGerman(german) } }, { returnDocument: "after" })
    if (!result) throw new Error("Слово не найдено")
    return serialize(result)
  } catch (error) { if ((error as { code?: number }).code === 11000) throw new Error("Такое немецкое слово уже есть в словаре"); throw error }
}

export async function deleteWord(id: string) {
  if (!ObjectId.isValid(id)) throw new Error("Некорректный идентификатор")
  await (await wordsCollection()).deleteOne({ _id: new ObjectId(id) })
}

export async function importWords(items: unknown): Promise<ImportResult> {
  if (!Array.isArray(items)) throw new Error("JSON должен быть массивом слов")
  let added = 0, skipped = 0, invalid = 0
  for (const item of items) {
    if (!item || typeof item !== "object" || typeof (item as { german?: unknown }).german !== "string" || typeof (item as { russian?: unknown }).russian !== "string") { invalid++; continue }
    const raw = item as { german: string; russian: string; notes?: unknown; article?: unknown }
    const article = raw.article === "der" || raw.article === "die" || raw.article === "das" ? raw.article : undefined
    try { await createWord({ german: raw.german, russian: raw.russian, notes: typeof raw.notes === "string" ? raw.notes : undefined, article }); added++ }
    catch (error) { if ((error as Error).message.includes("уже есть")) skipped++; else invalid++ }
  }
  return { added, skipped, invalid }
}

export async function recordReview(event: ReviewEvent) {
  if (!ObjectId.isValid(event.wordId)) throw new Error("Некорректное слово")
  const words = await wordsCollection(), now = new Date(), id = new ObjectId(event.wordId)
  const word = await words.findOne({ _id: id })
  if (!word) throw new Error("Слово не найдено")
  const correct = event.outcome === "correct"
  const consecutiveCorrect = correct ? word.consecutiveCorrect + 1 : 0
  const intervalDays = correct ? nextIntervalDays(consecutiveCorrect) : 0
  const dueAt = new Date(now.getTime() + (correct ? intervalDays * 86_400_000 : 10 * 60_000))
  await words.updateOne({ _id: id }, { $set: { consecutiveCorrect, intervalDays, dueAt, lastReviewedAt: now }, $inc: { repetitions: 1, correctCount: correct ? 1 : 0, incorrectCount: correct ? 0 : 1 } })
  await (await getDb()).collection<EventDoc>("reviewEvents").insertOne({ ...event, wordId: id, createdAt: now })
}

export async function getStatistics(): Promise<Statistics> {
  const words = await getWords(), now = new Date(), events = (await getDb()).collection<EventDoc>("reviewEvents")
  const allEvents = await events.find().sort({ createdAt: -1 }).toArray()
  const totalAnswers = allEvents.length, correct = allEvents.filter((event) => event.outcome === "correct").length
  const dateKey = (date: Date) => date.toISOString().slice(0, 10)
  const today = dateKey(now)
  const active = new Set(allEvents.map((event) => dateKey(event.createdAt)))
  let streak = 0
  const cursor = new Date(now)
  while (active.has(dateKey(cursor))) { streak++; cursor.setUTCDate(cursor.getUTCDate() - 1) }
  const activity = Array.from({ length: 7 }, (_, index) => { const day = new Date(now); day.setUTCDate(day.getUTCDate() - (6 - index)); const date = dateKey(day); return { date, count: allEvents.filter((event) => dateKey(event.createdAt) === date).length } })
  return {
    total: words.length, newWords: words.filter((word) => word.repetitions === 0).length, due: words.filter((word) => new Date(word.dueAt) <= now).length,
    reviewedToday: allEvents.filter((event) => dateKey(event.createdAt) === today).length, accuracy: totalAnswers ? Math.round((correct / totalAnswers) * 100) : 0, streak,
    difficult: words.filter((word) => word.incorrectCount > 0).sort((a, b) => (b.incorrectCount - b.correctCount) - (a.incorrectCount - a.correctCount)).slice(0, 5), activity,
    stages: [{ label: "Новые", count: words.filter((word) => word.repetitions === 0).length }, { label: "В процессе", count: words.filter((word) => word.repetitions > 0 && word.intervalDays < 14).length }, { label: "Закреплены", count: words.filter((word) => word.intervalDays >= 14).length }],
  }
}
