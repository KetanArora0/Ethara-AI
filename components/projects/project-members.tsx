'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MoreHorizontal, Shield, User, UserPlus, Trash2, Loader2 } from 'lucide-react'
import { addProjectMember, updateMemberRole, removeProjectMember } from '@/lib/actions/projects'
import type { ProjectWithMembers, ProjectMemberWithProfile, MemberRole } from '@/lib/types'

interface ProjectMembersProps {
  project: ProjectWithMembers
  members: ProjectMemberWithProfile[]
  isAdmin: boolean
}

export function ProjectMembers({ project, members, isAdmin }: ProjectMembersProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddMember = async () => {
    if (!email.trim()) return
    
    setIsPending(true)
    setError(null)
    
    const result = await addProjectMember(project.id, email.trim())
    
    if (result.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      setEmail('')
      setIsAddDialogOpen(false)
      setIsPending(false)
    }
  }

  const handleRoleChange = async (memberId: string, role: MemberRole) => {
    await updateMemberRole(memberId, project.id, role)
  }

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      await removeProjectMember(memberId, project.id)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage who has access to this project
          </CardDescription>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 size-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Search for a user by name to add them to this project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="member-search">Search by name</Label>
                  <Input
                    id="member-search"
                    placeholder="Enter user name..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={isPending || !email.trim()}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Member'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card"
            >
              <Avatar className="size-10">
                <AvatarImage src={member.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {member.profiles?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {member.profiles?.full_name || 'Unknown User'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={member.role === 'admin' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {member.role === 'admin' ? (
                      <Shield className="mr-1 size-3" />
                    ) : (
                      <User className="mr-1 size-3" />
                    )}
                    {member.role}
                  </Badge>
                </div>
              </div>
              {isAdmin && members.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role === 'member' ? (
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                        <Shield className="mr-2 size-4" />
                        Make Admin
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')}>
                        <User className="mr-2 size-4" />
                        Make Member
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
