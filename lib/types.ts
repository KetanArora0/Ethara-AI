export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type MemberRole = 'admin' | 'member'

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: MemberRole
  joined_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  project_id: string
  assigned_to: string | null
  created_by: string
  due_date: string | null
  created_at: string
  updated_at: string
}

// Extended types with relations
export interface ProjectWithMembers extends Project {
  project_members: (ProjectMember & { profiles: Profile })[]
  tasks?: Task[]
}

export interface TaskWithRelations extends Task {
  projects?: Project
  assignee?: Profile
  creator?: Profile
}

export interface ProjectMemberWithProfile extends ProjectMember {
  profiles: Profile
}

// Dashboard statistics
export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  totalProjects: number
}
