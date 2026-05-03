'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, AlertCircle } from 'lucide-react'
import { createTask, updateTask } from '@/lib/actions/tasks'
import type { Project, TaskWithRelations, TaskStatus, TaskPriority } from '@/lib/types'

interface TaskFormProps {
  task?: TaskWithRelations
  projects: Project[]
  members: { id: string; full_name: string }[]
  defaultProjectId?: string
  isEditing?: boolean
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function TaskForm({ 
  task, 
  projects, 
  members: initialMembers,
  defaultProjectId, 
  isEditing = false 
}: TaskFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState(
    task?.project_id || defaultProjectId || (projects[0]?.id ?? '')
  )
  const [members, setMembers] = useState(initialMembers)
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task?.status || 'todo')
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>(task?.priority || 'medium')
  const [selectedAssignee, setSelectedAssignee] = useState<string>(task?.assigned_to || '')

  // Fetch members when project changes
  useEffect(() => {
    if (!isEditing && selectedProjectId) {
      fetchMembers(selectedProjectId)
    }
  }, [selectedProjectId, isEditing])

  const fetchMembers = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)

    formData.set('projectId', selectedProjectId)
    formData.set('status', selectedStatus)
    formData.set('priority', selectedPriority)
    if (selectedAssignee) {
      formData.set('assignedTo', selectedAssignee)
    }

    if (isEditing && task) {
      const updates = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        status: selectedStatus,
        priority: selectedPriority,
        assigned_to: selectedAssignee || null,
        due_date: formData.get('dueDate') as string || null,
      }
      
      const result = await updateTask(task.id, updates)
      
      if (result.error) {
        setError(result.error)
        setIsPending(false)
      } else {
        router.push('/tasks')
      }
    } else {
      const result = await createTask(formData)
      
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      } else if (result?.data) {
        router.push('/tasks')
      }
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update the task details below'
            : 'Fill in the details to create a new task'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter task title"
              defaultValue={task?.title}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the task (optional)"
              defaultValue={task?.description || ''}
              rows={4}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
                disabled={isPending || isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="size-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={selectedAssignee}
                onValueChange={setSelectedAssignee}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as TaskStatus)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={selectedPriority}
                onValueChange={(value) => setSelectedPriority(value as TaskPriority)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={task?.due_date ? task.due_date.split('T')[0] : ''}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Create Task'
              )}
            </Button>
            <Button type="button" variant="outline" asChild disabled={isPending}>
              <Link href="/tasks">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
