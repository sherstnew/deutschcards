"use server"

import { revalidatePath } from "next/cache"
import { createWord, deleteWord, importWords, recordReview, updateWord } from "@/lib/repository"
import type { ImportResult, ReviewEvent, Word } from "@/lib/types"

const refresh = () => { revalidatePath("/"); revalidatePath("/review"); revalidatePath("/dictionary"); revalidatePath("/statistics") }

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string }

const knownErrors = new Set([
  "Заполните немецкое слово и перевод",
  "Такое немецкое слово уже есть в словаре",
  "Некорректные данные слова",
  "Некорректный идентификатор",
  "Некорректное слово",
  "Слово не найдено",
  "JSON должен быть массивом слов",
])

async function safely<T>(operation: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await operation() }
  } catch (error) {
    console.error("Server action failed", error)
    const message = error instanceof Error && knownErrors.has(error.message)
      ? error.message
      : "Не удалось выполнить действие. Попробуйте ещё раз."
    return { ok: false, error: message }
  }
}

export async function addWord(input: { german: string; russian: string; notes?: string; article?: "der" | "die" | "das" }): Promise<ActionResult<Word>> { return safely(async () => { const word = await createWord(input); refresh(); return word }) }
export async function editWord(id: string, input: { german: string; russian: string; notes?: string; article?: "der" | "die" | "das" }): Promise<ActionResult<Word>> { return safely(async () => { const word = await updateWord(id, input); refresh(); return word }) }
export async function removeWord(id: string): Promise<ActionResult> { return safely(async () => { await deleteWord(id); refresh() }) }
export async function uploadWords(items: unknown): Promise<ActionResult<ImportResult>> { return safely(async () => { const result = await importWords(items); refresh(); return result }) }
export async function submitReview(event: ReviewEvent): Promise<ActionResult> { return safely(async () => { await recordReview(event); refresh() }) }
