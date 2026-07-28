import { DictionaryManager } from "@/components/dictionary-manager"
import { getWords } from "@/lib/repository"

export const dynamic = "force-dynamic"

export default async function DictionaryPage() { return <DictionaryManager initialWords={await getWords()} /> }
