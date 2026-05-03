import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getProjects } from '@/lib/actions/projects'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ArrowLeft } from 'lucide-react'
import { TaskForm } from '@/components/tasks/task-form'

interface NewTaskPageProps {
  searchParams: Promise<{
    projectId?: string
  }>
}

export default async function NewTaskPage({ searchParams }: NewTaskPageProps) {
  const params = await searchParams
  const projects = await getProjects()
  
  // Get project members for the selected project
  const supabase = await createClient()
  let members: { id: string; full_name: string }[] = []
  
  if (params.projectId) {
    const { data } = await supabase
      .from('project_members')
      .select('profiles(id, full_name)')
      .eq('project_id', params.projectId)
    
    members = data?.map(m => ({
      id: (m.profiles as { id: string; full_name: string }).id,
      full_name: (m.profiles as { id: string; full_name: string }).full_name,
    })) || []
  }

  if (projects.length === 0) {
    redirect('/projects/new')
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/tasks">Tasks</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Task</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 p-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/tasks">
            <ArrowLeft className="mr-2 size-4" />
            Back to Tasks
          </Link>
        </Button>

        <TaskForm 
          projects={projects} 
          members={members}
          defaultProjectId={params.projectId}
        />
      </div>
    </div>
  )
}
