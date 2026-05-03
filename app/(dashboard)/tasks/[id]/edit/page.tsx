import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTask } from '@/lib/actions/tasks'
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

interface EditTaskPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params
  const [task, projects] = await Promise.all([
    getTask(id),
    getProjects(),
  ])

  if (!task) {
    notFound()
  }

  // Get project members for the task's project
  const supabase = await createClient()
  const { data } = await supabase
    .from('project_members')
    .select('profiles(id, full_name)')
    .eq('project_id', task.project_id)
  
  const members = data?.map(m => ({
    id: (m.profiles as { id: string; full_name: string }).id,
    full_name: (m.profiles as { id: string; full_name: string }).full_name,
  })) || []

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
              <BreadcrumbPage>Edit Task</BreadcrumbPage>
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
          task={task}
          projects={projects} 
          members={members}
          isEditing
        />
      </div>
    </div>
  )
}
