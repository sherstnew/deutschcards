import { CollectionsManager } from "@/components/collections-manager"
import { getCollections, getWords } from "@/lib/repository"

export const dynamic = "force-dynamic"

export default async function CollectionsPage() {
  const [collections, words] = await Promise.all([getCollections(), getWords()])
  return <CollectionsManager initialCollections={collections} words={words} />
}
