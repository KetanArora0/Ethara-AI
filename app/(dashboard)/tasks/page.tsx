import Link from 'next/link'
import { getTasks } from '@/lib/actions/tasks'
import { getProjects } from '@/lib/actions/projects'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Plus } from 'lucide-react'
import { TasksTable } from '@/components/tasks/tasks-table'
import { TasksFilters } from '@/components/tasks/tasks-filters'

interface TasksPageProps {
  searchParams: Promise<{
    status?: string
    priority?: string
    project?: string
  }>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams
  const [tasks, projects] = await Promise.all([
    getTasks(),
    getProjects(),
  ])

  // Apply client-side filtering based on searchParams
  let filteredTasks = tasks

  if (params.status) {
    filteredTasks = filteredTasks.filter((task) => task.status === params.status)
  }

  if (params.priority) {
    filteredTasks = filteredTasks.filter((task) => task.priority === params.priority)
  }

  if (params.project) {
    filteredTasks = filteredTasks.filter((task) => task.project_id === params.project)
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Tasks</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">
              View and manage all your tasks across projects
            </p>
          </div>
          <Button asChild>
            <Link href="/tasks/new">
              <Plus className="mr-2 size-4" />
              New Task
            </Link>
          </Button>
        </div>

        <TasksFilters projects={projects} />
        
        <TasksTable tasks={filteredTasks} />
      </div>
    </div>
  )
}
