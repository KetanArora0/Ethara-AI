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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckSquare, MoreHorizontal, Pencil, Trash2, Clock } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { updateTaskStatus, deleteTask } from '@/lib/actions/tasks'
import type { TaskWithRelations, TaskStatus } from '@/lib/types'

interface TasksTableProps {
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
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-accent/20 text-accent',
  high: 'bg-warning/20 text-warning',
  urgent: 'bg-destructive/20 text-destructive',
}

export function TasksTable({ tasks }: TasksTableProps) {
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
          <h2 className="text-xl font-semibold mb-2">No tasks found</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {"Create a new task or adjust your filters to see tasks here."}
          </p>
          <Button asChild>
            <Link href="/tasks/new">Create Task</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const isOverdue = task.due_date && 
              new Date(task.due_date) < new Date() && 
              task.status !== 'done'

            return (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{task.title}</span>
                    {task.description && (
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {task.projects && (
                    <Link href={`/projects/${task.projects.id}`}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        style={{
                          borderColor: task.projects.color,
                          color: task.projects.color,
                        }}
                      >
                        {task.projects.name}
                      </Badge>
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[task.status]}>
                    {statusLabels[task.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`capitalize ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarImage src={task.assignee.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {task.assignee.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.due_date ? (
                    <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                      <Clock className="size-3" />
                      {format(new Date(task.due_date), 'MMM d, yyyy')}
                      {isOverdue && (
                        <Badge variant="destructive" className="ml-1 text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No due date</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
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
                      <DropdownMenuSeparator />
                      {(['todo', 'in_progress', 'review', 'done'] as TaskStatus[])
                        .filter((s) => s !== task.status)
                        .map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(task.id, status)}
                          >
                            Move to {statusLabels[status]}
                          </DropdownMenuItem>
                        ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
