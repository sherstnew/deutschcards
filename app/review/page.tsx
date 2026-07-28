import { ReviewSession } from "@/components/review-session"
import { getReviewQueue } from "@/lib/repository"

export const dynamic = "force-dynamic"

export default async function ReviewPage() { return <ReviewSession initialWords={await getReviewQueue()} /> }
