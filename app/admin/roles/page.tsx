"use client"

import { useState } from "react"
import { Shield, Plus, Edit, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  isSystem: boolean
  permissions: string[]
  userCount: number
}

const allPermissions: Permission[] = [
  // Meetings
  { id: "meetings.create", name: "Create Meetings", description: "Create new meetings", category: "Meetings" },
  { id: "meetings.edit", name: "Edit Meetings", description: "Edit meeting details", category: "Meetings" },
  { id: "meetings.delete", name: "Delete Meetings", description: "Delete meetings", category: "Meetings" },
  { id: "meetings.record", name: "Record Meetings", description: "Start/stop recordings", category: "Meetings" },
  { id: "meetings.host", name: "Host Meetings", description: "Host and manage live meetings", category: "Meetings" },
  // Events
  { id: "events.create", name: "Create Events", description: "Create new events", category: "Events" },
  { id: "events.edit", name: "Edit Events", description: "Edit event details", category: "Events" },
  { id: "events.delete", name: "Delete Events", description: "Delete events", category: "Events" },
  { id: "events.publish", name: "Publish Events", description: "Publish events publicly", category: "Events" },
  // Users
  { id: "users.view", name: "View Users", description: "View user list", category: "Users" },
  { id: "users.create", name: "Create Users", description: "Create new users", category: "Users" },
  { id: "users.edit", name: "Edit Users", description: "Edit user details", category: "Users" },
  { id: "users.delete", name: "Delete Users", description: "Delete users", category: "Users" },
  { id: "users.roles", name: "Manage Roles", description: "Assign roles to users", category: "Users" },
  // Settings
  { id: "settings.view", name: "View Settings", description: "View organization settings", category: "Settings" },
  { id: "settings.edit", name: "Edit Settings", description: "Modify organization settings", category: "Settings" },
  { id: "settings.billing", name: "Manage Billing", description: "View and manage billing", category: "Settings" },
  // Analytics
  { id: "analytics.view", name: "View Analytics", description: "View analytics dashboard", category: "Analytics" },
  { id: "analytics.export", name: "Export Analytics", description: "Export analytics data", category: "Analytics" },
]

const mockRoles: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to all features",
    isSystem: true,
    permissions: allPermissions.map((p) => p.id),
    userCount: 2,
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Can manage meetings and events",
    isSystem: true,
    permissions: [
      "meetings.create", "meetings.edit", "meetings.host", "meetings.record",
      "events.create", "events.edit", "events.publish",
      "users.view", "analytics.view",
    ],
    userCount: 5,
  },
  {
    id: "member",
    name: "Member",
    description: "Standard user with basic permissions",
    isSystem: true,
    permissions: [
      "meetings.create", "meetings.host",
      "events.create",
      "analytics.view",
    ],
    userCount: 48,
  },
  {
    id: "guest",
    name: "Guest",
    description: "Limited access for external users",
    isSystem: true,
    permissions: [],
    userCount: 12,
  },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const permissionsByCategory = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = []
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  const handleCreateRole = () => {
    setEditingRole({
      id: "",
      name: "",
      description: "",
      isSystem: false,
      permissions: [],
      userCount: 0,
    })
    setIsDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole({ ...role })
    setIsDialogOpen(true)
  }

  const handleSaveRole = () => {
    if (!editingRole) return

    if (editingRole.id) {
      setRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? editingRole : r))
      )
    } else {
      setRoles((prev) => [
        ...prev,
        { ...editingRole, id: `role_${Date.now()}` },
      ])
    }
    setIsDialogOpen(false)
    setEditingRole(null)
  }

  const togglePermission = (permId: string) => {
    if (!editingRole) return
    setEditingRole((prev) => {
      if (!prev) return prev
      const hasPermission = prev.permissions.includes(permId)
      return {
        ...prev,
        permissions: hasPermission
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId],
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage user roles and their permissions
          </p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
                {role.isSystem && (
                  <Badge variant="secondary">System</Badge>
                )}
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Users</span>
                  <span className="font-medium">{role.userCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Permissions</span>
                  <span className="font-medium">{role.permissions.length}</span>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditRole(role)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {!role.isSystem && (
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions Matrix</CardTitle>
          <CardDescription>
            Overview of permissions assigned to each role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Permission</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center w-28">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <>
                    <TableRow key={category} className="bg-muted/50">
                      <TableCell colSpan={roles.length + 1} className="font-medium">
                        {category}
                      </TableCell>
                    </TableRow>
                    {perms.map((perm) => (
                      <TableRow key={perm.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{perm.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {perm.description}
                            </p>
                          </div>
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            {role.permissions.includes(perm.id) ? (
                              <Check className="h-4 w-4 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole?.id ? "Edit Role" : "Create Role"}
            </DialogTitle>
            <DialogDescription>
              Configure role details and assign permissions
            </DialogDescription>
          </DialogHeader>

          {editingRole && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={editingRole.name}
                    onChange={(e) =>
                      setEditingRole((prev) =>
                        prev ? { ...prev, name: e.target.value } : prev
                      )
                    }
                    disabled={editingRole.isSystem}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editingRole.description}
                    onChange={(e) =>
                      setEditingRole((prev) =>
                        prev ? { ...prev, description: e.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Permissions</Label>
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {category}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {perms.map((perm) => (
                        <div
                          key={perm.id}
                          className="flex items-start space-x-2 p-2 rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox
                            id={perm.id}
                            checked={editingRole.permissions.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <label htmlFor={perm.id} className="flex-1 cursor-pointer">
                            <p className="text-sm font-medium">{perm.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {perm.description}
                            </p>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>Save Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
