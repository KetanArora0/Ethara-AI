import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject, getUserRole } from '@/lib/actions/projects'
import { getTasks } from '@/lib/actions/tasks'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Plus } from 'lucide-react'
import { ProjectHeader } from '@/components/projects/project-header'
import { ProjectTasks } from '@/components/projects/project-tasks'
import { ProjectMembers } from '@/components/projects/project-members'
import { ProjectSettings } from '@/components/projects/project-settings'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const [project, tasks, userRole] = await Promise.all([
    getProject(id),
    getTasks(id),
    getUserRole(id),
  ])

  if (!project) {
    notFound()
  }

  const isAdmin = userRole === 'admin'

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 p-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/projects">
            <ArrowLeft className="mr-2 size-4" />
            Back to Projects
          </Link>
        </Button>

        <ProjectHeader project={project} isAdmin={isAdmin} />

        <Tabs defaultValue="tasks" className="mt-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              {isAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
            </TabsList>
            <Button asChild>
              <Link href={`/tasks/new?projectId=${project.id}`}>
                <Plus className="mr-2 size-4" />
                Add Task
              </Link>
            </Button>
          </div>

          <TabsContent value="tasks" className="mt-6">
            <ProjectTasks tasks={tasks} projectId={project.id} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <ProjectMembers 
              project={project} 
              members={project.project_members || []} 
              isAdmin={isAdmin} 
            />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="settings" className="mt-6">
              <ProjectSettings project={project} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
