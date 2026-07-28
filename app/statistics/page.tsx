import { StatisticsDashboard } from "@/components/statistics-dashboard"
import { getStatistics } from "@/lib/repository"

export const dynamic = "force-dynamic"

export default async function StatisticsPage() { return <StatisticsDashboard stats={await getStatistics()} /> }
