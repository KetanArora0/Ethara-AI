'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Project } from '@/lib/types'

export async function getProjects() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (
        id,
        user_id,
        role,
        joined_at,
        profiles (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}

export async function getProject(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (
        id,
        user_id,
        role,
        joined_at,
        profiles (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return data
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const color = formData.get('color') as string || '#3B82F6'

  if (!name) {
    return { error: 'Project name is required' }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      color,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/projects')
  return { data }
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const color = formData.get('color') as string

  const updateData: Partial<Project> = {}
  if (name) updateData.name = name
  if (description !== null) updateData.description = description
  if (color) updateData.color = color

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating project:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  return { success: true }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/projects')
  return { success: true }
}

export async function addProjectMember(projectId: string, email: string, role: 'admin' | 'member' = 'member') {
  const supabase = await createClient()
  
  // First find the user by email
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .ilike('full_name', `%${email}%`)
    .limit(1)

  if (!profiles || profiles.length === 0) {
    return { error: 'User not found' }
  }

  const { error } = await supabase
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: profiles[0].id,
      role,
    })

  if (error) {
    if (error.code === '23505') {
      return { error: 'User is already a member of this project' }
    }
    console.error('Error adding member:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function updateMemberRole(memberId: string, projectId: string, role: 'admin' | 'member') {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('project_members')
    .update({ role })
    .eq('id', memberId)

  if (error) {
    console.error('Error updating member role:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function removeProjectMember(memberId: string, projectId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('id', memberId)

  if (error) {
    console.error('Error removing member:', error)
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function getUserRole(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()

  return data?.role || null
}
