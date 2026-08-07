import Link from "next/link"
import { ReviewSession } from "@/components/review-session"
import { getCollectionWords } from "@/lib/repository"
import { shuffle } from "@/lib/learning"
import { buttonVariants } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function CollectionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getCollectionWords(id)
  if (!data) return <section className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200"><h1 className="text-2xl font-semibold">Коллекция не найдена</h1><Link href="/collections" className={`${buttonVariants()} mt-5`}>К коллекциям</Link></section>
  return <><div className="mb-6"><Link href="/collections" className="text-sm font-medium text-lime-700 hover:text-lime-900">← К коллекциям</Link><h1 className="mt-2 text-3xl font-semibold">{data.collection.name}</h1></div><ReviewSession initialWords={shuffle(data.words)} title="Коллекция пройдена" emptyText={data.words.length ? "Все слова отмечены как изученные. Коллекцию можно запустить снова в любой момент." : "В этой коллекции пока нет слов."}/></>
}
