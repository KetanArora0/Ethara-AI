import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowRight, CheckSquare } from 'lucide-react'
import type { TaskWithRelations } from '@/lib/types'

interface RecentTasksProps {
  tasks: TaskWithRelations[]
}

const statusColors: Record<string, string> = {
  todo: 'bg-muted text-muted-foreground',
  in_progress: 'bg-accent/20 text-accent',
  review: 'bg-warning/20 text-warning',
  done: 'bg-success/20 text-success',
}

const statusLabels: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
}

const priorityColors: Record<string, string> = {
  low: 'border-muted-foreground/30',
  medium: 'border-accent',
  high: 'border-warning',
  urgent: 'border-destructive',
}

export function RecentTasks({ tasks }: RecentTasksProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="size-5 text-primary" />
          Recent Tasks
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks" className="flex items-center gap-1">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckSquare className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No tasks yet</p>
            <p className="text-sm text-muted-foreground/70">
              Create a project to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 rounded-lg border-l-2 bg-muted/30 p-3 ${priorityColors[task.priority]}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.projects && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${task.projects.color}20`, color: task.projects.color }}
                      >
                        {task.projects.name}
                      </span>
                    )}
                    <Badge variant="secondary" className={`text-xs ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </Badge>
                  </div>
                </div>
                {task.assignee && (
                  <Avatar className="size-7">
                    <AvatarImage src={task.assignee.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {task.assignee.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
