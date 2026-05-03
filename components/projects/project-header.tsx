import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/lib/types'

interface ProjectHeaderProps {
  project: Project
  isAdmin: boolean
}

export function ProjectHeader({ project, isAdmin }: ProjectHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="size-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {isAdmin && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Admin
                </Badge>
              )}
            </div>
            {project.description && (
              <p className="text-muted-foreground mt-2">{project.description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
