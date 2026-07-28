import { ArticleSession } from "@/components/article-session"
import { getReviewQueue } from "@/lib/repository"

export const dynamic = "force-dynamic"

export default async function ArticlesPage() {
  const words = (await getReviewQueue()).filter((word) => word.article)
  return <ArticleSession initialWords={words} />
}
