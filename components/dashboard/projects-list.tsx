import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowRight, FolderKanban, Plus, Users } from 'lucide-react'
import type { ProjectWithMembers } from '@/lib/types'

interface ProjectsListProps {
  projects: ProjectWithMembers[]
}

export function ProjectsList({ projects }: ProjectsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="size-5 text-primary" />
          Your Projects
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects/new" className="flex items-center gap-1">
              <Plus className="size-4" />
              New Project
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects" className="flex items-center gap-1">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderKanban className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No projects yet</p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              Create your first project to start managing tasks
            </p>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 size-4" />
                Create Project
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group block rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="size-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Users className="size-4 text-muted-foreground" />
                  <div className="flex -space-x-2">
                    {project.project_members?.slice(0, 4).map((member) => (
                      <Avatar key={member.id} className="size-6 border-2 border-background">
                        <AvatarImage src={member.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.profiles?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.project_members && project.project_members.length > 4 && (
                      <div className="size-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                        +{project.project_members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {project.project_members?.length || 0} member{project.project_members?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
