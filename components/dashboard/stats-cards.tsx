import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock, AlertTriangle, FolderKanban } from 'lucide-react'
import type { DashboardStats } from '@/lib/types'

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: CheckCircle2,
      description: 'Across all projects',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks,
      icon: Clock,
      description: 'Currently being worked on',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      description: 'Past due date',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      description: 'Active projects',
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-md p-2 ${card.bgColor}`}>
              <card.icon className={`size-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
