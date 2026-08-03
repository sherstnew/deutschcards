"use client"

import Link from "next/link"
import { useEffect } from "react"
import { RefreshCw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => { console.error("Page render failed", error) }, [error])

  return <section className="mx-auto grid min-h-96 max-w-2xl place-items-center rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-700"><TriangleAlert size={28}/></span><h1 className="mt-5 text-2xl font-semibold">Не удалось открыть страницу</h1><p className="mt-2 max-w-md text-stone-500">Это временная ошибка. Попробуйте загрузить страницу ещё раз или вернитесь к повторению.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Button onClick={() => unstable_retry()}><RefreshCw/>Попробовать ещё раз</Button><Link href="/review" className="inline-flex h-11 items-center justify-center rounded-xl border border-stone-200 px-4 text-sm font-medium transition hover:bg-stone-50">К повторению</Link></div></div></section>
}
