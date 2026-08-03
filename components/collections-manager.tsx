"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Check, Layers3, Play, Plus, Search, Trash2, X } from "lucide-react"
import { addCollection, removeCollection, saveCollectionWords } from "@/app/actions"
import type { Collection, Word } from "@/lib/types"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CollectionsManager({ initialCollections, words }: { initialCollections: Collection[]; words: Word[] }) {
  const [collections, setCollections] = useState(initialCollections)
  const [selected, setSelected] = useState<Collection | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const visibleWords = useMemo(() => words.filter((word) => `${word.german} ${word.russian}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [words, query])

  async function create() {
    setError("")
    setSaving(true)
    const result = await addCollection({ name, description })
    setSaving(false)
    if (!result.ok) { setError(result.error); return }
    setCollections((items) => [result.data, ...items])
    setName(""); setDescription("")
  }

  async function toggleWord(wordId: string) {
    if (!selected) return
    setError("")
    const wordIds = selected.wordIds.includes(wordId) ? selected.wordIds.filter((id) => id !== wordId) : [...selected.wordIds, wordId]
    const result = await saveCollectionWords(selected.id, wordIds)
    if (!result.ok) { setError(result.error); return }
    setSelected(result.data)
    setCollections((items) => items.map((item) => item.id === result.data.id ? result.data : item))
  }

  async function deleteSelected() {
    if (!selected || !confirm(`Удалить коллекцию «${selected.name}»? Слова останутся в словаре.`)) return
    setError("")
    const result = await removeCollection(selected.id)
    if (!result.ok) { setError(result.error); return }
    setCollections((items) => items.filter((item) => item.id !== selected.id))
    setSelected(null)
  }

  return <section className="mx-auto max-w-4xl">
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight">Коллекции</h1><p className="mt-1 text-stone-500">Собирайте тематические наборы и повторяйте их отдельно.</p></div><p className="text-sm text-stone-500">{collections.length} {collections.length === 1 ? "коллекция" : "коллекций"}</p></div>
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-lime-100 p-3 text-lime-800"><Plus size={20}/></span><div><h2 className="font-semibold">Новая коллекция</h2><p className="text-sm text-stone-500">Например, «Путешествия» или «Глаголы A1»</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1.3fr_auto]"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Название" className="field"/><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Короткое описание" className="field"/><Button disabled={saving} onClick={create}><Plus/>{saving ? "Создаю…" : "Создать"}</Button></div>{error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}</div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">{collections.map((collection) => <button key={collection.id} onClick={() => { setSelected(collection); setQuery(""); setError("") }} className="group min-h-44 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:ring-lime-400"><div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-lime-100 p-3 text-lime-800"><Layers3 size={20}/></span><span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">{collection.wordIds.length} слов</span></div><h2 className="mt-5 text-xl font-semibold">{collection.name}</h2><p className="mt-1 line-clamp-2 text-sm text-stone-500">{collection.description || "Без описания"}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-lime-700">Открыть <span aria-hidden>→</span></span></button>)}{!collections.length && <div className="sm:col-span-2 rounded-3xl border border-dashed border-stone-300 p-10 text-center text-stone-500">Пока нет коллекций. Создайте первую и добавьте в неё слова.</div>}</div>
    {selected && <div className="fixed inset-0 z-30 flex items-end bg-stone-950/35 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Коллекция ${selected.name}`}><div className="max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-stone-50 p-5 shadow-2xl sm:rounded-3xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-lime-700">Коллекция</p><h2 className="mt-1 text-2xl font-semibold">{selected.name}</h2>{selected.description && <p className="mt-2 text-sm text-stone-500">{selected.description}</p>}</div><button onClick={() => setSelected(null)} className="icon-button" aria-label="Закрыть"><X size={18}/></button></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href={`/collections/${selected.id}/review`} className={cn(buttonVariants(), "flex-1 py-3")}><Play/>Запустить повторение</Link><Button variant="destructive" onClick={deleteSelected}><Trash2/>Удалить</Button></div><div className="mt-6 border-t border-stone-200 pt-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold">Слова в коллекции</h3><p className="text-sm text-stone-500">Нажмите на слово, чтобы добавить или убрать его.</p></div><label className="relative block sm:w-56"><Search className="absolute left-3 top-3 text-stone-400" size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти слово" className="field w-full pl-9"/></label></div><div className="mt-4 divide-y divide-stone-200 rounded-2xl bg-white px-4 ring-1 ring-stone-200">{visibleWords.map((word) => { const active = selected.wordIds.includes(word.id); return <button key={word.id} onClick={() => toggleWord(word.id)} className="flex w-full items-center gap-3 py-3 text-left"><span className={cn("grid size-6 shrink-0 place-items-center rounded-full border", active ? "border-lime-500 bg-lime-400 text-lime-950" : "border-stone-300 text-transparent")}><Check size={15}/></span><span className="min-w-0 flex-1"><span className="block truncate font-medium">{word.article && <span className="mr-1 text-lime-700">{word.article}</span>}{word.german.replace(/^(der|die|das)\s+/i, "")}</span><span className="block truncate text-sm text-stone-500">{word.russian}</span></span></button> })}{!visibleWords.length && <p className="py-8 text-center text-sm text-stone-500">Слова не найдены.</p>}</div></div></div></div>}
  </section>
}
