"use client"

import { useState } from "react"
import { Check, RefreshCw, Sparkles } from "lucide-react"
import { submitReview } from "@/app/actions"
import { withoutArticle } from "@/lib/learning"
import type { Word } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ArticleSession({ initialWords }: { initialWords: Word[] }) {
  const [words, setWords] = useState(initialWords)
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")
  const word = words[index]
  const result = answer && word ? answer === word.article : null

  async function next(outcome: "correct" | "incorrect") {
    if (!word) return
    setActionError("")
    const response = await submitReview({ wordId: word.id, outcome, mode: "article", direction: "de-ru" })
    if (!response.ok) { setActionError(response.error); return }
    if (outcome === "incorrect") setWords((items) => [...items.slice(0, index + 5), word, ...items.slice(index + 5)])
    setIndex((value) => value + 1)
    setAnswer(null)
  }

  if (!word) return <section className="grid min-h-96 place-items-center rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200"><div><Sparkles className="mx-auto mb-4 text-lime-600" size={36}/><h1 className="text-2xl font-semibold">Артикли на сегодня закончились</h1><p className="mt-2 text-stone-500">Новые существительные появятся здесь после добавления в словарь.</p></div></section>
  return <section className="mx-auto max-w-2xl"><div className="mb-6 flex items-center justify-between text-sm text-stone-500"><span>Существительное {index + 1}</span><span className="rounded-full bg-lime-100 px-3 py-1 font-medium text-lime-800">Артикли</span></div><article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200"><div className={cn("p-6 sm:min-h-[34rem] sm:p-10", !answer && "min-h-[31rem]")}><p className="text-sm font-medium uppercase tracking-widest text-stone-400">Выберите артикль</p><h1 className="mt-7 break-words text-4xl font-semibold sm:text-6xl">___ {withoutArticle(word.german)}</h1><p className="mt-3 text-lg text-stone-500">{word.russian}</p><div className="mt-12 grid grid-cols-3 gap-3">{(["der", "die", "das"] as const).map((article) => <button key={article} disabled={!!answer} onClick={() => setAnswer(article)} className={cn("rounded-2xl border px-3 py-5 text-xl font-semibold transition", answer && article === word.article ? "border-lime-500 bg-lime-50 text-lime-900" : answer && article === answer ? "border-red-300 bg-red-50 text-red-700" : "border-stone-200 hover:border-lime-400 hover:bg-lime-50")}>{article}</button>)}</div>{answer && <div className={cn("mt-5 rounded-xl p-4 text-sm", result ? "bg-lime-100 text-lime-900" : "bg-red-50 text-red-800")}>{result ? "Верно!" : <>Правильно: <strong>{word.article} {withoutArticle(word.german)}</strong></>}{word.notes && <span className="mt-1 block break-words opacity-80">Заметка: {word.notes}</span>}</div>}</div>{answer && <footer className="grid gap-3 border-t border-stone-100 bg-stone-50 p-4 sm:grid-cols-2">{actionError && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800 sm:col-span-2" role="alert">{actionError}</p>}<Button disabled={!result} onClick={() => next("correct")} className="h-12"><Check/>Я запомнил</Button><Button variant="outline" onClick={() => next("incorrect")} className="h-12"><RefreshCw/>Повторить ещё</Button></footer>}</article></section>
}
