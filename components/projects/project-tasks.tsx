'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CheckSquare, MoreHorizontal, Clock, Pencil, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { updateTaskStatus, deleteTask } from '@/lib/actions/tasks'
import type { TaskWithRelations, TaskStatus } from '@/lib/types'

interface ProjectTasksProps {
  tasks: TaskWithRelations[]
  projectId: string
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

const priorityBorders: Record<string, string> = {
  low: 'border-l-muted-foreground/30',
  medium: 'border-l-accent',
  high: 'border-l-warning',
  urgent: 'border-l-destructive',
}

export function ProjectTasks({ tasks, projectId }: ProjectTasksProps) {
  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus(taskId, status)
  }

  const handleDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId)
    }
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CheckSquare className="size-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No tasks yet</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Create your first task to start tracking work in this project.
          </p>
          <Button asChild>
            <Link href={`/tasks/new?projectId=${projectId}`}>
              Create Task
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Group tasks by status
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = []
    acc[task.status].push(task)
    return acc
  }, {} as Record<string, TaskWithRelations[]>)

  const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {statusOrder.map((status) => (
        <div key={status} className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {groupedTasks[status]?.length || 0}
            </span>
          </div>
          <div className="space-y-2">
            {groupedTasks[status]?.map((task) => (
              <Card key={task.id} className={`border-l-4 ${priorityBorders[task.priority]}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 shrink-0">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tasks/${task.id}/edit`}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {statusOrder
                          .filter((s) => s !== status)
                          .map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => handleStatusChange(task.id, s)}
                            >
                              Move to {statusLabels[s]}
                            </DropdownMenuItem>
                          ))}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {task.assignee && (
                      <Avatar className="size-6">
                        <AvatarImage src={task.assignee.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {task.assignee.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                      </div>
                    )}
                    <Badge variant="outline" className="ml-auto text-xs capitalize">
                      {task.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
