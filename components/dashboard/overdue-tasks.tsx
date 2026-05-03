import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { TaskWithRelations } from '@/lib/types'

interface OverdueTasksProps {
  tasks: TaskWithRelations[]
}

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-accent/20 text-accent',
  high: 'bg-warning/20 text-warning',
  urgent: 'bg-destructive/20 text-destructive',
}

export function OverdueTasks({ tasks }: OverdueTasksProps) {
  return (
    <Card className="border-destructive/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-destructive" />
          Overdue Tasks
          {tasks.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {tasks.length}
            </Badge>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks?filter=overdue" className="flex items-center gap-1">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-success/10 p-4 mb-4">
              <AlertTriangle className="size-8 text-success" />
            </div>
            <p className="text-muted-foreground">No overdue tasks</p>
            <p className="text-sm text-muted-foreground/70">
              {"You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3"
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
                    <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <Clock className="size-3" />
                  {task.due_date && formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
