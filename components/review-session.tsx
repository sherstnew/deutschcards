"use client"

import { useState } from "react"
import { Check, Eye, Keyboard, RefreshCw, Shuffle, Sparkles } from "lucide-react"
import { submitReview } from "@/app/actions"
import { isCorrectAnswer } from "@/lib/learning"
import type { ReviewDirection, ReviewMode, Word } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ReviewSession({ initialWords }: { initialWords: Word[] }) {
  const [queue, setQueue] = useState(initialWords)
  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState<ReviewMode | null>(null)
  const [answer, setAnswer] = useState("")
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null)
  const [actionError, setActionError] = useState("")
  const word = queue[index]
  const direction: ReviewDirection = index % 2 === 0 ? "de-ru" : "ru-de"
  const prompt = word && direction === "de-ru" ? word.german : word?.russian
  const expected = word && direction === "de-ru" ? word.russian : word?.german
  const distractors = word ? queue.filter((item) => item.id !== word.id).slice(0, 3).map((item) => direction === "de-ru" ? item.russian : item.german) : []
  const uniqueDistractors = word ? Array.from(new Set(distractors.filter((option) => option !== expected))) : []
  const answerPosition = word ? index % (uniqueDistractors.length + 1) : 0
  const options = word ? [...uniqueDistractors.slice(0, answerPosition), expected!, ...uniqueDistractors.slice(answerPosition)] : []

  function reset() { setMode(null); setAnswer(""); setResult(null); setActionError("") }
  async function move(outcome: "correct" | "incorrect") {
    if (!word || !mode) return
    setActionError("")
    const response = await submitReview({ wordId: word.id, outcome, mode, direction })
    if (!response.ok) { setActionError(response.error); return }
    if (outcome === "incorrect") setQueue((items) => [...items.slice(0, index + 5), word, ...items.slice(index + 5)])
    setIndex((value) => value + 1); reset()
  }
  function checkTyped() { setResult(isCorrectAnswer(answer, expected!) ? "correct" : "incorrect") }
  function selectOption(option: string) { setAnswer(option); setResult(isCorrectAnswer(option, expected!) ? "correct" : "incorrect") }

  if (!word) return <section className="grid min-h-96 place-items-center rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200"><div><Sparkles className="mx-auto mb-4 text-lime-600" size={36}/><h1 className="text-2xl font-semibold">На сегодня всё</h1><p className="mt-2 text-stone-500">Хорошая работа. Загляните позже — слова сами придут к сроку.</p></div></section>
  return <section className="mx-auto max-w-2xl">
    <div className="mb-6 flex items-center justify-between text-sm text-stone-500"><span>Карточка {index + 1}</span><span className="rounded-full bg-lime-100 px-3 py-1 font-medium text-lime-800">{direction === "de-ru" ? "Deutsch → Русский" : "Русский → Deutsch"}</span></div>
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200">
      <div className={cn("p-6 sm:min-h-[34rem] sm:p-10", !mode && "min-h-[31rem]")}><p className="text-sm font-medium uppercase tracking-widest text-stone-400">Что это значит?</p><h1 className="mt-7 break-words text-4xl font-semibold tracking-tight sm:text-6xl">{prompt}</h1>
        {!mode ? <div className="mt-12 grid gap-3"><p className="text-sm text-stone-500">Как хотите ответить?</p><ModeButton icon={Eye} title="Открыть перевод" text="Оценю себя сам" onClick={() => setMode("reveal")}/><ModeButton icon={Keyboard} title="Написать ответ" text="Проверка совпадения" onClick={() => setMode("type")}/><ModeButton icon={Shuffle} title="Выбрать из 4" text="Быстрая проверка" onClick={() => setMode("choice")}/></div> : null}
        {mode === "reveal" ? <div className="mt-10 rounded-2xl bg-lime-50 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-lime-700">Перевод</p><p className="mt-2 text-2xl font-medium">{expected}</p></div> : null}
        {mode === "type" ? <div className="mt-10"><input autoFocus value={answer} onChange={(event) => { setAnswer(event.target.value); setResult(null) }} onKeyDown={(event) => event.key === "Enter" && answer && checkTyped()} placeholder="Введите ответ" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-lg outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-100"/>{!result ? <Button disabled={!answer} onClick={checkTyped} className="mt-3 w-full">Проверить</Button> : <Feedback result={result} expected={expected!}/>}</div> : null}
        {mode === "choice" ? <div className="mt-10 grid gap-3">{options.map((option) => <button key={option} disabled={!!result} onClick={() => selectOption(option)} className={cn("rounded-2xl border px-5 py-4 text-left font-medium transition", result && option === expected ? "border-lime-500 bg-lime-50" : result && option === answer ? "border-red-300 bg-red-50" : "border-stone-200 hover:border-lime-400 hover:bg-lime-50")}>{option}</button>)}{result && <Feedback result={result} expected={expected!}/>}</div> : null}
      </div>
      {mode && (mode === "reveal" || result) ? <footer className="grid gap-3 border-t border-stone-100 bg-stone-50 p-4 sm:grid-cols-2">{actionError && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800 sm:col-span-2" role="alert">{actionError}</div>}<Button disabled={result === "incorrect"} onClick={() => move("correct")} className="h-12"><Check/>Я изучил слово</Button><Button variant="outline" onClick={() => move("incorrect")} className="h-12"><RefreshCw/>Повторить ещё</Button></footer> : null}
    </article>
  </section>
}

function ModeButton({ icon: Icon, title, text, onClick }: { icon: typeof Eye; title: string; text: string; onClick: () => void }) { return <button onClick={onClick} className="flex items-center gap-4 rounded-2xl border border-stone-200 p-4 text-left transition hover:border-lime-400 hover:bg-lime-50"><span className="rounded-xl bg-stone-100 p-3"><Icon size={20}/></span><span><span className="block font-semibold">{title}</span><span className="text-sm text-stone-500">{text}</span></span></button> }
function Feedback({ result, expected }: { result: "correct" | "incorrect"; expected: string }) { return <div className={cn("mt-4 rounded-xl p-4 text-sm", result === "correct" ? "bg-lime-100 text-lime-900" : "bg-red-50 text-red-800")}>{result === "correct" ? "Верно!" : <>Почти. Правильный ответ: <strong>{expected}</strong></>}</div> }
