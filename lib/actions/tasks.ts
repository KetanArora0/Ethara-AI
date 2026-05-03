'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TaskStatus, TaskPriority } from '@/lib/types'

export async function getTasks(projectId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('tasks')
    .select(`
      *,
      projects (
        id,
        name,
        color
      ),
      assignee:profiles!tasks_assigned_to_fkey (
        id,
        full_name,
        avatar_url
      ),
      creator:profiles!tasks_created_by_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data || []
}

export async function getTask(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      projects (
        id,
        name,
        color
      ),
      assignee:profiles!tasks_assigned_to_fkey (
        id,
        full_name,
        avatar_url
      ),
      creator:profiles!tasks_created_by_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching task:', error)
    return null
  }

  return data
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const projectId = formData.get('projectId') as string
  const status = (formData.get('status') as TaskStatus) || 'todo'
  const priority = (formData.get('priority') as TaskPriority) || 'medium'
  const assignedTo = formData.get('assignedTo') as string | null
  const dueDate = formData.get('dueDate') as string | null

  if (!title || !projectId) {
    return { error: 'Title and project are required' }
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title,
      description,
      project_id: projectId,
      status,
      priority,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${projectId}`)
  return { data }
}

export async function updateTask(id: string, updates: {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigned_to?: string | null
  due_date?: string | null
}) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select('project_id')
    .single()

  if (error) {
    console.error('Error updating task:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  if (data?.project_id) {
    revalidatePath(`/projects/${data.project_id}`)
  }
  return { success: true }
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  return updateTask(id, { status })
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  
  // First get the project_id for revalidation
  const { data: task } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', id)
    .single()
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting task:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/tasks')
  if (task?.project_id) {
    revalidatePath(`/projects/${task.project_id}`)
  }
  return { success: true }
}

export async function getDashboardStats() {
  const supabase = await createClient()
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, status, due_date')

  const { data: projects } = await supabase
    .from('projects')
    .select('id')

  const now = new Date()
  const overdueTasks = tasks?.filter(task => 
    task.status !== 'done' && 
    task.due_date && 
    new Date(task.due_date) < now
  ).length || 0

  return {
    totalTasks: tasks?.length || 0,
    completedTasks: tasks?.filter(t => t.status === 'done').length || 0,
    inProgressTasks: tasks?.filter(t => t.status === 'in_progress').length || 0,
    overdueTasks,
    totalProjects: projects?.length || 0,
  }
}

export async function getRecentTasks(limit = 5) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      projects (
        id,
        name,
        color
      ),
      assignee:profiles!tasks_assigned_to_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent tasks:', error)
    return []
  }

  return data || []
}

export async function getOverdueTasks() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      projects (
        id,
        name,
        color
      ),
      assignee:profiles!tasks_assigned_to_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .not('status', 'eq', 'done')
    .not('due_date', 'is', null)
    .lt('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching overdue tasks:', error)
    return []
  }

  return data || []
}
