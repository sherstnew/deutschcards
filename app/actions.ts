"use server"

import { revalidatePath } from "next/cache"
import { createWord, deleteWord, importWords, recordReview, updateWord } from "@/lib/repository"
import type { ReviewEvent } from "@/lib/types"

const refresh = () => { revalidatePath("/"); revalidatePath("/review"); revalidatePath("/dictionary"); revalidatePath("/statistics") }
export async function addWord(input: { german: string; russian: string; notes?: string; article?: "der" | "die" | "das" }) { const word = await createWord(input); refresh(); return word }
export async function editWord(id: string, input: { german: string; russian: string; notes?: string; article?: "der" | "die" | "das" }) { const word = await updateWord(id, input); refresh(); return word }
export async function removeWord(id: string) { await deleteWord(id); refresh() }
export async function uploadWords(items: unknown) { const result = await importWords(items); refresh(); return result }
export async function submitReview(event: ReviewEvent) { await recordReview(event); refresh() }
