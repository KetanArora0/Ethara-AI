import Link from 'next/link'
import { getProjects } from '@/lib/actions/projects'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { FolderKanban, Plus, Users } from 'lucide-react'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Projects</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              Manage your projects and team members
            </p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 size-4" />
              New Project
            </Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderKanban className="size-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first project to start organizing tasks and collaborating with your team.
              </p>
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="mr-2 size-4" />
                  Create Your First Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group block"
              >
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="size-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground" />
                        <div className="flex -space-x-2">
                          {project.project_members?.slice(0, 3).map((member) => (
                            <Avatar key={member.id} className="size-7 border-2 border-background">
                              <AvatarImage src={member.profiles?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {member.profiles?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {project.project_members && project.project_members.length > 3 && (
                            <div className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                              +{project.project_members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground ml-auto">
                        {project.project_members?.length || 0} member{project.project_members?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
