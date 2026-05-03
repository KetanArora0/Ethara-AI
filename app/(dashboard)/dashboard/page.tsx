import { Suspense } from 'react'
import { getDashboardStats, getRecentTasks, getOverdueTasks } from '@/lib/actions/tasks'
import { getProjects } from '@/lib/actions/projects'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentTasks } from '@/components/dashboard/recent-tasks'
import { OverdueTasks } from '@/components/dashboard/overdue-tasks'
import { ProjectsList } from '@/components/dashboard/projects-list'
import { Skeleton } from '@/components/ui/skeleton'

export default async function DashboardPage() {
  const [stats, recentTasks, overdueTasks, projects] = await Promise.all([
    getDashboardStats(),
    getRecentTasks(5),
    getOverdueTasks(),
    getProjects(),
  ])

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader />
      <div className="flex-1 space-y-6 p-6">
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards stats={stats} />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<CardSkeleton />}>
            <RecentTasks tasks={recentTasks} />
          </Suspense>
          
          <Suspense fallback={<CardSkeleton />}>
            <OverdueTasks tasks={overdueTasks} />
          </Suspense>
        </div>

        <Suspense fallback={<CardSkeleton />}>
          <ProjectsList projects={projects} />
        </Suspense>
      </div>
    </div>
  )
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  )
}

function CardSkeleton() {
  return <Skeleton className="h-64 w-full" />
}
